import { Icon } from '@ant-design/compatible';
import React from 'react';
import MemberDropdown from './MemberDropdown';
import RemoveButtonGroup from './RemoveButtonGroup';

const MemberGroup = ({
  members,
  availableMembers,
  addMemberName,
  updateMethods
}) => (
  <span>
    {members.map(m => (
      <RemoveButtonGroup
        key={m.index || m.name}
        onRemoveClick={() => updateMethods.remove(m)}
      >
        <MemberDropdown
          availableMembers={availableMembers}
          onClick={updateWith => updateMethods.update(m, updateWith)}
        >
          {m.title}
        </MemberDropdown>
      </RemoveButtonGroup>
    ))}
    <MemberDropdown
      onClick={m => updateMethods.add(m)}
      availableMembers={availableMembers}
      type='dashed'
      icon={<Icon type='plus' />}
    >
      {addMemberName}
    </MemberDropdown>
  </span>
);

export default MemberGroup;
