import { FormControl } from '@erxes/ui/src/components/form';
import Icon from '@erxes/ui/src/components/Icon';
import TextInfo from '@erxes/ui/src/components/TextInfo';
import React from 'react';
import { IAccount } from '../../types';
import { __ } from '@erxes/ui/src/utils/core';
import AccountForm from '@erxes/ui-accounts/src/containers/AccountForm';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import dayjs from 'dayjs';

type Props = {
  account: IAccount;
  history: any;
  isChecked: boolean;
  toggleBulk: (account: IAccount, isChecked?: boolean) => void;
};

class Row extends React.Component<Props> {
  render() {
    const { account, history, toggleBulk, isChecked } = this.props;

    const onChange = e => {
      if (toggleBulk) {
        toggleBulk(account, e.target.checked);
      }
    };

    const onClick = e => {
      e.stopPropagation();
    };

    const onTrClick = () => {
      history.push(`/settings/account/details/${account._id}`);
    };

    const content = props => <AccountForm {...props} account={account} />;

    const {
      code,
      name,
      type,
      category,
      currency,
      isbalance,
      closePercent,
      journal,
      createdAt
    } = account;

    return (
      <tr onClick={onTrClick}>
        <td onClick={onClick}>
          <FormControl
            checked={isChecked}
            componentClass="checkbox"
            onChange={onChange}
          />
        </td>
        <td>{code}</td>
        <td>{name}</td>
        <td>
          <TextInfo>{type}</TextInfo>
        </td>
        <td>{category ? category.name : ''}</td>
        <td>{(currency || 0).toLocaleString()}</td>
        <td>{isbalance ? 'Yes' : 'No'}</td>
        <td>{(closePercent || 0).toLocaleString()}</td>
        <td>
          <TextInfo>{journal}</TextInfo>
        </td>
        <td>{dayjs(createdAt).format('YYYY-MM-DD HH:mm')}</td>
        <td onClick={onClick}>
          <ModalTrigger
            title="Edit basic info"
            trigger={<Icon icon="edit" />}
            size="xl"
            content={content}
          />
        </td>
      </tr>
    );
  }
}

export default Row;
