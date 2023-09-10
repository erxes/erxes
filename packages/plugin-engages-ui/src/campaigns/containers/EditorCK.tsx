import * as compose from 'lodash.flowright';

import {
  FieldsCombinedByType,
  FieldsCombinedByTypeQueryResponse
} from '@erxes/ui-forms/src/settings/properties/types';

import EditorCK from '@erxes/ui/src/containers/EditorCK';
import { IEditorProps } from '@erxes/ui/src/types';
import React from 'react';
import { queries as fieldQueries } from '@erxes/ui-forms/src/settings/properties/graphql';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { isEnabled } from '@erxes/ui/src/utils/core';
import { queries } from '@erxes/ui-forms/src/forms/graphql';
import { withProps } from '@erxes/ui/src/utils';

const generateItemCustomFields = items =>
  (items || []).map(item => ({
    value: `itemCustomField.${item.fieldId}`,
    name: `${item.fieldName}:${item.pipelineName}:${item.boardName}`
  }));

const generateAttributes = (
  cardsFields,
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
    ...generateItemCustomFields(cardsFields.deal),

    { name: 'Purchase' },
    { value: 'purchaseProducts', name: 'Products' },
    { value: 'purchaseAmounts', name: 'Amount' },
    ...generateItemCustomFields(cardsFields.purchase),

    { name: 'Ticket' },
    ...generateItemCustomFields(cardsFields.ticket),

    { name: 'Task' },
    ...generateItemCustomFields(cardsFields.task)
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
  cardsFieldsQuery;
} & Props;

const EditorContainer = (props: FinalProps) => {
  const { combinedFieldsQuery, cardsFieldsQuery } = props;

  if (
    (combinedFieldsQuery && combinedFieldsQuery.loading) ||
    (cardsFieldsQuery && cardsFieldsQuery.loading)
  ) {
    return null;
  }

  const combinedFields =
    (combinedFieldsQuery && combinedFieldsQuery.fieldsCombinedByContentType) ||
    [];
  const cardsFields = (cardsFieldsQuery && cardsFieldsQuery.cardsFields) || {};

  const insertItems =
    props.insertItems || generateAttributes(cardsFields, combinedFields);

  return <EditorCK {...props} insertItems={insertItems} />;
};

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.fieldsCombinedByContentType), {
      name: 'combinedFieldsQuery',
      options: () => ({
        variables: {
          contentType: 'contacts:customer'
        }
      }),
      skip: !isEnabled('forms')
    }),
    graphql<Props>(gql(fieldQueries.cardsFields), {
      name: 'cardsFieldsQuery',
      skip: !isEnabled('cards')
    })
  )(EditorContainer)
);
