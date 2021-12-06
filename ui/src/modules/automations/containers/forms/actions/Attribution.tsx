import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { withProps } from 'modules/common/utils';
import { queries as formQueries } from 'modules/forms/graphql';
import {
  FieldsCombinedByType,
  FieldsCombinedByTypeQueryResponse
} from 'modules/settings/properties/types';
import React from 'react';
import { graphql } from 'react-apollo';
import Form from '../../../components/forms/actions/placeHolder/Attribution';

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
            contentType: triggerType || 'customer'
          }
        })
      }
    )
  )(Attribution)
);
