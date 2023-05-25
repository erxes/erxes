import { IButtonMutateProps } from '@erxes/ui/src/types';
import {
  ClientPortalUserAssignCompanyMutationResponse,
  IClientPortalUser
} from '../../types';
import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Alert, withProps } from '@erxes/ui/src/utils';

import * as compose from 'lodash.flowright';

import { mutations, queries } from '../../graphql';
import CompanyAssignForm from '../../components/detail/CompanyAssignForm';

type Props = {
  queryParams: any;
  clientPortalUser: IClientPortalUser;
  closeModal: () => void;
};

type FinalProps = {} & Props & ClientPortalUserAssignCompanyMutationResponse;

const FormContainer = (props: FinalProps) => {
  const { clientPortalUserAssignCompany, closeModal } = props;

  const assignCompany = (
    userId: string,
    erxesCompanyId: string,
    erxesCustomerId: string
  ) => {
    clientPortalUserAssignCompany({
      variables: { erxesCustomerId, erxesCompanyId, userId }
    })
      .then(() => {
        Alert.success('Successfully assigned company');
        closeModal();
      })
      .catch(err => Alert.error(err));
  };

  const updatedProps = {
    ...props
  };

  return <CompanyAssignForm {...updatedProps} assignCompany={assignCompany} />;
};

export default withProps<Props>(
  compose(
    graphql<Props>(gql(mutations.clientPortalUserAssignCompany), {
      name: 'clientPortalUserAssignCompany',
      options: ({ clientPortalUser }) => ({
        refetchQueries: [
          {
            query: gql(queries.clientPortalUserDetail),
            variables: { _id: clientPortalUser._id }
          }
        ]
      })
    })
  )(FormContainer)
);
