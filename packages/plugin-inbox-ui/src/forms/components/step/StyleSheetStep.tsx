import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';
import { LeftItem } from '@erxes/ui/src/components/step/styles';
import { FlexItem } from '@erxes/ui/src/components/step/style';

type Props = {
  onChange: (name: 'css', value: string) => void;
  css?: string;
};

class StyleSheetStep extends React.Component<Props, {}> {
  onChange = e => {
    this.props.onChange('css', (e.currentTarget as HTMLInputElement).value);
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
                'Add or overwrite default theme styles with your own custom css'
              )}
              .
            </p>
            <FormControl
              id="css"
              componentClass="textarea"
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
