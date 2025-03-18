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
import React from 'react';
import { TR_CUSTOMER_TYPES, TR_SIDES } from '../../../constants';
import SelectAccount from '../../../settings/accounts/containers/SelectAccount';
import { IAccount } from '../../../settings/accounts/types';
import { IConfigsMap } from '../../../settings/configs/types';
import { ITransaction } from '../../types';
import CurrencyFields from '../helpers/CurrencyFields';
import TaxFields from '../helpers/TaxFields';
import { getTrSide } from '../../utils/utils';

type Props = {
  configsMap: IConfigsMap;
  transactions?: ITransaction[];
  trDoc: ITransaction;
  followTrDocs: ITransaction[];
  queryParams: IQueryParams;
  setTrDoc: (trDoc: ITransaction, fTrDocs?: ITransaction[]) => void;
};

const TrFormBank = (props: Props) => {
  const { trDoc, setTrDoc, followTrDocs } = props;
  const detail = trDoc?.details && trDoc?.details[0] || {};

  const onChange = (key, value) => {
    setTrDoc({ ...trDoc, [key]: value }, followTrDocs);
  }

  const onChangeDetail = (key, value) => {
    setTrDoc({ ...trDoc, details: [{ ...detail, [key]: value }] }, followTrDocs);
  }

  const onAccountChange = (accountId, obj?: IAccount) => {
    setTrDoc({
      ...trDoc,
      branchId: obj?.branchId,
      departmentId: obj?.departmentId,
      details: [{ ...detail, accountId, account: obj }]
    }, followTrDocs);
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
              filterParams={{ journals: ['bank'] }}
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
              options={TR_SIDES.FUND_OPTIONS}
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
      <CurrencyFields
        {...props}
        onChangeDetail={onChangeDetail}
      />
      <FormWrapper>
        <FormColumn>
          <FormGroup>
            <ControlLabel required={true}>{__('Branch')}</ControlLabel>
            <SelectBranches
              multi={false}
              initialValue={trDoc.branchId}
              label='Branch'
              name='branchId'
              onSelect={(branchId) => onChange('branchId', branchId)}
            />
          </FormGroup>
        </FormColumn>
        <FormColumn>
          <FormGroup>
            <ControlLabel required={true}>{__('Department')}</ControlLabel>
            <SelectDepartment
              multi={false}
              initialValue={trDoc.departmentId}
              label='Department'
              name='departmentId'
              onSelect={(departmentId) => onChange('departmentId', departmentId)}
            />
          </FormGroup>
        </FormColumn>
        <FormColumn>
          <FormGroup>
            <ControlLabel>{__('Assigned')}</ControlLabel>
            <SelectTeamMembers
              multi={true}
              initialValue={trDoc.assignedUserIds || []}
              label='Assigned Users'
              name='assignedUserIds'
              onSelect={(userIds) => onChange('assignedUserIds', userIds)}
            />
          </FormGroup>
        </FormColumn>
      </FormWrapper>
      <TaxFields
        {...props}
        side={getTrSide(detail.side, true)}
        isWithTax={true}
      />
    </>
  );
};

export default TrFormBank;
