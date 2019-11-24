import Box from 'modules/common/components/Box';
import EmptyState from 'modules/common/components/EmptyState';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Spinner from 'modules/common/components/Spinner';
import { __, renderFullName } from 'modules/common/utils';
import GetConformity from 'modules/conformity/containers/GetConformity';
import {
  ButtonRelated,
  SectionBody,
  SectionBodyItem
} from 'modules/layout/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import CustomerChooser from '../../containers/CustomerChooser';
import { queries } from '../../graphql';
import { ICustomer } from '../../types';

type Props = {
  name: string;
  items: ICustomer[];
  mainType?: string;
  mainTypeId?: string;
  onSelect?: (customers: ICustomer[]) => void;
};

function Component({
  name,
  items = [],
  mainType = '',
  mainTypeId = '',
  onSelect
}: Props) {
  const mailTo = email => {
    if (email) {
      return (
        <a target="_parent" href={`mailto:${email}`} rel="noopener noreferrer">
          {email}
        </a>
      );
    }
    return null;
  };

  const renderRelatedCustomerChooser = props => {
    return (
      <CustomerChooser
        {...props}
        data={{ name, customers: items, mainTypeId, mainType, isRelated: true }}
        onSelect={onSelect}
      />
    );
  };

  const relCustomerTrigger = (
    <ButtonRelated>
      <button>{__('See related customers..')}</button>
    </ButtonRelated>
  );

  const relQuickButtons = (
    <ModalTrigger
      title="Related Associate"
      trigger={relCustomerTrigger}
      size="lg"
      content={renderRelatedCustomerChooser}
    />
  );

  const renderBody = (customersObj: ICustomer[]) => {
    if (!customersObj) {
      return <Spinner objective={true} />;
    }

    return (
      <SectionBody>
        {customersObj.map((customer, index) => (
          <SectionBodyItem key={index}>
            <Link to={`/contacts/customers/details/${customer._id}`}>
              <Icon icon="logout-2" />
            </Link>
            <span>{renderFullName(customer)}</span>
            {mailTo(customer.primaryEmail)}
            <span>{customer.primaryPhone}</span>
          </SectionBodyItem>
        ))}
        {customersObj.length === 0 && (
          <EmptyState icon="user-5" text="No customer" />
        )}
        {mainTypeId && mainType && relQuickButtons}
      </SectionBody>
    );
  };

  const customerChooser = props => {
    return (
      <CustomerChooser
        {...props}
        data={{ name, customers: items, mainTypeId, mainType }}
        onSelect={onSelect}
      />
    );
  };

  const extraButtons = (
    <ModalTrigger
      title="Associate"
      size="lg"
      trigger={
        <button>
          <Icon icon="add" />
        </button>
      }
      content={customerChooser}
    />
  );

  return (
    <Box
      title={__('Customers')}
      extraButtons={extraButtons}
      isOpen={true}
      name="showCustomers"
    >
      {renderBody(items)}
    </Box>
  );
}

type IProps = {
  mainType?: string;
  mainTypeId?: string;
  isOpen?: boolean;
  onSelect?: (datas: ICustomer[]) => void;
};

export default (props: IProps) => {
  return (
    <GetConformity
      {...props}
      relType="customer"
      component={Component}
      queryName="customers"
      itemsQuery={queries.customers}
    />
  );
};
