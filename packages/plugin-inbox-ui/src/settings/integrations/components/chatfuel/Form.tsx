import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';
import SelectBrand from '@erxes/ui-settings/src/integrations/containers/SelectBrand';
import SelectChannels from '@erxes/ui-settings/src/integrations/containers/SelectChannels';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  callback: () => void;
  onChannelChange: () => void;
  channelIds: string[];
};

class Chatfuel extends React.Component<Props> {
  generateDoc = (values: {
    name: string;
    code: string;
    broadcastToken: string;
    botId: string;
    blockName: string;
    brandId: string;
  }) => {
    return {
      name: `${values.name} - ${values.code}`,
      brandId: values.brandId,
      kind: 'chatfuel',
      data: {
        code: values.code,
        broadcastToken: values.broadcastToken,
        botId: values.botId,
        blockName: values.blockName
      }
    };
  };

  renderField = ({
    label,
    name,
    formProps
  }: {
    label: string;
    name: string;
    formProps: IFormProps;
  }) => {
    return (
      <FormGroup>
        <ControlLabel required={true}>{label}</ControlLabel>
        <FormControl
          {...formProps}
          name={name}
          required={true}
          autoFocus={name === 'name'}
        />
      </FormGroup>
    );
  };

  renderContent = (formProps: IFormProps) => {
    const { renderButton, callback, onChannelChange, channelIds } = this.props;
    const { values, isSubmitted } = formProps;

    return (
      <>
        {this.renderField({ label: 'Name', name: 'name', formProps })}
        {this.renderField({ label: 'Code', name: 'code', formProps })}
        {this.renderField({
          label: 'Broadcast token',
          name: 'broadcastToken',
          formProps
        })}
        {this.renderField({ label: 'Bot ID', name: 'botId', formProps })}
        {this.renderField({
          label: 'Block name',
          name: 'blockName',
          formProps
        })}

        <SelectBrand
          isRequired={true}
          formProps={formProps}
          description={__(
            'Which specific Brand does this integration belong to?'
          )}
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
            name: 'integration',
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

export default Chatfuel;
