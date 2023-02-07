import React from 'react';
import {
  Button,
  ControlLabel,
  Form as CommonForm,
  FormControl,
  FormGroup,
  SelectTeamMembers,
  __
} from '@erxes/ui/src';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { SelectOperation } from '../../common/utils';
import { ModalFooter } from '@erxes/ui/src/styles/main';

type Props = {
  operation?: any;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  operation: any;
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      operation: props?.operation || {}
    };

    this.renderForm = this.renderForm.bind(this);
  }
  generateDoc(values) {
    const { operation } = this.state;

    return { ...values, ...operation };
  }

  renderForm(formProps: IFormProps) {
    const { operation } = this.state;
    const { renderButton, closeModal } = this.props;

    const onChangeParent = value => {
      operation.parentId = value;

      this.setState({ operation });
    };

    const handleChange = e => {
      const { operation } = this.state;
      const { name, value } = e.currentTarget as HTMLInputElement;
      operation[name] = value;
      this.setState({ operation });
    };

    const handleTeamMember = values => {
      this.setState({ operation: { ...operation, teamMemberIds: values } });
    };

    return (
      <>
        <FormGroup>
          <ControlLabel>{__('Name')}</ControlLabel>
          <FormControl
            {...formProps}
            type="text"
            name="name"
            value={operation?.name}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Description')}</ControlLabel>
          <FormControl
            {...formProps}
            componentClass="textarea"
            name="description"
            value={operation?.description}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Code')}</ControlLabel>
          <FormControl
            {...formProps}
            type="text"
            name="code"
            value={operation?.code}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Team Members')}</ControlLabel>
          <SelectTeamMembers
            name="teamMemberIds"
            label="Choose team members"
            initialValue={operation?.teamMemberIds}
            onSelect={handleTeamMember}
            multi={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Parent')}</ControlLabel>
          <SelectOperation
            name="parentId"
            label="Choose Operation"
            multi={false}
            initialValue={operation?.parentId}
            onSelect={onChangeParent}
            operation={operation}
          />
        </FormGroup>
        <ModalFooter>
          <Button btnStyle="simple">{__('Close')}</Button>
          {renderButton({
            text: 'Operation',
            values: this.generateDoc(formProps.values),
            callback: closeModal,
            isSubmitted: formProps.isSubmitted,
            object: this.props.operation
          })}
        </ModalFooter>
      </>
    );
  }

  render() {
    return <CommonForm renderContent={this.renderForm} />;
  }
}

export default Form;
