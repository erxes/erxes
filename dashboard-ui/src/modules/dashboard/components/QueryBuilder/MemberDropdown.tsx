import { Menu } from 'antd';
import { ignoredFilters, ignoredMeasures } from 'modules/dashboard/constants';
import React from 'react';
import ButtonDropdown from './ButtonDropdown';

const generateMember = (availableMembers, schemaType, addMemberName) => {
  const generatedMembers = [] as any;
  const hideFields =
    addMemberName === 'Filter'
      ? ignoredFilters
      : addMemberName !== 'Time'
      ? ignoredMeasures
      : [];

  if (availableMembers) {
    availableMembers.forEach(members => {
      const name = members.name;

      if (
        !hideFields.includes(name.split('.')[1]) &&
        name.startsWith(schemaType)
      ) {
        generatedMembers.push(members);
      }
    });
  }

  return generatedMembers;
};

const memberMenu = (onClick, availableMembers, schemaType, addMemberName) => {
  const generatedMembers = generateMember(
    availableMembers,
    schemaType,
    addMemberName
  ) as any[];

  return (
    <Menu>
      {generatedMembers.length ? (
        generatedMembers.map(m => (
          <Menu.Item key={m.name} onClick={() => onClick(m)}>
            {m.shortTitle}
          </Menu.Item>
        ))
      ) : (
        <Menu.Item disabled={true}>No members found</Menu.Item>
      )}
    </Menu>
  );
};

const MemberDropdown = ({
  onClick,
  availableMembers,
  schemaType,
  addMemberName,
  ...buttonProps
}) => (
  <ButtonDropdown
    overlay={memberMenu(onClick, availableMembers, schemaType, addMemberName)}
    {...buttonProps}
  />
);

export default MemberDropdown;
