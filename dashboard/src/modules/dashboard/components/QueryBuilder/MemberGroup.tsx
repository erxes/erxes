import { Icon } from '@ant-design/compatible';
import React from 'react';
import MemberDropdown from './MemberDropdown';
import RemoveButtonGroup from './RemoveButtonGroup';

type Props = {
  updateMethods: any;
  availableMembers: any[];
  members: any;
  addMemberName: string;
  type: string;
};

class MemberGroup extends React.Component<Props> {
  render() {
    const {
      members,
      availableMembers,
      addMemberName,
      updateMethods,
      type
    } = this.props;

    return (
      <span>
        {members.map(m => (
          <RemoveButtonGroup
            key={m.index || m.name}
            onRemoveClick={() => updateMethods.remove(m)}
          >
            <MemberDropdown
              availableMembers={availableMembers}
              onClick={updateWith => updateMethods.update(m, updateWith)}
              schemaType={type}
            >
              {m.title}
            </MemberDropdown>
          </RemoveButtonGroup>
        ))}
        <MemberDropdown
          onClick={m => updateMethods.add(m)}
          availableMembers={availableMembers}
          type="dashed"
          schemaType={type}
          icon={<Icon type="plus" />}
        >
          {addMemberName}
        </MemberDropdown>
      </span>
    );
  }
}

export default MemberGroup;
