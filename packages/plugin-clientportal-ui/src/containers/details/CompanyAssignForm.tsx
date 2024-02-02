import { Alert } from '@erxes/ui/src/utils';
import {
  ClientPortalUserAssignCompanyMutationResponse,
  IClientPortalUser,
} from '../../types';
import { mutations, queries } from '../../graphql';

import CompanyAssignForm from '../../components/detail/CompanyAssignForm';
import React from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client';

type Props = {
  queryParams?: any;
  clientPortalUser: IClientPortalUser;
  closeModal: () => void;
};

type FinalProps = {} & Props & ClientPortalUserAssignCompanyMutationResponse;

const FormContainer = (props: FinalProps) => {
  const { closeModal, clientPortalUser } = props;

  const [clientPortalUserAssignCompany] = useMutation(
    gql(mutations.clientPortalUserAssignCompany),
    {
      refetchQueries: [
        {
          query: gql(queries.clientPortalUserDetail),
          variables: { _id: clientPortalUser._id },
        },
      ],
    },
  );

  const assignCompany = (
    userId: string,
    erxesCompanyId: string,
    erxesCustomerId: string,
  ) => {
    clientPortalUserAssignCompany({
      variables: { erxesCustomerId, erxesCompanyId, userId },
    })
      .then(() => {
        Alert.success('Successfully assigned company');
        closeModal();
      })
      .catch((err) => Alert.error(err));
  };

  const updatedProps = {
    ...props,
  };

  return <CompanyAssignForm {...updatedProps} assignCompany={assignCompany} />;
};

export default FormContainer;
