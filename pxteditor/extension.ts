namespace pxt.editor {
    export interface DataStreams<T> {
        serial?: T;
    }

    export interface Permissions<T> {
        serial?: T;
        readUserCode?: T;
    }

    export interface ExtensionFiles {
        code?: string;
        json?: string;
    }

    export enum PermissionResponses {
        Granted,
        Denied,
        NotAvailable
    }

    export interface ExtensionMessage extends EditorMessage {
        type: "pxtpkgext";
    }

    export interface ExtensionResponse extends EditorMessageResponse {
        type: "pxtpkgext";
        extId: string;
    }

    export interface ExtensionRequest extends EditorMessageRequest {
        type: "pxtpkgext";
        extId: string;
        body?: any;
    }

    /**
     * Events are fired by the editor on the extension iFrame. Extensions
     * receive events, they don't send them.
     */
    export interface ExtensionEvent extends ExtensionMessage {
        event: string;
    }

    /**
     * Event fired when the extension becomes visible.
     */
    export interface ShownEvent extends ExtensionEvent {
        event: "extshown";
    }

    /**
     * Event fired when the extension becomes hidden.
     */
    export interface HiddenEvent extends ExtensionEvent {
        event: "exthidden";
        body: HiddenReason;
    }

    export type HiddenReason = "useraction" | "other";

    /**
     * Event fired when serial data is received
     */
    export interface SerialEvent extends ExtensionEvent {
        event: "extserial";
        body: string;
    }

    /**
     * Event fired when extension is first shown. Extension
     * should send init request in response
     */
    export type ExtInitializeType = "extinit";

    export interface InitializeRequest extends ExtensionRequest {
        action: ExtInitializeType;
        body: string;
    }

    export interface InitializeResponse extends ExtensionResponse {
    }

    /**
     * Requests data stream event to be fired. Permission will
     * be requested if not already received.
     */
    export type ExtDataStreamType = "extdatastream";

    export interface DataStreamRequest extends ExtensionRequest {
        action: ExtDataStreamType;
        body: DataStreams<boolean>;
    }

    export interface DataStreamResponse extends ExtensionResponse {
        resp: DataStreams<PermissionResponses>;
    }

    /**
     * Queries the current permissions granted to the extension.
     */
    export type ExtQueryPermissionType = "extquerypermission";

    export interface QueryPermissionRequest extends ExtensionRequest {
        action: ExtQueryPermissionType;
    }

    export interface QueryPermissionResponse extends ExtensionResponse {
        resp: Permissions<PermissionResponses>;
    }

    /**
     * Prompts the user for the specified permission
     */
    export type ExtRequestPermissionType = "extrequestpermission";

    export interface PermissionRequest extends ExtensionRequest {
        action: ExtRequestPermissionType;
        body: Permissions<boolean>;
    }

    export interface PermissionResponse extends ExtensionResponse {
        resp: Permissions<PermissionResponses>;
    }

    /**
     * Request to read the user's code. Will request permission if
     * not already granted
     */
    export type ExtUserCodeType = "extusercode";

    export interface UserCodeRequest extends ExtensionRequest {
        action: ExtUserCodeType;
    }

    export interface UserCodeResponse extends ExtensionResponse {
        /* A mapping of file names to their contents */
        resp?: { [index: string]: string };
    }

    /**
     * Request to read the files saved by this extension
     */
    export type ExtReadCodeType = "extreadcode";

    export interface ReadCodeRequest extends ExtensionRequest {
        action: ExtReadCodeType;
    }

    export interface ReadCodeResponse extends ExtensionResponse {
        action: ExtReadCodeType;

        body?: ExtensionFiles;
    }

    /**
     * Request to write the JSON and/or TS files saved
     * by this extension
     */
    export type ExtWriteCodeType = "extwritecode";

    export interface WriteCodeRequest extends ExtensionRequest {
        action: ExtWriteCodeType;

        body?: ExtensionFiles;
    }

    export interface WriteCodeResponse extends ExtensionResponse {
    }
}