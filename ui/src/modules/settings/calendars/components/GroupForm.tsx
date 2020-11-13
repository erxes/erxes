import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import React from 'react';
import { IGroup } from '../types';

type Props = {
  group?: IGroup;
  closeModal: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  history: any;
};

class GroupForm extends React.Component<Props, { isPrivate: boolean }> {
  constructor(props: Props) {
    super(props);

    const { group } = this.props;

    this.state = {
      isPrivate: group ? group.isPrivate : false
    };
  }

  onChangeIsPrivate = e => {
    const isChecked = (e.currentTarget as HTMLInputElement).checked;
    this.setState({ isPrivate: isChecked });
  };

  generateDoc = (values: {
    _id?: string;
    name: string;
    isPrivate: boolean;
  }) => {
    const { group } = this.props;
    const finalValues = values;

    if (group) {
      finalValues._id = group._id;
    }

    return { ...finalValues, isPrivate: this.state.isPrivate };
  };

  renderContent = (formProps: IFormProps) => {
    const { group, renderButton, closeModal } = this.props;
    const { values, isSubmitted } = formProps;
    const object = group || { name: '' };

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>

          <FormControl
            {...formProps}
            name="name"
            defaultValue={object.name}
            required={true}
            autoFocus={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Is private</ControlLabel>

          <FormControl
            {...formProps}
            name="isPrivate"
            defaultChecked={this.state.isPrivate}
            componentClass="checkbox"
            onChange={this.onChangeIsPrivate}
          />
        </FormGroup>

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            icon="cancel-1"
            onClick={closeModal}
          >
            Cancel
          </Button>

          {renderButton({
            name: 'group',
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: group
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default GroupForm;
