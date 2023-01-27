import * as compose from 'lodash.flowright';

import {
  TemplatesQueryResponse,
  TemplatesTotalCountQueryResponse,
  TemplatesUseMutationResponse
} from '../../types';
import { mutations, queries } from '../../graphql';

import { Alert } from '@erxes/ui/src/utils';
import List from '../../components/templates/List';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import TemplateForm from '../../components/templates/TemplateForm';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

type Props = {
  currentTemplateId?: string;
  closeModal: () => void;
  selectedSite: string;
};

type FinalProps = {} & Props & TemplatesUseMutationResponse;

function TemplateFormContainer(props: FinalProps) {
  const { templatesUse } = props;

  const use = (_id: string, name: string) => {
    templatesUse({ variables: { _id, name } })
      .then(res => {
        const {
          data: { webbuilderTemplatesUse }
        } = res;

        Alert.success('Successfully created a website');

        window.location.href = `/webbuilder/sites/edit/${webbuilderTemplatesUse}`;
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };
  const updatedProps = {
    ...props,
    use
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
  })
)(TemplateFormContainer);
