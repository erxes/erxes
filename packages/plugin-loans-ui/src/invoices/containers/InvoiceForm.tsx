import * as compose from 'lodash.flowright';

import { ButtonMutate, withProps } from '@erxes/ui/src';

import { CompaniesQueryResponse } from '@erxes/ui-contacts/src/companies/types';
import { CustomersQueryResponse } from '@erxes/ui-contacts/src/customers/types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { IInvoice } from '../types';
import { IUser } from '@erxes/ui/src/auth/types';
import InvoiceForm from '../components/InvoiceForm';
import React from 'react';
import { UsersQueryResponse } from '@erxes/ui/src/auth/types';
import { queries as companyQueries } from '@erxes/ui-contacts/src/companies/graphql';
import { queries as customerQueries } from '@erxes/ui-contacts/src/customers/graphql';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { mutations } from '../graphql';

type Props = {
  invoice: IInvoice;
  getAssociatedInvoice?: (invoiceId: string) => void;
  closeModal: () => void;
};

type FinalProps = {
  usersQuery: UsersQueryResponse;
  currentUser: IUser;
  companiesQuery: CompaniesQueryResponse;
  customersQuery: CustomersQueryResponse;
} & Props;

class InvoiceFromContainer extends React.Component<FinalProps> {
  render() {
    const { companiesQuery, customersQuery, invoice } = this.props;

    if (companiesQuery.loading || customersQuery.loading) {
      return null;
    }

    const renderButton = ({
      name,
      values,
      isSubmitted,
      object
    }: IButtonMutateProps) => {
      const { closeModal, getAssociatedInvoice } = this.props;

      const afterSave = data => {
        closeModal();

        if (getAssociatedInvoice) {
          getAssociatedInvoice(data.invoicesAdd);
        }
      };

      return (
        <ButtonMutate
          mutation={
            object && object._id
              ? mutations.invoicesEdit
              : mutations.invoicesAdd
          }
          variables={values}
          callback={afterSave}
          refetchQueries={getRefetchQueries()}
          isSubmitted={isSubmitted}
          type="submit"
          successMessage={`You successfully ${
            object ? 'updated' : 'added'
          } a ${name}`}
        />
      );
    };

    const companies = companiesQuery.companies || [];
    const customers = customersQuery.customers || [];

    const updatedProps = {
      ...this.props,
      renderButton,
      companies,
      customers,
      invoice: { ...invoice }
    };
    return <InvoiceForm {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return ['invoiceDetail', 'activityLogs'];
};

export default withProps<Props>(
  compose(
    graphql<Props, CompaniesQueryResponse>(gql(companyQueries.companies), {
      name: 'companiesQuery',
      options: ({ invoice }) => ({
        variables: {
          mainType: 'contract',
          mainTypeId: invoice && invoice.contractId,
          isSaved: true
        }
      })
    }),
    graphql<Props, CustomersQueryResponse>(gql(customerQueries.customers), {
      name: 'customersQuery',
      options: ({ invoice }) => ({
        variables: {
          mainType: 'contract',
          mainTypeId: invoice && invoice.contractId,
          isSaved: true
        }
      })
    })
  )(InvoiceFromContainer)
);
