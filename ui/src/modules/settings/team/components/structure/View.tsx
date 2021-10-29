import React from 'react';
import { SidebarCounter } from 'modules/layout/styles';
import { IStructure } from '../../types';
import { __ } from 'modules/common/utils';
import Box from 'modules/common/components/Box';
import Icon from 'modules/common/components/Icon';
import { StructureList } from '../../styles';

type Props = {
  structure: IStructure;
  showEdit: () => void;
};

export default function View({ structure, showEdit }: Props) {
  const edit = (
    <a href="#settings" onClick={showEdit} tabIndex={0}>
      <Icon icon="edit" size={8} />
    </a>
  );

  const renderRow = (name: string, value: any, nowrap?: boolean) => {
    return (
      <li>
        <div>{__(name)}</div>
        <SidebarCounter nowrap={nowrap}>{value || '-'}</SidebarCounter>
      </li>
    );
  };

  const { title, supervisor, description, code } = structure;

  return (
    <Box
      extraButtons={edit}
      isOpen={true}
      title={__('Structure')}
      name="showStructure"
    >
      <StructureList className="no-link">
        {renderRow('Name', title)}
        {renderRow('Description', description, true)}
        {renderRow(
          'Supervisor',
          supervisor.details
            ? supervisor.details.fullName || supervisor.email
            : supervisor.email
        )}
        {renderRow('Code', code)}
      </StructureList>
    </Box>
  );
}
