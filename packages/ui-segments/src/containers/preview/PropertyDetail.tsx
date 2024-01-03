import * as compose from 'lodash.flowright';

import { IField, ISegmentCondition } from '../../types';

import { FieldsCombinedByTypeQueryResponse } from '@erxes/ui-forms/src/settings/properties/types';
import PropertyDetail from '../../components/preview/PropertyDetail';
import React from 'react';
import { queries as formQueries } from '@erxes/ui-forms/src/forms/graphql';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { withProps } from '@erxes/ui/src/utils';

type Props = {
  condition: ISegmentCondition;
  config: any;
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

    if (!chosenProperty) {
      console.log(`Missing propertyName: ${condition.propertyName}`);
      return <></>;
    }

    chosenProperty = {
      value: chosenProperty.name || chosenProperty._id,
      label: chosenProperty.label || chosenProperty.title,
      type: (chosenProperty.type || '').toLowerCase(),
      group: chosenProperty.group || '',
      selectOptions: chosenProperty.selectOptions || [],

      choiceOptions: chosenProperty.options || [],
      validation: chosenProperty.validation || ''
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
      options: ({ condition, segmentId, config }) => ({
        variables: {
          contentType: condition.propertyType,
          segmentId,
          config
        }
      })
    })
  )(ConditionDetailContainer)
);
