import React from 'react';
import Form from '../../components/forms/TriggerDetailForm';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { LeadIntegrationsQueryResponse } from 'modules/leads/types';
import { INTEGRATION_KINDS } from 'modules/settings/integrations/constants';
import { withProps } from 'modules/common/utils';
import { queries } from 'modules/leads/graphql';

type Props = {
  closeModal: () => void;
  closeParentModal?: () => void;
  activeTrigger: string;
  contentId?: string;
  addTrigger: (value: string) => void;
};

type FinalProps = {
  integrationsQuery: LeadIntegrationsQueryResponse;
} & Props;

const TriggerDetailFormContainer = (props: FinalProps) => {
  const forms = props.integrationsQuery.integrations || [];

  const extendedProps = {
    ...props,
    forms
  };

  return <Form {...extendedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<
      Props,
      LeadIntegrationsQueryResponse,
      {
        page?: number;
        perPage?: number;
        tag?: string;
        kind?: string;
      }
    >(gql(queries.integrations), {
      name: 'integrationsQuery',
      options: () => {
        return {
          variables: {
            page: 1,
            perPage: 20,
            kind: INTEGRATION_KINDS.FORMS
          }
        };
      }
    })
  )(TriggerDetailFormContainer)
);
