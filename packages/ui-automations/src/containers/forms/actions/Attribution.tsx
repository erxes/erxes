import * as compose from 'lodash.flowright';

import {
  FieldsCombinedByType,
  FieldsCombinedByTypeQueryResponse
} from '@erxes/ui-forms/src/settings/properties/types';

import Form from '../../../components/forms/actions/placeHolder/Attribution';
import React from 'react';
import { queries as formQueries } from '@erxes/ui-forms/src/forms/graphql';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { withProps } from '@erxes/ui/src/utils';

type Props = {
  config: any;
  triggerType: string;
  setConfig: (config: any) => void;
  inputName?: string;
  fieldType?: string;
  attrType?: string;
  onlySet?: boolean;
  customAttributions?: FieldsCombinedByType[];
};

type FinalProps = {
  fieldsCombinedByTypeQuery: FieldsCombinedByTypeQueryResponse;
} & Props;

type State = {
  contentType: string;
};

class Attribution extends React.Component<FinalProps, State> {
  render() {
    const { fieldsCombinedByTypeQuery } = this.props;

    if (fieldsCombinedByTypeQuery.loading) {
      return null;
    }

    const attributions = fieldsCombinedByTypeQuery.fieldsCombinedByContentType.concat(
      this.props.customAttributions || []
    );

    const extendedProps = {
      ...this.props,
      attributions
    };
    return <Form {...extendedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, FieldsCombinedByTypeQueryResponse, State>(
      gql(formQueries.fieldsCombinedByContentType),
      {
        name: 'fieldsCombinedByTypeQuery',
        options: ({ triggerType }) => ({
          variables: {
            contentType: triggerType
          }
        })
      }
    )
  )(Attribution)
);
