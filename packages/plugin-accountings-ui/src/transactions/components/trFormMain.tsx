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
import { TR_CUSTOMER_TYPES, TR_SIDES } from '../../constants';
import SelectAccount from '../../settings/accounts/containers/SelectAccount';
import { ITransaction } from '../types';
import SelectCompanies from '@erxes/ui-contacts/src/companies/containers/SelectCompanies';
import SelectCustomers from '@erxes/ui-contacts/src/customers/containers/SelectCustomers';


type Props = {
  transactions?: ITransaction[];
  trDoc: ITransaction;
  queryParams: IQueryParams;
  setTrDoc: (trDoc: ITransaction) => void;
};

const TrFormMain = (props: Props) => {
  const { trDoc, setTrDoc } = props;

  const onChange = (key, value) => {
    setTrDoc({ ...trDoc, [key]: value });
  }

  const onChangeDetail = (key, value) => {
    setTrDoc({ ...trDoc, details: [{ ...trDoc.details[0], [key]: value }] });
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
      <ControlLabel>{__('MainForm')}</ControlLabel>
      <FormWrapper>
        <FormColumn>
          <FormGroup>
            <ControlLabel required={true}>{__('Account')}</ControlLabel>
            <SelectAccount
              multi={false}
              initialValue={trDoc.details[0]?.accountId || ''}
              label='Account'
              name='account'
              filterParams={{ journals: ['main'] }}
              onSelect={(accountId) => { onChangeDetail('accountId', accountId) }}
            />
          </FormGroup>
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
            <ControlLabel required={true}>{__('Side')}</ControlLabel>
            <FormControl
              componentclass='select'
              name="side"
              value={trDoc.details[0]?.side || TR_SIDES.DEBIT}
              options={TR_SIDES.OPTIONS}
              onChange={e => onChangeDetail('side', (e.target as any).value)}
            />
          </FormGroup>
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
            <ControlLabel required={true}>{__('Amount')}</ControlLabel>
            <FormControl
              type='number'
              name="amount"
              value={trDoc.details[0]?.amount || 0}
              autoFocus={true}
              required={true}
              onChange={e => onChangeDetail('amount', (e.target as any).value)}
            />
          </FormGroup>
          <FormGroup>
            {renderCustomerChooser()}
          </FormGroup>
        </FormColumn>
      </FormWrapper>
      <FormWrapper>
        <FormColumn>
          <ControlLabel required={true}>{__('Branch')}</ControlLabel>
          <SelectBranches
            multi={false}
            initialValue={trDoc.branchId || ''}
            label='Branch'
            name='branchId'
            onSelect={(branchId) => onChange('branchId', branchId)}
          />
        </FormColumn>
        <FormColumn>
          <ControlLabel required={true}>{__('Department')}</ControlLabel>
          <SelectDepartment
            multi={false}
            initialValue={trDoc.departmentId || ''}
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
