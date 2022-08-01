import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';
import { INTEGRATION_KINDS } from '@erxes/ui/src/constants/integrations';
import SelectBrand from '@erxes/ui-settings/src/integrations/containers/SelectBrand';
import SelectChannels from '@erxes/ui-settings/src/integrations/containers/SelectChannels';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  channelIds: string[];
};

class TelnyxForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      channelIds: []
    };
  }

  onChangeChannel = (values: string[]) => {
    this.setState({ channelIds: values });
  };

  generateDoc = (values: {
    name: string;
    brandId: string;
    telnyxProfileId: string;
    telnyxPhoneNumber: string;
  }) => {
    return {
      name: values.name,
      brandId: values.brandId,
      kind: INTEGRATION_KINDS.TELNYX,
      channelIds: this.state.channelIds,
      data: {
        telnyxProfileId: values.telnyxProfileId,
        telnyxPhoneNumber: values.telnyxPhoneNumber
      }
    };
  };

  renderContent = (formProps: IFormProps) => {
    const { renderButton, closeModal } = this.props;
    const { values, isSubmitted } = formProps;

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>
          <FormControl
            {...formProps}
            name="name"
            required={true}
            autoFocus={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Telnyx messaging profile id</ControlLabel>
          <FormControl {...formProps} type="text" name="telnyxProfileId" />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Telnyx phone number</ControlLabel>
          <FormControl
            {...formProps}
            type="text"
            name="telnyxPhoneNumber"
            required={true}
          />
        </FormGroup>

        <SelectBrand
          isRequired={true}
          formProps={formProps}
          description={__(
            'Which specific Brand does this integration belong to?'
          )}
        />
        <SelectChannels
          defaultValue={this.state.channelIds}
          isRequired={true}
          onChange={this.onChangeChannel}
        />
        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={closeModal}
            icon="times-circle"
          >
            Cancel
          </Button>
          {renderButton({
            name: 'integration',
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default TelnyxForm;
