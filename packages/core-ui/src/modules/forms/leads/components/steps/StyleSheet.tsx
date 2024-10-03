
import { FlexItem } from "@erxes/ui/src/components/step/style";
import { LeftItem } from "@erxes/ui/src/components/step/styles";

import React from "react";

import FormControl from "../../../../common/components/form/Control";
import FormGroup from "../../../../common/components/form/Group";
import ControlLabel from "../../../../common/components/form/Label";
import { __ } from "modules/common/utils";

type Props = {
  onChange: (name: "css", value: string) => void;
  css?: string;
};

class StyleSheetStep extends React.Component<Props, {}> {
  onChange = (e) => {
    this.props.onChange("css", (e.currentTarget as HTMLInputElement).value);
  };

  render() {
    const { css } = this.props;

    return (
      <FlexItem>
        <LeftItem>
          <FormGroup>
            <ControlLabel>Custom stylesheet</ControlLabel>
            <p>
              {__(
                "Add or overwrite default theme styles with your own custom css"
              )}
              .
            </p>
            <FormControl
              id="css"
              componentclass="textarea"
              value={css}
              onChange={this.onChange}
            />
          </FormGroup>
        </LeftItem>
      </FlexItem>
    );
  }
}

export default StyleSheetStep;
