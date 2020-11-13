import { Menu } from 'antd';
import React from 'react';
import ButtonDropdown from './ButtonDropdown';

const generateMember = (availableMembers, schemaType) => {
  const generatedMembers = [] as any;

  if (availableMembers) {
    availableMembers.forEach((members) => {
      const name = members.name;

      if (name.startsWith(schemaType)) {
        generatedMembers.push(members);
      }
    });
  }

  return generatedMembers;
};

const memberMenu = (onClick, availableMembers, schemaType) => {
  const generatedMembers = generateMember(
    availableMembers,
    schemaType
  ) as any[];

  return (
    <Menu>
      {generatedMembers.length ? (
        generatedMembers.map((m) => (
          <Menu.Item key={m.name} onClick={() => onClick(m)}>
            {m.title}
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
  ...buttonProps
}) => (
  <ButtonDropdown
    overlay={memberMenu(onClick, availableMembers, schemaType)}
    {...buttonProps}
  />
);

export default MemberDropdown;
