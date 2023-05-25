import { IButtonMutateProps } from '@erxes/ui/src/types';
import {
  ClientPortalUserAssignCompanyMutationResponse,
  CompaniesMainQueryResponse,
  IClientPortalUser
} from '../../types';
import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Alert, withProps } from '@erxes/ui/src/utils';

import * as compose from 'lodash.flowright';

import { mutations, queries } from '../../graphql';
import CompanyAssignForm from '../../components/detail/CompanyAssignForm';
import { ButtonMutate, Spinner } from '@erxes/ui/src';
import { queries as companyQueries } from '@erxes/ui-contacts/src/companies/graphql';

type Props = {
  queryParams: any;
  clientPortalUser: IClientPortalUser;
  closeModal: () => void;
};

type FinalProps = {
  companiesMainQuery: CompaniesMainQueryResponse;
} & Props &
  ClientPortalUserAssignCompanyMutationResponse;

const FormContainer = (props: FinalProps) => {
  const { clientPortalUserAssignCompany, closeModal } = props;

  const assignCompany = (userId: string, erxesCompanyId: string) => {
    clientPortalUserAssignCompany({
      variables: { erxesCompanyId, userId }
    })
      .then(() => closeModal())
      .catch(err => Alert.error(err));
  };

  const updatedProps = {
    ...props
  };

  return <CompanyAssignForm {...updatedProps} assignCompany={assignCompany} />;
};

export default withProps<Props>(
  compose(
    graphql(gql(mutations.clientPortalUserAssignCompany), {
      name: 'clientPortalUserAssignCompany'
    })
  )(FormContainer)
);
