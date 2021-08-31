import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';

import { withProps } from 'modules/common/utils';
import { queries as formQueries } from 'modules/forms/graphql';
import ConditionDetail from 'modules/segments/components/form/ConditionDetail';
import { FieldsCombinedByTypeQueryResponse } from 'modules/settings/properties/types';
import React from 'react';
import { graphql } from 'react-apollo';

import { ISegmentCondition } from '../../types';

type Props = {
  condition: ISegmentCondition;
};

type FinalProps = {
  fieldsQuery?: FieldsCombinedByTypeQueryResponse;
} & Props;

class ConditionDetailContainer extends React.Component<FinalProps, {}> {
  render() {
    const { fieldsQuery, condition } = this.props;

    if (!fieldsQuery || fieldsQuery.loading) {
      return <></>;
    }

    const fields = fieldsQuery.fieldsCombinedByContentType;

    const chosenField = fields.find(field => {
      return field.name === condition.propertyName;
    });

    return <ConditionDetail field={chosenField} condition={condition} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(formQueries.fieldsCombinedByContentType), {
      name: 'fieldsQuery',
      options: ({ condition }) => ({
        variables: {
          contentType: ['visitor', 'lead', 'customer'].includes(
            condition.propertyType || ''
          )
            ? 'customer'
            : condition.propertyType
        }
      })
    })
  )(ConditionDetailContainer)
);
