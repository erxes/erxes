import SelectCompanies from '@erxes/ui-contacts/src/companies/containers/SelectCompanies';
import SelectCustomers from '@erxes/ui-contacts/src/customers/containers/SelectCustomers';
import { __ } from '@erxes/ui/src';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import {
  FormColumn,
  FormWrapper
} from "@erxes/ui/src/styles/main";
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartment from '@erxes/ui/src/team/containers/SelectDepartments';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import { IQueryParams } from '@erxes/ui/src/types';
import React, { useEffect, useMemo, useState } from 'react';
import { ACCOUNT_KINDS, ACCOUNT_STATUSES, TR_CUSTOMER_TYPES, TR_SIDES } from '../../constants';
import SelectAccount from '../../settings/accounts/containers/SelectAccount';
import { IAccount } from '../../settings/accounts/types';
import { IRate, IConfigsMap, GetRateQueryResponse } from '../../settings/configs/types';
import { ITransaction } from '../types';
import { gql, useQuery, useLazyQuery } from '@apollo/client';
import { queries as configsQueries } from '../../settings/configs/graphql'

type Props = {
  configsMap: IConfigsMap;
  transactions?: ITransaction[];
  trDoc: ITransaction;
  queryParams: IQueryParams;
  setTrDoc: (trDoc: ITransaction) => void;
};

const TrFormMain = (props: Props) => {
  const { trDoc, setTrDoc, configsMap } = props;
  const detail = trDoc?.details && trDoc?.details[0] || {};

  const onChange = (key, value) => {
    setTrDoc({ ...trDoc, [key]: value });
  }

  const onChangeDetail = (key, value) => {
    setTrDoc({ ...trDoc, details: [{ ...detail, [key]: value }] });
  }

  const onAccountChange = (accountId, obj?: IAccount) => {
    setTrDoc({
      ...trDoc,
      branchId: obj?.branchId,
      departmentId: obj?.departmentId,
      details: [{ ...detail, accountId, account: obj }]
    });
  }

  const renderCustomerChooser = () => {
    if (trDoc.customerType === 'company') {
      return (
        <FormGroup>
          <ControlLabel required={true}>{__('Company')}</ControlLabel>
          <SelectCompanies
            multi={false}
            label={__('Company')}
            initialValue={trDoc.customerId}
            name="customerId"
            onSelect={(companyId) => onChange('customerId', companyId)}
          />
        </FormGroup>
      )
    }
    if (trDoc.customerType === 'user') {
      return (
        <FormGroup>
          <ControlLabel required={true}>{__('Team member')}</ControlLabel>
          <SelectTeamMembers
            multi={false}
            initialValue={trDoc.customerId}
            label={__('Team Member')}
            name="customerId"
            onSelect={(userId) => onChange('customerId', userId)}
          />
        </FormGroup>
      )
    }

    return (
      <FormGroup>
        <ControlLabel required={true}>{__('Customer')}</ControlLabel>
        <SelectCustomers
          multi={false}
          initialValue={trDoc.customerId}
          label={__('Customer')}
          name="customerId"
          onSelect={(customerId) => onChange('customerId', customerId)}
        />
      </FormGroup>
    )
  }

  const renderCurrencyFields = () => {
    if (!detail || !detail.account) {
      return null;
    }

    if (detail.account.currency === (configsMap.MainCurrency || 'MNT')) {
      return null;
    }

    const [spotRate, setSpotRate] = useState(0);

    const [getRate] = useLazyQuery<GetRateQueryResponse>(gql(configsQueries.getRate));

    useEffect(() => {
      getRate({
        variables: {
          date: trDoc.date || new Date(), currency: detail.account?.currency
        }
      }).then((data) => {
        setSpotRate(data?.data?.accountingsGetRate?.rate || 0)
      })
    }, [trDoc.date, detail.account]);

    useEffect(() => {
      if (spotRate) {
        setTrDoc({ ...trDoc, details: [{ ...detail, currencyAmount: (detail.amount || 0) / spotRate }] });
      }
    }, [detail.amount]);

    const diffAmount: number = useMemo(() => {
      const multipler = detail.account?.status === 'active' && 1 || -1;
      return ((detail.customRate || 0) - spotRate) * (detail.currencyAmount || 0) * multipler;
    }, [spotRate, detail.customRate, detail.currencyAmount, detail.account]);

    const onChangeCurrencyAmount = (e) => {
      const value = (e.target as any).value
      setTrDoc({ ...trDoc, details: [{ ...detail, currencyAmount: value, amount: spotRate * value }] });
    }

    return (
      <>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>{__('Currency Amount')}</ControlLabel>
              <FormControl
                type='number'
                name="amount"
                value={detail.currencyAmount || 0}
                autoFocus={true}
                required={true}
                onChange={onChangeCurrencyAmount}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>{__('Custom Rate')}</ControlLabel>
              <FormControl
                type='number'
                name="amount"
                value={detail.customRate || 0}
                autoFocus={true}
                required={true}
                onChange={e => onChangeDetail('customRate', (e.target as any).value)}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>{__('Spot Rate')}</ControlLabel>
              <FormControl
                type='number'
                name="amount"
                value={spotRate || 0}
                disabled={true}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>{__(`${diffAmount > 0 && 'Loss' || 'Gain'} amount`)}</ControlLabel>
              <FormControl
                type='number'
                name="amount"
                value={diffAmount}
                disabled={true}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>{__('Account')}</ControlLabel>
              <SelectAccount
                multi={false}
                initialValue={detail.followInfos?.currencyDiffAccountId || ''}
                label='Diff Account'
                name='currencyDiffAccountId'
                filterParams={{ journals: ['main'] }}
                onSelect={(accountId) => { onChangeDetail('followInfos', { ...detail.followInfos, currencyDiffAccountId: accountId }) }}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
          </FormColumn>
        </FormWrapper>
      </>
    )
  }

  return (
    <>
      <FormWrapper>
        <FormColumn>
          <FormGroup>
            <ControlLabel required={true}>{__('Account')}</ControlLabel>
            <SelectAccount
              multi={false}
              initialValue={detail.accountId || ''}
              label='Account'
              name='accountId'
              filterParams={{ journals: ['cash'] }}
              onSelect={(accountId, obj) => { onAccountChange(accountId, obj) }}
            />
          </FormGroup>
        </FormColumn>
        <FormColumn>
          <FormGroup>
            <ControlLabel required={true}>{__('Side')}</ControlLabel>
            <FormControl
              componentclass='select'
              name="side"
              value={detail.side || TR_SIDES.DEBIT}
              options={TR_SIDES.CASH_OPTIONS}
              onChange={e => onChangeDetail('side', (e.target as any).value)}
            />
          </FormGroup>
        </FormColumn>
        <FormColumn>
          <FormGroup>
            <ControlLabel required={true}>{__('Amount')}</ControlLabel>
            <FormControl
              type='number'
              name="amount"
              value={detail.amount || 0}
              autoFocus={true}
              required={true}
              onChange={e => onChangeDetail('amount', (e.target as any).value)}
            />
          </FormGroup>
        </FormColumn>
      </FormWrapper>
      <FormWrapper>
        <FormColumn>
          <FormGroup>
            <ControlLabel required={true}>{__('Description')}</ControlLabel>
            <FormControl
              name="description"
              value={trDoc.description || ''}
              required={true}
              onChange={e => onChange('description', (e.target as any).value)}
            />
          </FormGroup>
        </FormColumn>
        <FormColumn>
          <FormGroup>
            <ControlLabel required={true}>{__('Customer Type')}</ControlLabel>
            <FormControl
              componentclass='select'
              name="side"
              value={trDoc.customerType || 'customer'}
              options={TR_CUSTOMER_TYPES}
              onChange={e => onChange('customerType', (e.target as any).value)}
            />
          </FormGroup>
        </FormColumn>
        <FormColumn>
          <FormGroup>
            {renderCustomerChooser()}
          </FormGroup>
        </FormColumn>
      </FormWrapper>
      {renderCurrencyFields()}
      <FormWrapper>
        <FormColumn>
          <ControlLabel required={true}>{__('Branch')}</ControlLabel>
          <SelectBranches
            multi={false}
            initialValue={trDoc.branchId}
            label='Branch'
            name='branchId'
            onSelect={(branchId) => onChange('branchId', branchId)}
          />
        </FormColumn>
        <FormColumn>
          <ControlLabel required={true}>{__('Department')}</ControlLabel>
          <SelectDepartment
            multi={false}
            initialValue={trDoc.departmentId}
            label='Department'
            name='departmentId'
            onSelect={(departmentId) => onChange('departmentId', departmentId)}
          />
        </FormColumn>
        <FormColumn>
          <ControlLabel>{__('Assigned')}</ControlLabel>
          <SelectTeamMembers
            multi={true}
            initialValue={trDoc.assignedUserIds || []}
            label='Assigned Users'
            name='assignedUserIds'
            onSelect={(userIds) => onChange('assignedUserIds', userIds)}
          />
        </FormColumn>
      </FormWrapper>
    </>
  );
};

export default TrFormMain;
