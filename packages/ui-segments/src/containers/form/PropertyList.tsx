import * as compose from 'lodash.flowright';

import { FieldsCombinedByTypeQueryResponse } from '@erxes/ui-forms/src/settings/properties/types';
import { IField } from '../../types';
import PropertyList from '../../components/form/PropertyList';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { queries as formQueries } from '@erxes/ui-forms/src/forms/graphql';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { withProps } from '@erxes/ui/src/utils';

type Props = {
  contentType: string;
  searchValue: string;
  config: any;
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

    const results = (fields || []).filter(field => {
      return condition.test(field.label);
    });

    const cleanFields = results.map(item => ({
      value: item.name || item._id,
      label: item.label || item.title,
      type: (item.type || '').toLowerCase(),
      group: item.group || '',
      selectOptions: item.selectOptions || [],
      // radio button options
      choiceOptions: item.options || [],
      validation: item.validation || ''
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
      options: ({ contentType, config }) => ({
        variables: {
          contentType,
          config
        }
      })
    })
  )(PropertyListContationer)
);
