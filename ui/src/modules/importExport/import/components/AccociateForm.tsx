import React from 'react';
import { ControlLabel, FormControl, FormGroup, __ } from 'erxes-ui';
import { FlexItem, FlexPad } from 'modules/common/components/step/styles';
import { SubHeading } from 'modules/settings/styles';

type Props = {};

class AccociateForm extends React.Component<Props, {}> {
  render() {
    return (
      <FlexItem>
        <FlexPad direction="column" overflow="auto">
          <SubHeading>{__('Choose how to associate your data')}</SubHeading>

          <FormGroup>
            <ControlLabel>
              {__('Common column headers found in your file')}
            </ControlLabel>
            <p>
              {__(
                'Choose which common column you want to use to associate your data.'
              )}
              .
            </p>
            <FormControl componentClass="select">
              <option />
              <option>CustomerEmail</option>
            </FormControl>
          </FormGroup>

          <FormGroup>
            <ControlLabel>
              {__('Which object is the unique key for')}
            </ControlLabel>
            <p>
              {__(
                'The common column between your files should also be the unique key for one of your objects. This unique key is used to associate objects based on individual data but only belongs to one object.'
              )}
              .
            </p>
            <FormControl componentClass="select">
              <option />
              <option key={Math.random()} value={'Customer'}>
                Customer
              </option>
              <option key={Math.random()} value={'Company'}>
                Company
              </option>
            </FormControl>
          </FormGroup>
        </FlexPad>
      </FlexItem>
    );
  }
}

export default AccociateForm;
