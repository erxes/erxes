import { IStage } from '@erxes/ui-cards/src/boards/types';
import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import { __, generateTree } from 'coreui/utils';
import React from 'react';
import { PROBABILITY } from '../constants';
import { StageItemContainer } from '@erxes/ui-settings/src/boards/styles';
import { IDepartment } from '@erxes/ui/src/team/types';
import Select from 'react-select-plus';

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

    if (!visibility || visibility === 'public') {
      return;
    }

    return (
      <>
        <SelectTeamMembers
          label="Choose members"
          name="memberIds"
          initialValue={memberIds}
          onSelect={ids => onChange(_id, 'memberIds', ids)}
        />
        <Select
          value={departmentIds}
          options={generateTree(
            this.props.departments,
            null,
            (node, level) => ({
              value: node._id,
              label: `${'---'.repeat(level)} ${node.title}`
            })
          )}
          onChange={options =>
            onChange(
              _id,
              'departmentIds',
              (options || []).map(o => o.value)
            )
          }
          placeholder={__('Choose department ...')}
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

    return (
      <StageItemContainer key={stage._id}>
        <FormControl
          defaultValue={stage.name}
          type="text"
          placeholder={__('Stage name')}
          onKeyPress={onKeyPress}
          autoFocus={true}
          name="name"
          onChange={onChangeFormControl.bind(this, stage._id)}
        />

        <FormControl
          defaultValue={stage.probability}
          componentClass="select"
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
          componentClass="select"
          name="status"
          className={''}
          onChange={onChangeFormControl.bind(this, stage._id)}
        >
          <option key="active" value="active">
            {__('Active')}
          </option>
          <option key="archived" value="archived">
            {__('Archived')}
          </option>
        </FormControl>

        <FormControl
          defaultValue={stage.visibility}
          componentClass="select"
          name="visibility"
          onChange={onChangeFormControl.bind(this, stage._id)}
        >
          <option key={0} value="public">
            {__('Public')}
          </option>
          <option key={1} value="private">
            {__('Private')}
          </option>
        </FormControl>

        <FormControl
          defaultValue={stage.code}
          name="code"
          placeholder={__('Code')}
          autoFocus={true}
          onChange={onChangeFormControl.bind(this, stage._id)}
        />

        <FormControl
          defaultValue={stage.age}
          name="age"
          placeholder={__('Age')}
          autoFocus={true}
          onChange={onChangeFormControl.bind(this, stage._id)}
        />

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
