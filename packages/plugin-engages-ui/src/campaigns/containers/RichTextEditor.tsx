import * as compose from "lodash.flowright";

import {
  FieldsCombinedByType,
  FieldsCombinedByTypeQueryResponse
} from "@erxes/ui-forms/src/settings/properties/types";

import { IEditorProps } from "@erxes/ui/src/types";
import React from "react";
import { queries as fieldQueries } from "@erxes/ui-forms/src/settings/properties/graphql";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { isEnabled } from "@erxes/ui/src/utils/core";
import { queries } from "@erxes/ui-forms/src/forms/graphql";
import { withProps } from "@erxes/ui/src/utils";
import { RichTextEditor } from "@erxes/ui/src/components/richTextEditor/TEditor";

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
    { name: "Customer" },
    { value: "customer.name", name: "Name" }
  ];

  (combinedFields || []).forEach(field =>
    items.push({ value: `customer.${field.name}`, name: field.label })
  );

  items = [
    ...items,
    { name: "User" },
    { value: "user.fullName", name: "Fullname" },
    { value: "user.position", name: "Position" },
    { value: "user.email", name: "Email" },

    { name: "Organization" },
    { value: "brandName", name: "BrandName" },
    { value: "domain", name: "Domain" },

    { name: "Card" },
    { value: "itemName", name: "Title" },
    { value: "itemDescription", name: "Description" },
    { value: "itemCreatedAt", name: "Created date" },
    { value: "itemCloseDate", name: "Close date" },
    { value: "itemModifiedAt", name: "Modified date" },

    { name: "Deal" },
    { value: "dealProducts", name: "Products" },
    { value: "dealAmounts", name: "Amount" },
    ...generateItemCustomFields(cardsFields.deal),

    { name: "Purchase" },
    { value: "purchaseProducts", name: "Products" },
    { value: "purchaseAmounts", name: "Amount" },
    ...generateItemCustomFields(cardsFields.purchase),

    { name: "Ticket" },
    ...generateItemCustomFields(cardsFields.ticket),

    { name: "Task" },
    ...generateItemCustomFields(cardsFields.task)
  ];

  return {
    items,
    title: "Attributes",
    label: "Attributes"
  };
};

type Props = {} & IEditorProps;

type FinalProps = {
  combinedFieldsQuery: FieldsCombinedByTypeQueryResponse;
  salesCardsFieldsQuery;
  tasksCardsFieldsQuery;
  ticketsCardsFieldsQuery;
  purchasesCardsFieldsQuery;
} & Props;

const EditorContainer = (props: FinalProps) => {
  const {
    combinedFieldsQuery,
    salesCardsFieldsQuery,
    tasksCardsFieldsQuery,
    ticketsCardsFieldsQuery,
    purchasesCardsFieldsQuery
  } = props;

  if (
    (combinedFieldsQuery && combinedFieldsQuery.loading) ||
    (salesCardsFieldsQuery && salesCardsFieldsQuery.loading) ||
    (tasksCardsFieldsQuery && tasksCardsFieldsQuery.loading) ||
    (ticketsCardsFieldsQuery && ticketsCardsFieldsQuery.loading) ||
    (purchasesCardsFieldsQuery && purchasesCardsFieldsQuery.loading)
  ) {
    return null;
  }

  const combinedFields =
    (combinedFieldsQuery && combinedFieldsQuery.fieldsCombinedByContentType) ||
    [];
  const salesFields =
    (salesCardsFieldsQuery && salesCardsFieldsQuery.salesCardsFields) || {};

  const tasksFields =
    (tasksCardsFieldsQuery && tasksCardsFieldsQuery.tasksCardsFields) || {};

  const ticketsFields =
    (ticketsCardsFieldsQuery && ticketsCardsFieldsQuery.ticketsCardsFields) ||
    {};

  const purchasesFields =
    (purchasesCardsFieldsQuery &&
      purchasesCardsFieldsQuery.purchasesCardsFields) ||
    {};

  const placeholderItems =
    props.insertItems ||
    generateAttributes(
      [...salesFields, ...tasksFields, ...ticketsFields, ...purchasesFields],
      combinedFields
    );

  return <RichTextEditor {...props} placeholderProp={placeholderItems} />;
};

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.fieldsCombinedByContentType), {
      name: "combinedFieldsQuery",
      options: () => ({
        variables: {
          contentType: "core:customer"
        }
      })
    }),
    graphql<Props>(gql(fieldQueries.salesCardsFields), {
      name: "salesCardsFieldsQuery",
      skip: !isEnabled("sales")
    }),
    graphql<Props>(gql(fieldQueries.tasksCardsFields), {
      name: "tasksCardsFieldsQuery",
      skip: !isEnabled("tasks")
    }),
    graphql<Props>(gql(fieldQueries.ticketsCardsFields), {
      name: "ticketsCardsFieldsQuery",
      skip: !isEnabled("tickets")
    }),
    graphql<Props>(gql(fieldQueries.purchasesCardsFields), {
      name: "purchasesCardsFieldsQuery",
      skip: !isEnabled("purchases")
    })
  )(EditorContainer)
);
