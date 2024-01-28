import { gql, useQuery } from '@apollo/client';
import { Box } from '@erxes/ui-contacts/src/customers/styles';
import {
  AccountBox,
  AccountItem,
  AccountTitle,
} from '@erxes/ui-inbox/src/settings/integrations/styles';
import { Button, EmptyState, FormControl, Spinner, __ } from '@erxes/ui/src';
import React, { useState } from 'react';
import { queries } from '../../graphql';
import { PagesContainer } from './styles';

type Props = {
  onSelect: (value: string, name: string) => void;
  initialValue?: string | string[];
  name: string;
  filterParams?: any;
};

export function SelectAccount({
  name,
  initialValue,
  onSelect,
  filterParams,
}: Props) {
  const [accountId, setAccountId] = useState(initialValue || '');

  const { error, loading, data } = useQuery(gql(queries.facebookGetAccounts), {
    variables: {
      ...filterParams,
      kind: 'facebook',
    },
  });

  if (error) {
    return <EmptyState icon="info-circle" text={error.message} />;
  }

  if (loading) {
    return <Spinner objective />;
  }

  const accounts = data?.facebookGetAccounts || [];

  const handleSelect = (accountId) => {
    setAccountId(accountId);
    onSelect(accountId, name);
  };

  return (
    <AccountBox>
      <AccountTitle>{__('Linked Accounts')}</AccountTitle>
      {accounts.map((account) => (
        <AccountItem key={account._id}>
          <span>{account.name}</span>

          <div>
            <Button
              onClick={() =>
                handleSelect(accountId !== account._id ? account._id : null)
              }
              btnStyle={accountId === account._id ? 'primary' : 'simple'}
            >
              {accountId === account._id
                ? __('Selected')
                : __('Select This Account')}
            </Button>
          </div>
        </AccountItem>
      ))}
    </AccountBox>
  );
}

export function SelectAccountPages({
  initialValue,
  filterParams,
  accountId,
  onSelect,
}: {
  accountId: string;
  initialValue: string;
  filterParams?: any;
  onSelect: (value: string, name: string) => void;
}) {
  const { error, loading, data } = useQuery(gql(queries.facebookGetPages), {
    variables: {
      ...filterParams,
      accountId,
      kind: 'facebook-messenger',
    },
    skip: !accountId,
  });

  if (error) {
    return <EmptyState icon="info-circle" text={error.message} />;
  }

  if (loading) {
    return <Spinner objective />;
  }

  const pages = data?.facebookGetPages || [];

  const handleSelectPage = (pageId) => {
    if (initialValue === pageId) {
      return onSelect('', 'pageId');
    }

    onSelect(pageId, 'pageId');
  };

  return (
    <AccountBox>
      <AccountTitle>{__('Facebook pages')}</AccountTitle>
      {pages.map(({ id, name }) => (
        <AccountItem key={id}>
          <span>{name}</span>
          <Button
            onClick={() => handleSelectPage(id)}
            btnStyle={initialValue === id ? 'primary' : 'simple'}
          >
            {initialValue === id ? __('Selected') : __('Select This Account')}
          </Button>
        </AccountItem>
      ))}
    </AccountBox>
  );
}
