import React from 'react';
import Form from '../../../components/forms/actions/IfForm';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { LeadIntegrationsQueryResponse } from 'modules/leads/types';
import { INTEGRATION_KINDS } from 'modules/settings/integrations/constants';
import { withProps } from 'modules/common/utils';
import { queries } from 'modules/forms/graphql';
import { IAction, ITrigger } from 'modules/automations/types';
import client from 'erxes-ui/lib/apolloClient';
import { IField } from 'modules/settings/properties/types';

type Props = {
  closeModal: () => void;
  closeParentModal?: () => void;
  currentAction: {
    trigger: ITrigger;
    action: IAction;
  };
  addActionConfig: (config: any) => void;
  addAction: (value: string, contentId?: string) => void;
};

type FinalProps = {
  integrationsQuery: LeadIntegrationsQueryResponse;
} & Props;

class IfForm extends React.Component<FinalProps> {
  fetchFormFields = (formId: string, callback: (fields: IField[]) => void) => {
    client
      .query({
        query: gql(queries.fields),
        fetchPolicy: 'network-only',
        variables: { contentType: 'form', contentTypeId: formId }
      })
      .then(({ data }: any) => {
        callback(data.fields);
      });
  };

  render() {
    const extendedProps = {
      ...this.props,
      fetchFormFields: this.fetchFormFields
    };

    return <Form {...extendedProps} />;
  }
}

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
  )(IfForm)
);
