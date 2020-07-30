import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import Spinner from 'modules/common/components/Spinner';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import React from 'react';
import SelectBrand from '../../containers/SelectBrand';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  callback: () => void;
};

class Chatfuel extends React.Component<Props, { loading: boolean }> {
  constructor(props: Props) {
    super(props);

    this.state = {
      loading: false
    };
  }

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
        <FormControl {...formProps} name={name} required={true} />
      </FormGroup>
    );
  };

  renderContent = (formProps: IFormProps) => {
    const { renderButton, callback } = this.props;
    const { values, isSubmitted } = formProps;

    return (
      <>
        {this.state.loading && <Spinner />}

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

        <SelectBrand isRequired={true} formProps={formProps} />

        <ModalFooter>
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
