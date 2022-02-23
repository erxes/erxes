import EditorCK from '@erxes/ui/src/containers/EditorCK';
import { withProps } from '@erxes/ui/src/utils';
import * as compose from 'lodash.flowright';
import gql from 'graphql-tag';
import React from 'react';
import { IEditorProps } from '@erxes/ui/src/types';
import {
  FieldsCombinedByType,
  FieldsCombinedByTypeQueryResponse
} from '@erxes/ui-settings/src/properties/types';
import { graphql } from 'react-apollo';
import { queries } from '@erxes/ui-forms/src/forms/graphql';
import { queries as fieldQueries } from '@erxes/ui-settings/src/properties/graphql';

const generateItemCustomFields = items =>
  (items || []).map(item => ({
    value: `itemCustomField.${item.fieldId}`,
    name: `${item.fieldName}:${item.pipelineName}:${item.boardName}`
  }));

const generateAttributes = (
  itemTypeFields,
  combinedFields?: FieldsCombinedByType[]
) => {
  let items: Array<{ name: string; value?: string }> = [
    { name: 'Customer' },
    { value: 'customer.name', name: 'Name' }
  ];

  (combinedFields || []).forEach(field =>
    items.push({ value: `customer.${field.name}`, name: field.label })
  );

  items = [
    ...items,
    { name: 'User' },
    { value: 'user.fullName', name: 'Fullname' },
    { value: 'user.position', name: 'Position' },
    { value: 'user.email', name: 'Email' },

    { name: 'Organization' },
    { value: 'brandName', name: 'BrandName' },
    { value: 'domain', name: 'Domain' },

    { name: 'Card' },
    { value: 'itemName', name: 'Title' },
    { value: 'itemDescription', name: 'Description' },
    { value: 'itemCreatedAt', name: 'Created date' },
    { value: 'itemCloseDate', name: 'Close date' },
    { value: 'itemModifiedAt', name: 'Modified date' },

    { name: 'Deal' },
    { value: 'dealProducts', name: 'Products' },
    { value: 'dealAmounts', name: 'Amount' },
    ...generateItemCustomFields(itemTypeFields.deal),

    { name: 'Ticket' },
    ...generateItemCustomFields(itemTypeFields.ticket),

    { name: 'Task' },
    ...generateItemCustomFields(itemTypeFields.task)
  ];

  return {
    items,
    title: 'Attributes',
    label: 'Attributes'
  };
};

type Props = {} & IEditorProps;

type FinalProps = {
  combinedFieldsQuery: FieldsCombinedByTypeQueryResponse;
  fieldsItemTypedQuery;
} & Props;

const EditorContainer = (props: FinalProps) => {
  const { combinedFieldsQuery, fieldsItemTypedQuery } = props;

  if (combinedFieldsQuery.loading || fieldsItemTypedQuery.loading) {
    return null;
  }

  const combinedFields = combinedFieldsQuery.fieldsCombinedByContentType || [];
  const itemTypeFields = fieldsItemTypedQuery.fieldsItemTyped || {};

  const insertItems =
    props.insertItems || generateAttributes(itemTypeFields, combinedFields);

  return <EditorCK {...props} insertItems={insertItems} />;
};

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.fieldsCombinedByContentType), {
      name: 'combinedFieldsQuery',
      options: () => ({
        variables: {
          contentType: 'customer'
        }
      })
    }),
    graphql<Props>(gql(fieldQueries.fieldsItemTyped), {
      name: 'fieldsItemTypedQuery'
    })
  )(EditorContainer)
);
