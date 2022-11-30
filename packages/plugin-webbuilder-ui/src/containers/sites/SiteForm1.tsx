import * as compose from 'lodash.flowright';

import {
  ISiteDoc,
  SitesAddMutationResponse,
  SitesEditMutationResponse
} from '../../types';
import { mutations, queries } from '../../graphql';

import Alert from '@erxes/ui/src/utils/Alert';
import React from 'react';
import SiteForm from '../../components/sites/SiteForm';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

type Props = {
  site?: ISiteDoc;
  closeModal: () => void;
  queryParams: any;
};

type FinalProps = {} & Props &
  SitesAddMutationResponse &
  SitesEditMutationResponse;

function SiteFormContainer(props: FinalProps) {
  const save = (variables: any, id: string) => {
    const { sitesAddMutation, sitesEditMutation, closeModal } = props;

    let method: any = sitesAddMutation;
    let message: string = 'create';

    if (id) {
      method = sitesEditMutation;
      variables._id = id;

      message = 'update';
    }

    method({ variables })
      .then(() => {
        Alert.success(`You successfully ${message} a site.`);

        closeModal();
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    save
  };

  return <SiteForm {...updatedProps} />;
}

const getRefetchQueries = queryParams => [
  {
    query: gql(queries.sites),
    variables: { ...generatePaginationParams(queryParams) }
  },
  { query: gql(queries.sitesTotalCount) }
];

export default compose(
  graphql<Props, SitesAddMutationResponse>(gql(mutations.sitesAdd), {
    name: 'sitesAddMutation',
    options: ({ queryParams }) => ({
      refetchQueries: getRefetchQueries(queryParams)
    })
  }),
  graphql<Props, SitesEditMutationResponse>(gql(mutations.sitesEdit), {
    name: 'sitesEditMutation',
    options: ({ queryParams }) => ({
      refetchQueries: getRefetchQueries(queryParams)
    })
  })
)(SiteFormContainer);
