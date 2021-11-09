import React from 'react';
import { SidebarCounter } from 'modules/layout/styles';
import { IStructure } from '../../types';
import { __, readFile } from 'modules/common/utils';
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

  const { title, description, code, phoneNumber, email, image } = structure;
  const supervisor = structure.supervisor || {};
  const links = structure.links || {};
  const coordinate = structure.coordinate || {};

  const supervisorName = supervisor.details
    ? supervisor.details.fullName || supervisor.email
    : supervisor.email;

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
        {renderRow('Supervisor', supervisorName)}
        {renderRow('Code', code)}
        {renderRow('Phone number', phoneNumber)}
        {renderRow('Email', email)}
        {renderRow('Longitude', coordinate.longitude)}
        {renderRow('Latitude', coordinate.latitude)}
        {renderRow('Website', links.website)}
        {renderRow('Facebook', links.facebook)}
        {renderRow('Twitter', links.twitter)}
        {renderRow('Youtube', links.youtube)}
        {image && (
          <li>
            <img src={readFile(image.url)} alt={image.name} width="100%" />
          </li>
        )}
      </StructureList>
    </Box>
  );
}
