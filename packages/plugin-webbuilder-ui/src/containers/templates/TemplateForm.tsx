import * as compose from 'lodash.flowright';

import {
  ISite,
  ISiteDoc,
  SitesEditMutationResponse,
  TemplatesUseMutationResponse
} from '../../types';
import { mutations, queries } from '../../graphql';

import { Alert } from '@erxes/ui/src/utils';
import React from 'react';
import TemplateForm from '../../components/templates/TemplateForm';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';

type Props = {
  currentTemplateId?: string;
  closeModal: () => void;
  selectedSite: ISiteDoc;
};

type FinalProps = {} & Props &
  TemplatesUseMutationResponse &
  SitesEditMutationResponse;

function TemplateFormContainer(props: FinalProps) {
  const { templatesUse, sitesEditMutation, closeModal } = props;

  const useTemplate = (_id: string, name: string) => {
    templatesUse({ variables: { _id, name } })
      .then(res => {
        const {
          data: { webbuilderTemplatesUse }
        } = res;

        Alert.success('Successfully created a website');

        window.location.href = `/xbuilder/sites/edit/${webbuilderTemplatesUse}`;
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const saveSite = (_id: string, args: ISite) => {
    sitesEditMutation({ variables: { _id, ...args } })
      .then(res => {
        Alert.success('Successfully saved a website');
        closeModal();
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    useTemplate,
    saveSite
  };

  return <TemplateForm {...updatedProps} />;
}

export default compose(
  graphql<Props, TemplatesUseMutationResponse>(gql(mutations.templatesUse), {
    name: 'templatesUse',
    options: ({ selectedSite }) => ({
      refetchQueries: [
        { query: gql(queries.sites), variables: { fromSelect: true } },
        { query: gql(queries.sitesTotalCount) },
        {
          query: gql(queries.contentTypes),
          variables: {
            siteId: selectedSite
          }
        }
      ]
    })
  }),
  graphql<Props, SitesEditMutationResponse>(gql(mutations.sitesEdit), {
    name: 'sitesEditMutation',
    options: () => ({
      refetchQueries: [
        { query: gql(queries.sites), variables: { fromSelect: true } },
        { query: gql(queries.sitesTotalCount) }
      ]
    })
  })
)(TemplateFormContainer);
