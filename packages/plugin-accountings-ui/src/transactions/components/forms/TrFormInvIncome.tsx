import SelectCompanies from '@erxes/ui-contacts/src/companies/containers/SelectCompanies';
import SelectCustomers from '@erxes/ui-contacts/src/customers/containers/SelectCustomers';
import ProductChooser from "@erxes/ui-products/src/containers/ProductChooser";
import SelectProducts from '@erxes/ui-products/src/containers/SelectProducts';
import { IProduct } from "@erxes/ui-products/src/types";
import { __, Table } from '@erxes/ui/src';
import Button from "@erxes/ui/src/components/Button";
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
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
import { getTrSide } from '../../utils/utils';
import TaxFields from '../helpers/TaxFields';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';

type Props = {
  configsMap: IConfigsMap;
  transactions?: ITransaction[];
  trDoc: ITransaction;
  followTrDocs: ITransaction[];
  queryParams: IQueryParams;
  setTrDoc: (trDoc: ITransaction, fTrDocs?: ITransaction[]) => void;
};

const TrFormInvIncome = (props: Props) => {
  const { trDoc, setTrDoc, followTrDocs } = props;
  const detail = trDoc?.details && trDoc?.details[0] || {};

  const onChange = (key, value) => {
    setTrDoc({ ...trDoc, [key]: value }, followTrDocs);
  }

  const onChangeDetail = (_id, args) => {
    setTrDoc({
      ...trDoc, details: trDoc.details.map(det => (
        det._id === _id ? { ...det, ...args } : det
      ))
    }, followTrDocs);
  }

  const onAddDetail = () => {
    const oldDetails = trDoc.details || [];
    const prevDetail = oldDetails.slice(-1)[0];

    setTrDoc({
      ...trDoc, details: [...oldDetails, {
        accountId: prevDetail?.accountId,
        account: prevDetail?.account,
        side: TR_SIDES.DEBIT,
        count: 1,
        unitPrice: 0,
        productId: '',

      }]
    }, followTrDocs);
  }

  const onRemoveDetail = (_id) => {
    setTrDoc({
      ...trDoc, details: trDoc.details.filter(det => (
        det._id !== _id
      ))
    }, followTrDocs);
  }

  const renderBulkProductChooser = () => {
    const oldDetails = trDoc.details || [];

    const productOnChange = (products: IProduct[]) => {
      const prevDetail = oldDetails.slice(-1)[0];

      const currentProductIds = oldDetails.map((p) => p.productId);

      for (const product of products) {
        if (currentProductIds.includes(product._id)) {
          continue;
        }

        oldDetails.push({
          _id: Math.random().toString(),
          accountId: prevDetail?.accountId,
          account: prevDetail?.account,
          side: TR_SIDES.DEBIT,
          count: 1,
          unitPrice: 0,
          productId: product._id,
          product: product,
        });
      }

      const chosenProductIds = products.map((p) => p._id);
      setTrDoc({
        ...trDoc, details: oldDetails.filter(
          (pd) => chosenProductIds.includes(pd.productId || '')
        )
      }, followTrDocs);
    };

    const content = (props) => (
      <ProductChooser
        {...props}
        onSelect={productOnChange}
        data={{
          name: "Product",
          products: oldDetails.filter((p) => p.product).map((p) => p.product),
        }}
      />
    );

    const trigger = (
      <Button btnStyle="link" icon="plus-circle">
        Add Many Products
      </Button>
    );

    return (
      <ModalTrigger
        title="Choose product & service"
        trigger={trigger}
        dialogClassName="modal-1400w"
        size="xl"
        content={content}
      />
    );
  }

  const onAccountChange = (accountId, obj?: IAccount) => {
    setTrDoc({
      ...trDoc,
      branchId: obj?.branchId,
      departmentId: obj?.departmentId,
      details: trDoc.details.map(det => ({ ...det, accountId, account: obj }))
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

  const renderItems = () => {
    return (
      <>
        <Table>
          <thead>
            <tr>
              <td>Account</td>
              <td>Inventory</td>
              <td>quantity</td>
              <td>unitPrice</td>
              <td>amount</td>
              <td></td>
            </tr>
          </thead>
          <tbody>
            {
              trDoc.details.map(det => (
                <tr>
                  <td>
                    <SelectAccount
                      multi={false}
                      initialValue={det.accountId || ''}
                      label='Account'
                      name='accountId'
                      filterParams={{ journals: ['inventory'] }}
                      onSelect={(accountId, obj) => { onChangeDetail(det._id, { accountId, account: obj }) }}
                    />
                  </td>
                  <td>
                    <SelectProducts
                      label="Choose product"
                      name="productId"
                      initialValue={det.productId}
                      onSelect={(productId) => onChangeDetail(det._id, { productId })}
                      multi={false}
                    />
                  </td>
                  <td>
                    <FormControl
                      type='number'
                      name="count"
                      value={det.count}
                      required={true}
                      onChange={e => {
                        const value = (e.target as any).value;
                        onChangeDetail(det._id, { count: value, amount: value * (det.unitPrice ?? 0) })
                      }
                      }
                    />
                  </td>
                  <td>
                    <FormControl
                      type='number'
                      name="unitPrice"
                      useNumberFormat={true}
                      fixed={3}
                      value={det.unitPrice}
                      required={true}
                      onChange={e => {
                        const value = (e.target as any).value;
                        onChangeDetail(det._id, { unitPrice: value, amount: value * (det.unitPrice ?? 0) })
                      }}
                    />
                  </td>
                  <td>
                    <FormControl
                      type='number'
                      name="amount"
                      fixed={3}
                      useNumberFormat={true}
                      value={(det.unitPrice ?? 0) * (det.count ?? 0)}
                      required={true}
                      onChange={e => {
                        const value = (e.target as any).value;
                        onChangeDetail(det._id, { amount: value, unitPrice: value / (det.count || 1) })
                      }}
                    />
                  </td>
                  <td>
                    <ActionButtons>
                      <Button btnStyle="link" icon="trash" onClick={onRemoveDetail.bind(det._id)} />
                    </ActionButtons>
                  </td>
                </tr>
              ))

            }
          </tbody>
        </Table>
        <ActionButtons>
          <Button btnStyle="link" icon="plus-circle" onClick={onAddDetail}>
            Add Row
          </Button>
          {renderBulkProductChooser()}
        </ActionButtons>
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
              filterParams={{ journals: ['inventory'] }}
              onSelect={(accountId, obj) => { onAccountChange(accountId, obj) }}
            />
          </FormGroup>
        </FormColumn>

        <FormColumn>
        </FormColumn>

        <FormColumn>
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

      {renderItems()}
    </>
  );
};

export default TrFormInvIncome;
