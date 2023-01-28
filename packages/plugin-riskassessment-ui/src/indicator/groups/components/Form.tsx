import React from 'react';
import { IIndicatorsGroups } from '../common/types';
import {
  Button,
  confirm,
  ControlLabel,
  Form as CommonForm,
  FormControl,
  FormGroup,
  __
} from '@erxes/ui/src';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { FormContainer } from '../../../styles';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import GroupingIndicators from './GroupingIndicators';

type Props = {
  detail?: IIndicatorsGroups;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  detail: IIndicatorsGroups;
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      detail: props.detail || {}
    };

    this.renderContent = this.renderContent.bind(this);
  }

  generateDoc(values) {
    const { detail } = this.state;
    console.log({ detail });
    return { ...values, ...detail };
  }

  renderContent(formProps: IFormProps) {
    const { detail } = this.state;

    const { values, isSubmitted } = formProps;

    const handleClose = () => {
      // confirm(
      //   'Are you sure you want to close.You will lose your filled data if you close the form '
      // ).then(() => {
      this.props.closeModal();
      // });
    };

    const handleChange = doc => {
      this.setState({ detail: { ...this.props.detail, ...doc } });
    };

    return (
      <FormContainer column gap>
        <FormGroup>
          <ControlLabel>{__('Name')}</ControlLabel>
          <FormControl
            {...formProps}
            type="text"
            name="name"
            value={detail?.name}
            required
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Description')}</ControlLabel>
          <FormControl
            {...formProps}
            componentClass="textarea"
            name="description"
            value={detail?.name}
            required
          />
        </FormGroup>
        <GroupingIndicators
          handleChange={handleChange}
          indicatorGroups={detail.groups}
          generalConfig={{
            calculateLogics: detail.calculateLogics,
            calculateMethod: detail.calculateMethod
          }}
        />
        <ModalFooter>
          <Button btnStyle="simple">{__('Cancel')}</Button>
          {this.props.renderButton({
            text: 'Indicators Groups',
            values: this.generateDoc(values),
            isSubmitted,
            callback: handleClose,
            object: this.props.detail
          })}
        </ModalFooter>
      </FormContainer>
    );
  }

  render() {
    return <CommonForm renderContent={this.renderContent} />;
  }
}

export default Form;
