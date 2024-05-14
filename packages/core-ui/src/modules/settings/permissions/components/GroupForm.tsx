import Button from "modules/common/components/Button";
import ControlLabel from "modules/common/components/form/Label";
import Form from "modules/common/components/form/Form";
import FormControl from "modules/common/components/form/Control";
import FormGroup from "modules/common/components/form/Group";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import { IFormProps } from "modules/common/types";
import { IUserGroupDocument } from "../types";
import { ModalFooter } from "modules/common/styles/main";
import React from "react";
import SelectTeamMembers from "@erxes/ui/src/team/containers/SelectTeamMembers";

type Props = {
  closeModal: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  object: IUserGroupDocument;
  refetch: any;
};

type State = {
  selectedMembers: string[];
};

class GroupForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedMembers: (props.object && props.object.memberIds) || [],
    };
  }

  generateDoc = (values: {
    _id?: string;
    name: string;
    description: string;
  }) => {
    const { object } = this.props;
    const finalValues = values;

    if (object) {
      finalValues._id = object._id;
    }

    return {
      ...finalValues,
      memberIds: this.state.selectedMembers,
    };
  };

  renderContent = (formProps: IFormProps) => {
    const object = this.props.object || ({} as IUserGroupDocument);
    const self = this;
    const { values, isSubmitted } = formProps;

    if (object) {
      values._id = object._id;
    }

    const onChange = (selectedMembers) => {
      self.setState({ selectedMembers });
    };

    return (
      <>
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

        <FormGroup>
          <ControlLabel required={true}>Description</ControlLabel>
          <FormControl
            {...formProps}
            componentclass="textarea"
            name="description"
            defaultValue={object.description}
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Members</ControlLabel>

          <SelectTeamMembers
            label="Choose members"
            name="selectedMembers"
            initialValue={self.state.selectedMembers}
            onSelect={onChange}
          />
        </FormGroup>

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={this.props.closeModal}
            icon="cancel-1"
          >
            Cancel
          </Button>

          {this.props.renderButton({
            name: "user group",
            values: this.generateDoc(values),
            isSubmitted,
            callback: this.props.closeModal,
            object: this.props.object,
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
