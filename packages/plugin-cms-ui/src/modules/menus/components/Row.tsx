import { RowTitle } from '@erxes/ui-engage/src/styles';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Tip from '@erxes/ui/src/components/Tip';
import NameCard from '@erxes/ui/src/components/nameCard/NameCard';
import { DateWrapper } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils/core';
import dayjs from 'dayjs';
import React from 'react';
import PageForm from '../containers/Form';
import { IMenu } from '../types';

type Props = {
  menu: IMenu;
  remove: (_id: string) => void;
  refetch?: () => void;
  clientPortalId: string;
  website?: any;
};

const Row = (props: Props) => {
  const { menu, remove, clientPortalId } = props;

  const renderRemoveAction = () => {
    const onClick = () => {
      remove(menu._id);
    };

    return (
      <Tip text={__('Delete')} placement='top'>
        <Button
          id='directionDelete'
          btnStyle='link'
          onClick={onClick}
          icon='times-circle'
        />
      </Tip>
    );
  };

  const getFullName = (doc: any) => {
    return doc.details ? doc.details.fullName : 'Unknown';
  };

  const formContent = (formProps: any) => (
    <PageForm
      {...formProps}
      menu={menu}
      clientPortalId={clientPortalId}
      refetch={props.refetch}
      website={props.website}
    />
  );

  return (
    <tr>
      <td key={menu._id + 'name'}>
        <RowTitle>{menu.label}</RowTitle>
      </td>

      <td key={menu._id + 'slug'}>
        <RowTitle>{`${menu.url}` || 'Undefined'} </RowTitle>
      </td>

      <td>
        <ActionButtons>
          <ModalTrigger
            title={'Edit page'}
            trigger={<Button btnStyle='link' icon='edit-3' />}
            content={formContent}
            size={'lg'}
          />
          {renderRemoveAction()}
        </ActionButtons>
      </td>
    </tr>
  );
};

export default Row;
