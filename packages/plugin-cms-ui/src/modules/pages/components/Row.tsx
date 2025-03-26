import { RowTitle } from '@erxes/ui-engage/src/styles';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import Tip from '@erxes/ui/src/components/Tip';
import NameCard from '@erxes/ui/src/components/nameCard/NameCard';
import { DateWrapper } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils/core';
import dayjs from 'dayjs';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageForm from '../containers/Form';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';

type Props = {
  page: any;
  remove: (_id: string) => void;
};

const Row = (props: Props) => {

  const { page, remove } = props;
  const user = page.createdUser;

  const renderRemoveAction = () => {
    const onClick = () => {
      remove(page._id);
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

  const formContent = (formProps) => (
    <PageForm {...formProps} page={page} clientPortalId={page.clientPortalId} />
  );

  return (
    <tr>
      <td key={page._id + 'name'}>
        <RowTitle>{page.name}</RowTitle>
      </td>

      <td key={page._id + 'slug'}>
        <RowTitle>{`${page.slug}` || 'Undefined'} </RowTitle>
      </td>

      <td>
        <Icon icon='calender' />{' '}
        <DateWrapper>{dayjs(page.createdAt).format('lll')}</DateWrapper>
      </td>

      <td>
        <Icon icon='calender' />{' '}
        <DateWrapper>{dayjs(page.updatedAt).format('lll')}</DateWrapper>
      </td>

      <td>
        <NameCard.Avatar user={user} size={20} />
        <RowTitle>{(user && getFullName(user)) || 'Unknown'} </RowTitle>
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
