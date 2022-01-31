import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { __ } from 'modules/common/utils';
import React from 'react';
import { LeftItem } from 'modules/common/components/step/styles';
import { FlexItem } from './style';

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
