import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';

import { withProps } from 'modules/common/utils';
import { queries as formQueries } from 'modules/forms/graphql';
import ConditionDetail from 'modules/segments/components/preview/PropertyDetail';
import { FieldsCombinedByTypeQueryResponse } from 'modules/settings/properties/types';
import React from 'react';
import { graphql } from 'react-apollo';

import { IField, ISegmentCondition } from '../../types';

type Props = {
  condition: ISegmentCondition;
  pipelineId?: string;
  segmentId?: string;
  onClickField: (field: IField, condition) => void;
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

    const fields = fieldsQuery.fieldsCombinedByContentType as any;

    let chosenField = fields.find(field => {
      return field.name === condition.propertyName;
    });

    chosenField = {
      value: chosenField.name || chosenField._id,
      label: chosenField.label || chosenField.title,
      type: (chosenField.type || '').toLowerCase(),
      group: chosenField.group || '',
      selectOptions: chosenField.selectOptions || [],

      choiceOptions: chosenField.options || []
    };

    return (
      <ConditionDetail
        {...this.props}
        field={chosenField}
        condition={condition}
      />
    );
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(formQueries.fieldsCombinedByContentType), {
      name: 'fieldsQuery',
      options: ({ condition, segmentId }) => ({
        variables: {
          contentType: ['visitor', 'lead', 'customer'].includes(
            condition.propertyType || ''
          )
            ? 'customer'
            : condition.propertyType,
          pipelineId: condition.pipelineId,
          segmentId
        }
      })
    })
  )(ConditionDetailContainer)
);
