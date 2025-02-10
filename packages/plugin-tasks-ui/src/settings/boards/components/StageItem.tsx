import { __, generateTree } from "coreui/utils";

import Button from "@erxes/ui/src/components/Button";
import FormControl from "@erxes/ui/src/components/form/Control";
import { IDepartment } from "@erxes/ui/src/team/types";
import { IStage } from "@erxes/ui-tasks/src/boards/types";
import { PROBABILITY } from "../constants";
import React from "react";
import Select from "react-select";
import SelectTeamMembers from "@erxes/ui/src/team/containers/SelectTeamMembers";
import { StageItemContainer } from "@erxes/ui-tasks/src/settings/boards/styles";
import { FlexItem, FlexRow } from "@erxes/ui-settings/src/styles";

type Props = {
  stage: IStage;
  type: string;
  remove: (stageId: string) => void;
  onChange: (stageId: string, name: string, value: any) => void;
  onKeyPress: (e: any) => void;
  departments: IDepartment[];
};

class StageItem extends React.Component<Props> {
  renderSelectMembers() {
    const { stage, onChange } = this.props;
    const { _id, visibility, memberIds, departmentIds } = stage;

    if (!visibility || visibility === "public") {
      return;
    }

    const generateValue = () => {
      const selected = this.props.departments.filter(
        department => departmentIds && departmentIds.includes(department._id)
      );
      return selected.map(s => ({ value: s._id, label: s.title }));
    };

    return (
      <>
        <SelectTeamMembers
          label='Members'
          name='memberIds'
          initialValue={memberIds}
          onSelect={ids => onChange(_id, "memberIds", ids)}
        />
        <Select
          value={generateValue()}
          options={generateTree(
            this.props.departments,
            null,
            (node, level) => ({
              value: node._id,
              label: `${"---".repeat(level)} ${node.title}`
            })
          )}
          onChange={options =>
            onChange(
              _id,
              "departmentIds",
              (options || []).map(o => o.value)
            )
          }
          placeholder={__("Department ...")}
          isMulti={true}
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
      <StageItemContainer key={stage._id}>
        <FlexItem>
          <FlexRow>
            <FormControl
              defaultValue={stage.name}
              type='text'
              placeholder={__("Stage name")}
              onKeyPress={onKeyPress}
              autoFocus={true}
              name='name'
              onChange={onChangeFormControl.bind(this, stage._id)}
            />

            <FormControl
              defaultValue={stage.probability}
              componentclass='select'
              name='probability'
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
              componentclass='select'
              name='status'
              className={""}
              onChange={onChangeFormControl.bind(this, stage._id)}
            >
              <option key='active' value='active'>
                {__("Active")}
              </option>
              <option key='archived' value='archived'>
                {__("Archived")}
              </option>
            </FormControl>

            <FormControl
              defaultValue={stage.visibility}
              componentclass='select'
              name='visibility'
              onChange={onChangeFormControl.bind(this, stage._id)}
            >
              <option key={0} value='public'>
                {__("Public")}
              </option>
              <option key={1} value='private'>
                {__("Private")}
              </option>
            </FormControl>

            <FormControl
              defaultValue={stage.code}
              name='code'
              placeholder={__("Code")}
              onChange={onChangeFormControl.bind(this, stage._id)}
            />

            <FormControl
              defaultValue={stage.age}
              name='age'
              placeholder={__("Age")}
              onChange={onChangeFormControl.bind(this, stage._id)}
            />

            {(["task"].includes(type) && (
              <FormControl
                componentclass='checkbox'
                checked={
                  stage.defaultTick === undefined || stage.defaultTick === null
                    ? true
                    : stage.defaultTick
                }
                name='defaultTick'
                placeholder={__("defaultTick")}
                autoFocus={true}
                onChange={onChangeCheckbox.bind(this, stage._id)}
              />
            )) || <></>}
          </FlexRow>
          <FlexRow>
            <FlexItem>
              {this.renderSelectMembers()}

              <SelectTeamMembers
                label='Can move members'
                name='canMoveMemberIds'
                initialValue={stage.canMoveMemberIds}
                onSelect={ids => onChange(stage._id, "canMoveMemberIds", ids)}
              />

              <SelectTeamMembers
                label='Can edit members'
                name='canEditMemberIds'
                initialValue={stage.canEditMemberIds}
                onSelect={ids => onChange(stage._id, "canEditMemberIds", ids)}
              />
            </FlexItem>
          </FlexRow>
        </FlexItem>
        <Button
          btnStyle='link'
          size='small'
          onClick={remove.bind(this, stage._id)}
          icon='times'
        />
      </StageItemContainer>
    );
  }
}

export default StageItem;
