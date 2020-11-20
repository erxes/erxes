import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Select from 'react-select-plus';
import { IBoard, IGroup } from '../types';

type Props = {
  show: boolean;
  group?: IGroup;
  boards: IBoard[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  boardId: string;
};

class GroupForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const group = this.props.group || ({} as IGroup);

    this.state = {
      boardId: group.boardId || ''
    };
  }

  collectValues = items => {
    return items.map(item => item.value);
  };

  generateDoc = (values: {
    _id?: string;
    name: string;
    visibility: string;
  }) => {
    const { group } = this.props;
    const { boardId } = this.state;
    const finalValues = values;

    if (group) {
      finalValues._id = group._id;
    }

    return {
      ...finalValues,
      boardId
    };
  };

  renderOptions = array => {
    return array.map(obj => ({
      value: obj._id,
      label: obj.name
    }));
  };

  renderBoards() {
    const { boards } = this.props;

    const onChange = item => this.setState({ boardId: item.value });

    return (
      <FormGroup>
        <ControlLabel required={true}>Board</ControlLabel>
        <Select
          placeholder={__('Choose a board')}
          value={this.state.boardId}
          options={this.renderOptions(boards)}
          onChange={onChange}
          clearable={false}
        />
      </FormGroup>
    );
  }

  renderContent = (formProps: IFormProps) => {
    const { group, renderButton, closeModal } = this.props;
    const { values, isSubmitted } = formProps;
    const object = group || ({} as IGroup);
    const groupName = 'group';

    return (
      <div id="manage-group-modal">
        <Modal.Header closeButton={true}>
          <Modal.Title>
            {group ? `Edit ${groupName}` : `Add ${groupName}`}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <FormGroup>
            <ControlLabel required={true}>Name</ControlLabel>
            <FormControl
              {...formProps}
              name="name"
              defaultValue={object.name}
              autoFocus={true}
              required={true}
            />
          </FormGroup>

          {this.renderBoards()}

          <Modal.Footer>
            <Button
              btnStyle="simple"
              type="button"
              icon="times-circle"
              onClick={closeModal}
              uppercase={false}
            >
              Cancel
            </Button>

            {renderButton({
              name: groupName,
              values: this.generateDoc(values),
              isSubmitted,
              callback: closeModal,
              object: group,
              confirmationUpdate: true
            })}
          </Modal.Footer>
        </Modal.Body>
      </div>
    );
  };

  render() {
    const { show, closeModal } = this.props;

    if (!show) {
      return null;
    }

    return (
      <Modal
        show={show}
        onHide={closeModal}
        enforceFocus={false}
        animation={false}
        size="lg"
      >
        <Form renderContent={this.renderContent} />
      </Modal>
    );
  }
}

export default GroupForm;
