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
import { InsuranceCategory, InsuranceProduct, User } from '../../../gql/types';
import CategoryForm from '../containers/Form';

type Props = {
  category: InsuranceCategory;
  remove: (_id: string) => void;
};

const Row = (props: Props) => {
  const { category, remove } = props;
  const user = category.lastModifiedBy;

  const renderRemoveAction = () => {
    const onClick = () => {
      remove(category._id);
    };

    return (
      <Tip text={__('Delete')} placement="top">
        <Button
          id="directionDelete"
          btnStyle="link"
          onClick={onClick}
          icon="times-circle"
        />
      </Tip>
    );
  };

  const getFullName = (doc: User) => {
    return doc.details ? doc.details.fullName : 'Unknown';
  };

  const formContent = formProps => (
    <CategoryForm {...formProps} category={category} />
  );

  return (
    <tr>
      <td key={Math.random()}>
        <RowTitle>{category.code || '-'}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{category.name || '-'} </RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{category.description || '-'}</RowTitle>
      </td>

      <td>
        <Icon icon="calender" />{' '}
        <DateWrapper>
          {dayjs(category.lastModifiedAt).format('lll')}
        </DateWrapper>
      </td>

      <td>
        <NameCard.Avatar user={user} size={20} />
        <RowTitle>{(user && getFullName(user)) || 'Unknown'} </RowTitle>
      </td>

      <td>
        <ActionButtons>
          <ModalTrigger
            title={'Edit category'}
            trigger={<Button btnStyle="link" icon="edit-3" />}
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
