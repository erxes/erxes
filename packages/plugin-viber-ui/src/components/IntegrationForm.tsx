import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Form from '@erxes/ui/src/components/form/Form';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import React from 'react';
import SelectBrand from '@erxes/ui-inbox/src/settings/integrations/containers/SelectBrand';
import SelectChannels from '@erxes/ui-inbox/src/settings/integrations/containers/SelectChannels';
import { __ } from '@erxes/ui/src/utils/core';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  callback: () => void;
  onChannelChange: () => void;
  channelIds: string[];
};

class IntegrationForm extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  generateDoc = (values: { name: string; brandId: string; token: string }) => {
    return {
      name: values.name,
      brandId: values.brandId,
      kind: 'viber',
      data: {
        token: values.token
      }
    };
  };

  renderField = ({
    label,
    fieldName,
    formProps
  }: {
    label: string;
    fieldName: string;
    formProps: IFormProps;
  }) => {
    return (
      <FormGroup>
        <ControlLabel required={true}>{label}</ControlLabel>
        <FormControl
          {...formProps}
          name={fieldName}
          required={true}
          autoFocus={fieldName === 'name'}
        />
      </FormGroup>
    );
  };

  renderContent = (formProps: IFormProps) => {
    const { renderButton, callback, onChannelChange, channelIds } = this.props;
    const { values, isSubmitted } = formProps;

    return (
      <>
        <p>Please enter your Viber app info</p>

        {this.renderField({ label: 'Name', fieldName: 'name', formProps })}

        {this.renderField({ label: 'Token', fieldName: 'token', formProps })}

        <SelectBrand
          isRequired={true}
          formProps={formProps}
          description={'Which specific Brand does this integration belong to?'}
        />

        <SelectChannels
          defaultValue={channelIds}
          isRequired={true}
          onChange={onChannelChange}
        />

        <a
          href="https://partners.viber.com/login"
          target="_blank"
          rel="noreferrer"
        >
          {__('Get your viber token')}
        </a>

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={callback}
            icon="times-circle"
          >
            Cancel
          </Button>
          {renderButton({
            values: this.generateDoc(values),
            isSubmitted,
            callback
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default IntegrationForm;
