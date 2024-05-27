import Icon from '@erxes/ui/src/components/Icon';
import { RowTitle } from '@erxes/ui-engage/src/styles';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import { __, renderFullName } from '@erxes/ui/src/utils/core';
import React from 'react';
import { Link } from 'react-router-dom';
import Tip from '@erxes/ui/src/components/Tip';
import Button from '@erxes/ui/src/components/Button';
import { FieldStyle } from '@erxes/ui/src/layout/styles';

type Props = {
  account: any;
  //   remove: (directionId: string) => void;
};

const Row = (props: Props) => {
  const { account } = props;

  const profileAction = () => {
    const onClick = () => {
      // goto customer profile

      window.open(`/contacts/details/${account.customerId}`);
    };

    return (
      <Tip text={__('Profile')} placement="top">
        <Button id="profile" btnStyle="link" onClick={onClick} icon="user-6" />
      </Tip>
    );
  };

  return (
    <tr>
      <td key={Math.random()}>
        <RowTitle>{renderFullName(account.customer)}</RowTitle>
      </td>
      <td key={Math.random()}>
        {/* <RowTitle>{account.balance || '-'}</RowTitle> */}
        <FieldStyle>{account.balance.toLocaleString()} ₮</FieldStyle>
      </td>

      <td>
        <ActionButtons>{profileAction()}</ActionButtons>
      </td>
    </tr>
  );
};

export default Row;
