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
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  callback: () => void;
  onChannelChange: () => void;
  channelIds: string[];
};

type State = {
  operatorIds: string[];
};

class IntegrationForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { operatorIds: [] };
  }

  generateDoc = (values: {
    name: string;
    brandId: string;
    username: string;
    password: string;
    wsServer: string;
  }) => {
    return {
      name: values.name,
      brandId: values.brandId,
      kind: 'calls',
      data: {
        username: values.username,
        password: values.password,
        wsServer: values.wsServer,
        operatorIds: this.state.operatorIds
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

    const onChangeUsers = userIds => {
      this.setState({ operatorIds: userIds });
    };

    return (
      <>
        {this.renderField({ label: 'Name', fieldName: 'name', formProps })}

        {this.renderField({
          label: 'Username',
          fieldName: 'username',
          formProps
        })}
        {this.renderField({
          label: 'Password',
          fieldName: 'password',
          formProps
        })}
        {this.renderField({
          label: 'Phone number',
          fieldName: 'phone',
          formProps
        })}
        {this.renderField({
          label: 'Web socket server',
          fieldName: 'wsServer',
          formProps
        })}

        <FormGroup>
          <ControlLabel>Operators</ControlLabel>
          <SelectTeamMembers
            label="Choose operators"
            name="operatorIds"
            initialValue={[]}
            onSelect={onChangeUsers}
          />
        </FormGroup>

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
