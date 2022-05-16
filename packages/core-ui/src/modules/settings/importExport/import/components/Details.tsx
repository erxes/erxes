import React from 'react';

import { FlexItem, FlexPad } from 'modules/common/components/step/styles';
import { InputBar } from '@erxes/ui-settings/src/styles';
import {
  ControlLabel,
  FormControl,
  FormGroup
} from '@erxes/ui/src/components/form';
import { __ } from '@erxes/ui/src/utils';
import { ImportHeader } from '../../styles';

type Props = {
  disclaimer: boolean;
  importName: string;
  type?: string;

  onChangeImportName: (value) => void;
  onChangeDisclaimer: (value) => void;
};

class Details extends React.Component<Props, {}> {
  onChangeName = e => {
    const value = (e.currentTarget as HTMLInputElement).value;

    this.props.onChangeImportName(value);
  };

  onChangeDisclaimer = e => {
    const value = e.target.checked;

    this.props.onChangeDisclaimer(value);
  };

  render() {
    const { disclaimer, importName, type } = this.props;
    return (
      <FlexItem>
        <FlexPad
          type={type}
          direction="column"
          overflow="auto"
          value={importName}
        >
          <FormGroup>
            <ImportHeader>
              {__(
                'Giving it a name helps with identifying items in the imports history.'
              )}
              .
            </ImportHeader>
            <InputBar>
              <FormControl
                required={true}
                name="title"
                value={importName}
                onChange={this.onChangeName}
                placeholder={__('Import Name')}
              />
            </InputBar>
          </FormGroup>

          <FormGroup>
            <FormControl
              componentClass="checkbox"
              required={true}
              name="title"
              checked={disclaimer}
              onChange={this.onChangeDisclaimer}
            />
            <ControlLabel required={true}>{__('Disclaimer')}</ControlLabel>

            <p>
              {__(
                `I agree that all contacts in this import are expecting to hear from my organization. I have a prior relationship with these contacts and have emailed them at least once in the past year. I can confirm this list wasn't purchased, rented, appended, or provided by a third party`
              )}
              .
            </p>
          </FormGroup>
        </FlexPad>
      </FlexItem>
    );
  }
}

export default Details;
