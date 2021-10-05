import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Spinner from 'modules/common/components/Spinner';

import { withProps } from 'modules/common/utils';
import { queries as formQueries } from 'modules/forms/graphql';
import PropertyList from 'modules/segments/components/form/PropertyList';
import { IField } from 'modules/segments/types';
import { FieldsCombinedByTypeQueryResponse } from 'modules/settings/properties/types';
import React from 'react';
import { graphql } from 'react-apollo';

type Props = {
  contentType: string;
  searchValue: string;
  pipelineId: string;
  formId: string;
  onClickProperty: (field: IField) => void;
};

type FinalProps = {
  fieldsQuery?: FieldsCombinedByTypeQueryResponse;
} & Props;

class PropertyListContationer extends React.Component<FinalProps, {}> {
  render() {
    const { fieldsQuery, contentType, searchValue } = this.props;

    if (!fieldsQuery || fieldsQuery.loading) {
      return <Spinner />;
    }

    const fields = fieldsQuery.fieldsCombinedByContentType as any[];

    const condition = new RegExp(searchValue, 'i');

    const results = fields.filter(field => {
      return condition.test(field.label);
    });

    const cleanFields = results.map(item => ({
      value: item.name || item._id,
      label: item.label || item.title,
      type: (item.type || '').toLowerCase(),
      group: item.group || '',
      selectOptions: item.selectOptions || [],
      // radio button options
      choiceOptions: item.options || []
    }));

    return (
      <PropertyList
        {...this.props}
        fields={cleanFields}
        contentType={contentType}
      />
    );
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(formQueries.fieldsCombinedByContentType), {
      name: 'fieldsQuery',
      options: ({ contentType, pipelineId, formId }) => ({
        variables: {
          contentType: ['visitor', 'lead', 'customer'].includes(contentType)
            ? 'customer'
            : contentType,
          pipelineId,
          formId
        }
      })
    })
  )(PropertyListContationer)
);
