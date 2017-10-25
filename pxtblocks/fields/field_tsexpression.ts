/// <reference path="../../localtypings/blockly.d.ts" />

namespace pxtblockly {
    export class FieldTsExpression extends Blockly.FieldTextInput implements Blockly.FieldCustom {
        public isFieldCustom_ = true;

        /**
         * Same as parent, but adds a different class to text when disabled
         */
        public updateEditable() {
            var group = this.fieldGroup_;
            if (!this.EDITABLE || !group) {
              return;
            }
            if (this.sourceBlock_.isEditable()) {
              Blockly.utils.addClass(group, 'blocklyEditableText');
              Blockly.utils.removeClass(group, 'blocklyGreyExpressionBlockText');
              (this.fieldGroup_ as any).style.cursor = this.CURSOR;
            } else {
              Blockly.utils.addClass(group, 'blocklyGreyExpressionBlockText');
              Blockly.utils.removeClass(group, 'blocklyEditableText');
              (this.fieldGroup_ as any).style.cursor = '';
            }
        }
    }
}