import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';

import { withProps } from 'modules/common/utils';
import { queries as formQueries } from 'modules/forms/graphql';
import PropertyDetail from 'modules/segments/components/preview/PropertyDetail';
import { FieldsCombinedByTypeQueryResponse } from 'modules/settings/properties/types';
import React from 'react';
import { graphql } from 'react-apollo';

import { IField, ISegmentCondition } from '../../types';

type Props = {
  condition: ISegmentCondition;
  pipelineId?: string;
  segmentId?: string;
  segmentKey: string;
  onClickProperty: (field: IField, condition, segmentKey: string) => void;
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

    let chosenProperty = fields.find(field => {
      return field.name === condition.propertyName;
    });

    chosenProperty = {
      value: chosenProperty.name || chosenProperty._id,
      label: chosenProperty.label || chosenProperty.title,
      type: (chosenProperty.type || '').toLowerCase(),
      group: chosenProperty.group || '',
      selectOptions: chosenProperty.selectOptions || [],

      choiceOptions: chosenProperty.options || []
    };

    return (
      <PropertyDetail
        {...this.props}
        field={chosenProperty}
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
          formId: condition.formId,
          segmentId
        }
      })
    })
  )(ConditionDetailContainer)
);
