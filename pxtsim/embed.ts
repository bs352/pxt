/// <reference path="../localtypings/pxtparts.d.ts"/>

namespace pxsim {
    export interface SimulatorRunMessage extends SimulatorMessage {
        type: "run";
        id?: string;
        boardDefinition?: BoardDefinition;
        frameCounter?: number;
        options?: any;
        parts?: string[];
        partDefinitions?: Map<PartDefinition>
        fnArgs?: any;
        code: string;
        mute?: boolean;
        highContrast?: boolean;
        cdnUrl?: string;
        localizedStrings?: Map<string>;
    }

    export interface SimulatorMuteMessage extends SimulatorMessage {
        type: "mute";
        mute: boolean;
    }

    export interface SimulatorDocMessage extends SimulatorMessage {
        docType?: string;
        src?: string;
        localToken?: string;
    }

    export interface SimulatorFileLoadedMessage extends SimulatorMessage {
        name: string;
        locale: string;
        content?: string;
    }

    export interface SimulatorReadyMessage extends SimulatorMessage {
        type: "ready";
        frameid: string;
    }

    export interface SimulatorTopLevelCodeFinishedMessage extends SimulatorMessage {
        type: "toplevelcodefinished";
    }

    export interface SimulatorDocsReadyMessage extends SimulatorMessage {
    }

    export interface SimulatorStateMessage extends SimulatorMessage {
        frameid?: string;
        runtimeid?: string;
        state: string;
    }

    export interface SimulatorEventBusMessage extends SimulatorMessage {
        id: number;
        eventid: number;
        value?: number;
    }
    export interface SimulatorSerialMessage extends SimulatorMessage {
        id: string;
        data: string;
        sim?: boolean;
    }
    export interface SimulatorCommandMessage extends SimulatorMessage {
        type: "simulator",
        command: "modal" | "restart"
        header?: string;
        body?: string;
        copyable?: string;
        linkButtonHref?: string;
        linkButtonLabel?: string;
        displayOnceId?: string; // An id for the modal command, if the sim wants the modal to be displayed only once in the session
        modalContext?: string; // Modal context of where to show the modal
    }
    export interface SimulatorRadioPacketMessage extends SimulatorMessage {
        type: "radiopacket";
        rssi: number;
        serial: number;
        time: number;

        payload: SimulatorRadioPacketPayload;
    }
    export interface SimulatorInfraredPacketMessage extends SimulatorMessage {
        type: "irpacket";
        packet: Uint8Array; // base64 encoded
    }

    export interface SimulatorRadioPacketPayload {
        type: number;
        groupId: number;
        stringData?: string;
        numberData?: number;
    }

    export interface SimulatorCustomMessage extends SimulatorMessage {
        type: "custom";
        content: any;
    }

    export interface SimulatorScreenshotMessage extends SimulatorMessage {
        type: "screenshot";
        data: string;
    }

    export interface TutorialMessage extends SimulatorMessage {
        type: "tutorial";
        tutorial: string;
        subtype: string;
    }

    export interface TutorialStepInfo {
        fullscreen?: boolean;
        hasHint?: boolean;
        content?: string;
        headerContent?: string;
        ariaLabel?: string;
    }

    export interface TutorialLoadedMessage extends TutorialMessage {
        subtype: "loaded";
        showCategories?: boolean;
        stepInfo: TutorialStepInfo[];
        toolboxSubset?: { [index: string]: number };
    }

    export interface TutorialStepChangeMessage extends TutorialMessage {
        subtype: "stepchange";
        step: number;
    }

    export interface TutorialFailedMessage extends TutorialMessage {
        subtype: "error";
        message?: string;
    }

    export namespace Embed {
        export function start() {
            window.addEventListener("message", receiveMessage, false);
            let frameid = window.location.hash.slice(1)
            Runtime.postMessage(<SimulatorReadyMessage>{ type: 'ready', frameid: frameid });
        }

        function receiveMessage(event: MessageEvent) {
            let origin = event.origin; // || (<any>event).originalEvent.origin;
            // TODO: test origins

            let data: SimulatorMessage = event.data || {};
            let type = data.type || '';
            if (!type) return;
            switch (type || '') {
                case 'run': run(<SimulatorRunMessage>data); break;
                case 'stop': stop(); break;
                case 'mute': mute((<SimulatorMuteMessage>data).mute); break;
                case 'custom':
                    if (handleCustomMessage) handleCustomMessage((<SimulatorCustomMessage>data));
                    break;
                case 'pxteditor':
                    break; //handled elsewhere
                case 'debugger':
                    if (runtime) {
                        runtime.handleDebuggerMsg(data as DebuggerMessage);
                    }
                    break;
                default: queue(data); break;
            }
        }

        // TODO remove this; this should be using Runtime.runtime which gets
        // set correctly depending on which runtime is currently running
        let runtime: pxsim.Runtime;

        export function stop() {
            if (runtime) {
                runtime.kill();
                if (runtime.board)
                    runtime.board.kill();
            }
        }

        export function run(msg: SimulatorRunMessage) {
            stop();

            if (msg.mute) mute(msg.mute);

            if (msg.localizedStrings) {
                pxsim.localization.setLocalizedStrings(msg.localizedStrings);
            }
            runtime = new Runtime(msg);
            runtime.board.initAsync(msg)
                .done(() => {
                    runtime.run((v) => {
                        pxsim.dumpLivePointers();
                        Runtime.postMessage({ type: "toplevelcodefinished" })
                    });
                });
        }

        function mute(mute: boolean) {
            AudioContextManager.mute(mute);
        }

        function queue(msg: SimulatorMessage) {
            if (!runtime || runtime.dead) {
                return;
            }
            runtime.board.receiveMessage(msg);
        }

    }

    /**
     * Log an event to the parent editor (allowSimTelemetry must be enabled in target)
     * @param id The id of the event
     * @param data Any custom values associated with this event
     */
    export function tickEvent(id: string, data?: Map<string | number>) {
        postMessageToEditor({
            type: "pxtsim",
            action: "event",
            tick: id,
            data
        });
    }

    /**
     * Log an error to the parent editor (allowSimTelemetry must be enabled in target)
     * @param cat The category of the error
     * @param msg The error message
     * @param data Any custom values associated with this event
     */
    export function reportError(cat: string, msg: string, data?: Map<string>) {
        postMessageToEditor({
            type: "pxtsim",
            action: "event",
            tick: "error",
            category: cat,
            message: msg,
            data
        });
    }

    function postMessageToEditor(message: any) {
        if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
            window.parent.postMessage(message, "*");
        }
    }
}

pxsim.util.injectPolyphils();
if (typeof window !== 'undefined') {
    window.addEventListener('load', function (ev) {
        pxsim.Embed.start();
    });
}
