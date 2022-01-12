import React from 'react';
import Form from '../../../../components/forms/triggers/subForms/FormSubmit';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { LeadIntegrationsQueryResponse } from '../../../../types';
import { INTEGRATION_KINDS } from '@erxes/ui-settings/src/integrations/constants';
import { withProps } from '@erxes/ui/src/utils';
import { queries } from '../../../../graphql';
import { ITrigger } from '../../../../types';

type Props = {
  closeModal: () => void;
  closeParentModal?: () => void;
  activeTrigger: ITrigger;
  contentId?: string;
  addTrigger: (value: string) => void;
  onSave: (contentId: string) => void;
};

type FinalProps = {
  integrationsQuery: LeadIntegrationsQueryResponse;
} & Props;

const FormSubmitContainer = (props: FinalProps) => {
  const formIntegrations = props.integrationsQuery.integrations || [];

  const extendedProps = {
    ...props,
    formIntegrations
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
  )(FormSubmitContainer)
);
