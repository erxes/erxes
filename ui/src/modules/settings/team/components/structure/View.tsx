import React from 'react';
import { SidebarList } from 'modules/layout/styles';
import { IStructure } from '../../types';
import { __ } from 'modules/common/utils';
import Box from 'modules/common/components/Box';
import Icon from 'modules/common/components/Icon';

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

  const { title, supervisor, description, code } = structure;

  return (
    <Box
      extraButtons={edit}
      isOpen={true}
      title={__('Structure')}
      name="showStructure"
    >
      <SidebarList className="no-link">
        <li>
          <b>{__(`Name`)}</b>:{` `}
          {title}
        </li>
        {description && (
          <li>
            <b>{__(`Description`)}</b>: {description}
          </li>
        )}
        {supervisor && (
          <li>
            <b>{__(`Supervisor`)}</b>: {` `}
            {supervisor.details
              ? supervisor.details.fullName || supervisor.email
              : supervisor.email}
          </li>
        )}
        {code && (
          <li>
            <b>{__(`Code`)}</b>: {code}
          </li>
        )}
      </SidebarList>
    </Box>
  );
}
