import { ButtonMutate } from '@erxes/ui/src';

import { CompaniesQueryResponse } from '@erxes/ui-contacts/src/companies/types';
import { CustomersQueryResponse } from '@erxes/ui-contacts/src/customers/types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { IInvoice } from '../types';
import InvoiceForm from '../components/InvoiceForm';
import React from 'react';
import { queries as companyQueries } from '@erxes/ui-contacts/src/companies/graphql';
import { queries as customerQueries } from '@erxes/ui-contacts/src/customers/graphql';
import { gql } from '@apollo/client';
import { mutations } from '../graphql';
import { __ } from 'coreui/utils';
import { useQuery } from '@apollo/client';

type Props = {
  invoice: IInvoice;
  getAssociatedInvoice?: (invoiceId: string) => void;
  closeModal: () => void;
};

const InvoiceFromContainer = (props: Props) => {
  const { invoice, closeModal, getAssociatedInvoice } = props;

  const companiesQuery = useQuery<CompaniesQueryResponse>(
    gql(companyQueries.companies),
    {
      variables: {
        mainType: 'contract',
        mainTypeId: invoice && invoice.contractId,
        isSaved: true,
      },
    },
  );

  const customersQuery = useQuery<CustomersQueryResponse>(
    gql(customerQueries.customers),
    {
      variables: {
        mainType: 'contract',
        mainTypeId: invoice && invoice.contractId,
        isSaved: true,
      },
    },
  );

  if (companiesQuery.loading || customersQuery.loading) {
    return null;
  }

  const renderButton = ({
    name,
    values,
    isSubmitted,
    object,
  }: IButtonMutateProps) => {
    const afterSave = (data) => {
      closeModal();

      if (getAssociatedInvoice) {
        getAssociatedInvoice(data.invoicesAdd);
      }
    };

    return (
      <ButtonMutate
        mutation={
          object && object._id ? mutations.invoicesEdit : mutations.invoicesAdd
        }
        variables={values}
        callback={afterSave}
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${name}`}
      >
        {__('Save')}
      </ButtonMutate>
    );
  };

  const companies = companiesQuery?.data?.companies || [];
  const customers = customersQuery?.data?.customers || [];

  const updatedProps = {
    ...props,
    renderButton,
    companies,
    customers,
    invoice: { ...invoice },
  };
  return <InvoiceForm {...updatedProps} />;
};

const getRefetchQueries = () => {
  return ['invoiceDetail', 'activityLogs'];
};

export default InvoiceFromContainer;
