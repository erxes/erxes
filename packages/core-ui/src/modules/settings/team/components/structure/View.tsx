import React from 'react';
import { SidebarCounter } from '@erxes/ui/src/layout/styles';
import { IStructure } from '@erxes/ui/src/team/types';
import { IUser } from '@erxes/ui/src/auth/types';
import { __, readFile } from 'modules/common/utils';
import Icon from '@erxes/ui/src/components/Icon';
import { StructureList, StructureEditButton } from '../../styles';
import { Title } from '@erxes/ui-settings/src/styles';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import _ from 'lodash';

type Props = {
  structure: IStructure;
  showEdit: () => void;
};

export default function View({ structure, showEdit }: Props) {
  const edit = (
    <StructureEditButton>
      <Icon icon="edit" onClick={showEdit} size={14} />
    </StructureEditButton>
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
  const supervisor = structure.supervisor || ({} as IUser);
  const links = structure.links || {};
  const coordinate = structure.coordinate || {};

  const supervisorName = supervisor.details
    ? supervisor.details.fullName || supervisor.email
    : supervisor.email;

  return (
    <>
      <Wrapper.ActionBar
        background="bgWhite"
        left={<Title capitalize={true}>{__('Structure')}</Title>}
        right={edit}
        wideSpacing={true}
      />
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
    </>
  );
}
