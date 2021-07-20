import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import React from 'react';
import SelectBrand from '../../containers/SelectBrand';
import SelectChannels from '../../containers/SelectChannels';

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
