import { __ } from "coreui/utils";

import Button from "@erxes/ui/src/components/Button";
import FormControl from "@erxes/ui/src/components/form/Control";
import { IStage } from "@erxes/ui-sales/src/boards/types";
import { PROBABILITY } from "../constants";
import React from "react";
import SelectTeamMembers from "@erxes/ui/src/team/containers/SelectTeamMembers";
import SelectDepartments from "@erxes/ui/src/team/containers/SelectDepartments";
import { StageItemContainer, StageItemRow } from "@erxes/ui-sales/src/settings/boards/styles";

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
    const { _id, visibility, memberIds, departmentIds } = stage;

    if (!visibility || visibility === "public") {
      return <><div></div><div></div></>;
    }

    return (
      <>
        <SelectTeamMembers
          label={__("Members")}
          name="memberIds"
          initialValue={memberIds}
          onSelect={(ids) => onChange(_id, "memberIds", ids)}
        />
        <SelectDepartments
          label="select department"
          name="departmentIds"
          initialValue={departmentIds}
          onSelect={(ids) => onChange(_id, "departmentIds", ids)}
          multi={true}
        />
      </>
    );
  }

  render() {
    const { stage, onChange, onKeyPress, remove, type } = this.props;
    const probabilties = PROBABILITY[type].ALL;

    const onChangeFormControl = (stageId, e) =>
      onChange(stageId, e.target.name, e.target.value);

    const onChangeCheckbox = (stageId, e) => {
      const value = e.target.checked;
      onChange(stageId, e.target.name, e.target.checked);
    };

    return (
      <StageItemContainer>
        <StageItemRow key={stage._id}>
          <FormControl
            defaultValue={stage.name}
            type="text"
            placeholder={__("Stage name")}
            onKeyPress={onKeyPress}
            autoFocus={true}
            name="name"
            onChange={onChangeFormControl.bind(this, stage._id)}
          />

          <FormControl
            defaultValue={stage.probability}
            componentclass="select"
            name="probability"
            onChange={onChangeFormControl.bind(this, stage._id)}
          >
            {probabilties.map((p, index) => (
              <option key={index} value={p}>
                {p}
              </option>
            ))}
          </FormControl>

          <FormControl
            defaultValue={stage.status}
            componentclass="select"
            name="status"
            className={""}
            onChange={onChangeFormControl.bind(this, stage._id)}
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
            componentclass="select"
            name="visibility"
            onChange={onChangeFormControl.bind(this, stage._id)}
          >
            <option key={0} value="public">
              {__("Public")}
            </option>
            <option key={1} value="private">
              {__("Private")}
            </option>
          </FormControl>

          <FormControl
            defaultValue={stage.code}
            name="code"
            placeholder={__("Code")}
            onChange={onChangeFormControl.bind(this, stage._id)}
          />

          <FormControl
            defaultValue={stage.age}
            name="age"
            placeholder={__("Age")}
            onChange={onChangeFormControl.bind(this, stage._id)}
          />

          <FormControl
            componentclass="checkbox"
            checked={
              stage.defaultTick === undefined || stage.defaultTick === null
                ? true
                : stage.defaultTick
            }
            name="defaultTick"
            placeholder={__("defaultTick")}
            autoFocus={true}
            onChange={onChangeCheckbox.bind(this, stage._id)}
          />

          <Button
            btnStyle="link"
            size="small"
            onClick={remove.bind(this, stage._id)}
            icon="times"
          />
        </StageItemRow>
        <StageItemRow>
          {this.renderSelectMembers()}

          <SelectTeamMembers
            label="Can move members"
            name="canMoveMemberIds"
            initialValue={stage.canMoveMemberIds}
            onSelect={(ids) => onChange(stage._id, "canMoveMemberIds", ids)}
          />

          <SelectTeamMembers
            label="Can edit members"
            name="canEditMemberIds"
            initialValue={stage.canEditMemberIds}
            onSelect={(ids) => onChange(stage._id, "canEditMemberIds", ids)}
          />

        </StageItemRow>
      </StageItemContainer>
    );
  }
}

export default StageItem;
