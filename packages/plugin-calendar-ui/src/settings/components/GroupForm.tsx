import Button from "@erxes/ui/src/components/Button";
import FormControl from "@erxes/ui/src/components/form/Control";
import Form from "@erxes/ui/src/components/form/Form";
import FormGroup from "@erxes/ui/src/components/form/Group";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import { IButtonMutateProps, IFormProps } from "@erxes/ui/src/types";
import { __ } from "@erxes/ui/src/utils/core";
import SelectTeamMembers from "@erxes/ui/src/team/containers/SelectTeamMembers";
import React from "react";
import Select from "react-select";
import { IBoard, IGroup } from "../types";
import { ModalFooter } from "@erxes/ui/src/styles/main";
import Dialog from "@erxes/ui/src/components/Dialog";

type Props = {
  show: boolean;
  group?: IGroup;
  boards: IBoard[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  boardId: string;
  isPrivate: boolean;
  selectedMemberIds: string[];
};

class GroupForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const group = this.props.group || ({} as IGroup);

    this.state = {
      boardId: group.boardId || "",
      isPrivate: group.isPrivate || false,
      selectedMemberIds: group ? group.memberIds || [] : [],
    };
  }

  onChangeMembers = (items) => {
    this.setState({ selectedMemberIds: items });
  };

  onChangeIsPrivate = (e) => {
    const isChecked = (e.currentTarget as HTMLInputElement).checked;
    this.setState({ isPrivate: isChecked });
  };

  generateDoc = (values: {
    _id?: string;
    name: string;
    visibility: string;
  }) => {
    const { group } = this.props;
    const { boardId, isPrivate, selectedMemberIds } = this.state;
    const finalValues = values;

    if (group) {
      finalValues._id = group._id;
    }

    return {
      ...finalValues,
      memberIds: selectedMemberIds,
      isPrivate,
      boardId,
    };
  };

  renderOptions = (array) => {
    return array.map((obj) => ({
      value: obj._id,
      label: obj.name,
    }));
  };

  renderBoards() {
    const { boards } = this.props;

    const onChange = (item) => this.setState({ boardId: item.value });

    return (
      <FormGroup>
        <ControlLabel required={true}>Board</ControlLabel>
        <Select
          placeholder={__("Choose a board")}
          value={this.renderOptions(boards).find(
            (o) => o.value === this.state.boardId
          )}
          options={this.renderOptions(boards)}
          onChange={onChange}
          isClearable={false}
        />
      </FormGroup>
    );
  }

  renderSelectMembers() {
    const { isPrivate, selectedMemberIds } = this.state;

    if (!isPrivate) {
      return;
    }

    return (
      <FormGroup>
        <ControlLabel>Members</ControlLabel>

        <SelectTeamMembers
          label="Choose members"
          name="selectedMemberIds"
          initialValue={selectedMemberIds}
          onSelect={this.onChangeMembers}
        />
      </FormGroup>
    );
  }

  renderContent = (formProps: IFormProps) => {
    const { group, renderButton, closeModal } = this.props;
    const { values, isSubmitted } = formProps;
    const object = group || ({} as IGroup);
    const groupName = "group";

    return (
      <div id="manage-group-modal">
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

        <FormGroup>
          <ControlLabel>Is private</ControlLabel>

          <FormControl
            {...formProps}
            name="isPrivate"
            defaultChecked={this.state.isPrivate}
            componentclass="checkbox"
            onChange={this.onChangeIsPrivate}
          />
        </FormGroup>

        {this.renderSelectMembers()}

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            icon="times-circle"
            onClick={closeModal}
          >
            Cancel
          </Button>

          {renderButton({
            name: groupName,
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: group,
            confirmationUpdate: true,
          })}
        </ModalFooter>
      </div>
    );
  };

  render() {
    const { group, show, closeModal } = this.props;
    const groupName = "group";

    if (!show) {
      return null;
    }

    return (
      <Dialog
        show={show}
        closeModal={closeModal}
        title={group ? `Edit ${groupName}` : `Add ${groupName}`}
      >
        <Form renderContent={this.renderContent} />
      </Dialog>
    );
  }
}

export default GroupForm;
