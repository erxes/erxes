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
  closeModal: () => void;
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

  renderContent = (formProps: IFormProps) => {
    const { renderButton } = this.props;
    const { values, isSubmitted } = formProps;

    return (
      <>
        {this.state.loading && <Spinner />}
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>
          <FormControl {...formProps} name="name" required={true} />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Code</ControlLabel>
          <FormControl {...formProps} name="code" required={true} />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Broadcast token</ControlLabel>
          <FormControl {...formProps} name="broadcastToken" required={true} />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Bot ID</ControlLabel>
          <FormControl {...formProps} name="botId" required={true} />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Block name</ControlLabel>
          <FormControl {...formProps} name="blockName" required={true} />
        </FormGroup>

        <SelectBrand isRequired={true} formProps={formProps} />

        <ModalFooter>
          {renderButton({
            name: 'integration',
            values: this.generateDoc(values),
            isSubmitted,
            callback: this.props.closeModal
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
