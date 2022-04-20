import { IStage } from "@erxes/ui-cards/src/boards/types";
import Button from "@erxes/ui/src/components/Button";
import FormControl from "@erxes/ui/src/components/form/Control";
import SelectTeamMembers from "@erxes/ui/src/team/containers/SelectTeamMembers";
import { __ } from "coreui/utils";
import React from "react";
import { PROBABILITY } from "../constants";
import { StageItemContainer } from "@erxes/ui-settings/src/boards/styles";

type Props = {
  stage: IStage;
  type: string;
  remove: (stageId: string) => void;
  onChange: (stageId: string, name: string, value: any) => void;
  onKeyPress: (e: any) => void;
};

class StageItem extends React.Component<Props> {
  renderSelectMembers() {
    const { stage, onChange } = this.props;
    const { _id, visibility, memberIds } = stage;

    if (!visibility || visibility === "public") {
      return;
    }

    return (
      <SelectTeamMembers
        label="Choose members"
        name="memberIds"
        initialValue={memberIds}
        onSelect={ids => onChange(_id, "memberIds", ids)}
      />
    );
  }

  render() {
    const { stage, onChange, onKeyPress, remove, type } = this.props;
    const probabilties = PROBABILITY[type].ALL;

    const onChangeName = (stageId, e) =>
      onChange(stageId, e.target.name, e.target.value);
    const onChangeProbability = (stageId, e) =>
      onChange(stageId, e.target.name, e.target.value);
    const onChangeStatus = (stageId, e) =>
      onChange(stageId, e.target.name, e.target.value);
    const onChangeVisibility = (stageId, e) =>
      onChange(stageId, e.target.name, e.target.value);

    return (
      <StageItemContainer key={stage._id}>
        <FormControl
          defaultValue={stage.name}
          type="text"
          placeholder={__("Stage name")}
          onKeyPress={onKeyPress}
          autoFocus={true}
          name="name"
          onChange={onChangeName.bind(this, stage._id)}
        />

        <FormControl
          defaultValue={stage.probability}
          componentClass="select"
          name="probability"
          onChange={onChangeProbability.bind(this, stage._id)}
        >
          {probabilties.map((p, index) => (
            <option key={index} value={p}>
              {p}
            </option>
          ))}
        </FormControl>

        <FormControl
          defaultValue={stage.status}
          componentClass="select"
          name="status"
          className={""}
          onChange={onChangeStatus.bind(this, stage._id)}
        >
          <option key="active" value="active">
            {__("Active")}
          </option>
          <option key="archived" value="archived">
            {__("Archived")}
          </option>
        </FormControl>

        <FormControl
          defaultValue={stage.visibility}
          componentClass="select"
          name="visibility"
          onChange={onChangeVisibility.bind(this, stage._id)}
        >
          <option key={0} value="public">
            {__("Public")}
          </option>
          <option key={1} value="private">
            {__("Private")}
          </option>
        </FormControl>

        {this.renderSelectMembers()}

        <Button
          btnStyle="link"
          size="small"
          onClick={remove.bind(this, stage._id)}
          icon="times"
        />
      </StageItemContainer>
    );
  }
}

export default StageItem;
