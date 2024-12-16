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
import TagForm from '../containers/Form';

type Props = {
  tag: any;
  remove: (_id: string) => void;
};

const Row = (props: Props) => {
  const { tag, remove } = props;
  const user = tag.lastModifiedBy;

  const renderRemoveAction = () => {
    const onClick = () => {
      remove(tag._id);
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

  const getFullName = (doc: any) => {
    return doc.details ? doc.details.fullName : 'Unknown';
  };

  const formContent = formProps => (
    <TagForm {...formProps} category={tag} />
  );

  return (
    <tr>
      <td key={Math.random()}>
        <RowTitle>{ tag.name || 'Undefined'}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{tag.slug || 'Undefined'} </RowTitle>
      </td>

      <td>
        <Icon icon="calender" />{' '}
        <DateWrapper>
          {dayjs(tag.lastModifiedAt).format('lll')}
        </DateWrapper>
      </td>

      <td>
        <NameCard.Avatar user={user} size={20} />
        <RowTitle>{(user && getFullName(user)) || 'Unknown'} </RowTitle>
      </td>

      <td>
        <ActionButtons>
          <ModalTrigger
            title={'Edit tag'}
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
