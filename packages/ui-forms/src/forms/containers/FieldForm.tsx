import ErrorMsg from "@erxes/ui/src/components/ErrorMsg";
import FieldForm from "../components/FieldForm";
import { IField } from "@erxes/ui/src/types";
import { IProductCategory } from "@erxes/ui-products/src/types";
import React from "react";
import Spinner from "@erxes/ui/src/components/Spinner";
import { gql } from "@apollo/client";
import { queries } from "../../../../plugin-inbox-ui/src/bookings/graphql";
import { useQuery } from "@apollo/client";

type Props = {
  onSubmit: (field: IField) => void;
  onDelete: (field: IField) => void;
  onCancel: () => void;
  mode: "create" | "update";
  field: IField;
  fields: IField[];
  numberOfPages: number;
  googleMapApiKey?: string;
};

const FormContainer = (props: Props) => {
  const { data, loading, error } = useQuery(gql(queries.productCategories), {
    skip: props.field.type !== "productCategory",
  });

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <ErrorMsg>{error.message}</ErrorMsg>;
  }

  const productCategories: IProductCategory[] =
    (data && data.productCategories) || [];

  return <FieldForm {...props} productCategories={productCategories} />;
};

export default FormContainer;
