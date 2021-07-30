import React from 'react';
import Form from '../../components/forms/ActionDetailForm';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { LeadIntegrationsQueryResponse } from 'modules/leads/types';
import { INTEGRATION_KINDS } from 'modules/settings/integrations/constants';
import { withProps } from 'modules/common/utils';
import { queries } from 'modules/forms/graphql';
import { IAction, ITrigger } from 'modules/automations/types';
import { IForm } from 'modules/forms/types';
import client from 'erxes-ui/lib/apolloClient';

type Props = {
  closeModal: () => void;
  closeParentModal?: () => void;
  currentAction: {
    trigger: ITrigger;
    action: IAction;
  };
  addAction: (value: string, contentId?: string) => void;
};

type FinalProps = {
  integrationsQuery: LeadIntegrationsQueryResponse;
} & Props;

class ActionDetailFOrm extends React.Component<FinalProps> {
  fetchFormDetail = (_id: string, callback: (form: IForm) => void) => {
    client
      .query({
        query: gql(queries.formDetail),
        fetchPolicy: 'network-only',
        variables: { _id }
      })
      .then(({ data }: any) => {
        callback(data.formDetail);
      });
  };

  render() {
    const extendedProps = {
      ...this.props,
      fetchFormDetail: this.fetchFormDetail
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
  )(ActionDetailFOrm)
);
