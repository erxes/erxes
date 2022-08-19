import * as compose from 'lodash.flowright';

import { FieldsCombinedByTypeQueryResponse } from '@erxes/ui-forms/src/settings/properties/types';
import Form from '../../../../components/forms/actions/subForms/SetProperty';
import { IAction } from '../../../../types';
import React from 'react';
import { queries as formQueries } from '@erxes/ui-forms/src/forms/graphql';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { withProps } from '@erxes/ui/src/utils';

type Props = {
  contentType: string;
  activeAction: IAction;
  addAction: (action: IAction, id?: string, config?: any) => void;
  closeModal: () => void;
  triggerType: string;
};

type FinalProps = {
  fieldsCombinedByTypeQuery: FieldsCombinedByTypeQueryResponse;
} & Props;

type State = {
  contentType: string;
};

class SetProperty extends React.Component<FinalProps, State> {
  render() {
    const { fieldsCombinedByTypeQuery } = this.props;

    if (fieldsCombinedByTypeQuery.loading) {
      return null;
    }

    const fields = fieldsCombinedByTypeQuery.fieldsCombinedByContentType;

    const extendedProps = {
      ...this.props,
      fields
    };
    return <Form {...extendedProps} />;
  }
}

export const excludedNames = [
  'createdAt',
  'modifiedAt',
  'createdBy',
  'userId',
  'modifiedBy'
];

export default withProps<Props>(
  compose(
    graphql<Props, FieldsCombinedByTypeQueryResponse, State>(
      gql(formQueries.fieldsCombinedByContentType),
      {
        name: 'fieldsCombinedByTypeQuery',
        options: ({ activeAction }) => ({
          variables: {
            contentType: activeAction.config
              ? activeAction.config.module
              : 'customer',
            excludedNames
          }
        })
      }
    )
  )(SetProperty)
);
