import { withProps } from '@erxes/ui/src/utils';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';

import PropertyLogics from '../components/PropertyLogics';
import { queries } from '../graphql';
import { FieldsCombinedByTypeQueryResponse } from '../types';

type Props = {
  contentType: string;
  currentField: any;
  onFieldChange: (data: any) => void;
};

type FinalProps = {
  fieldsCombinedByTypeQuery: FieldsCombinedByTypeQueryResponse;
} & Props;

const PropertyLogicContainer = (props: FinalProps) => {
  const { fieldsCombinedByTypeQuery, contentType } = props;

  const updatedProps = {
    ...props,
    contentType,
    fields: fieldsCombinedByTypeQuery.fieldsCombinedByContentType || []
  };

  return <PropertyLogics {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, FieldsCombinedByTypeQueryResponse, { contentType: string }>(
      gql(queries.fieldsCombinedByContentType),
      {
        name: 'fieldsCombinedByTypeQuery',
        options: ({ contentType }) => ({
          variables: {
            contentType
          }
        })
      }
    )
  )(PropertyLogicContainer)
);
