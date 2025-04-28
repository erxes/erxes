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

import { useLocation, useNavigate } from 'react-router-dom';
import CustomTypeForm from './CustomTypeForm';

type Props = {
  cpId: string;
  refetch?: () => void;
  postType: any;
  remove: (_id: string) => void;
};

const Row = (props: Props) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { postType, remove } = props;

  const renderRemoveAction = () => {
    const onClick = () => {
      remove(postType._id);
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

  const formContent = (formProps) => (
    <CustomTypeForm
      {...formProps}
      postType={postType}
      clientPortalId={props.cpId}
      refetch={props.refetch}
    />
  );

  const renderEditAction = () => {
    return (
      <Tip text={__('Edit')} placement='top'>
        <ModalTrigger
          size='sm'
          title='Edit Type'
          autoOpenKey='showTypeAddModal'
          trigger={<Button btnStyle='link' icon='edit' />}
          content={formContent}
        />
      </Tip>
    );
  };

  const label = () => {
    if (postType.pluralLabel) {
      return postType.label + '/' + postType.pluralLabel;
    }

    return postType.label;
  };

  return (
    <tr>
      <td key={postType._id}>
        <RowTitle>{label()}</RowTitle>
      </td>

      <td key={postType._id + 'description'}>
        <RowTitle>{postType.description || '-'} </RowTitle>
      </td>

      <td key={postType._id + 'code'}>
        <RowTitle>{postType.code || '-'}</RowTitle>
      </td>

      <td>
        <Icon icon='calender' />{' '}
        <DateWrapper>{dayjs(postType.createdAt).format('lll')}</DateWrapper>
      </td>

      <td>
        <ActionButtons>
          {renderEditAction()}
          {renderRemoveAction()}
        </ActionButtons>
      </td>
    </tr>
  );
};

export default Row;
