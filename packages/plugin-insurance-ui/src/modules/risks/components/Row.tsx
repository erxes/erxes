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

import { Risk, User } from '../../../gql/types';
import RiskForm from '../containers/Form';

type Props = {
  risk: Risk;
  remove: (_id: string) => void;
};

const Row = (props: Props) => {
  const { risk, remove } = props;
  const user = risk.lastModifiedBy;

  const renderRemoveAction = () => {
    const onClick = () => {
      remove(risk._id);
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

  const getFullName = (doc?: User) => {
    if (!doc) {
      return 'Unknown';
    }

    return doc.details ? doc.details.fullName : 'Unknown';
  };

  const formContent = formProps => <RiskForm {...formProps} risk={risk} />;

  return (
    <tr>
      <td key={Math.random()}>
        <RowTitle>{risk.code || '-'}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{risk.name || '-'} </RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{risk.description || '-'}</RowTitle>
      </td>

      <td>
        <Icon icon="calender" />{' '}
        <DateWrapper>{dayjs(risk.updatedAt).format('lll')}</DateWrapper>
      </td>

      <td>
        {user && (
          <>
            <NameCard.Avatar user={user} size={20} />
            <RowTitle>{getFullName(user) || '-'}</RowTitle>
          </>
        )}
      </td>

      <td>
        <ActionButtons>
          <ModalTrigger
            title={'Edit risk'}
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
