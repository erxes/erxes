import React, { useState } from "react";

import { Alert } from "../../utils";
import ErrorMsg from "../../common/ErrorMsg";
import General from "../components/General";
import { IExm } from "../../types";
import Spinner from "../../common/Spinner";
import client from "../../apolloClient";
import gql from "graphql-tag";
import { queries } from "../graphql";
import { useQuery } from "@apollo/client";

type Props = {
  exm: IExm;
  edit: (variables: IExm) => void;
};

export default function GeneralContainer(props: Props) {
  const brandsQuery = useQuery(gql(queries.allBrands), {
    variables: { kind: "lead" },
  });
  const kbQuery = useQuery(gql(queries.knowledgeBaseTopics));

  const [kbCategories, setKbCategories] = useState({});
  const [forms, setForms] = useState([]);

  if (brandsQuery.loading || kbQuery.loading) {
    return <Spinner />;
  }

  if (brandsQuery.error) {
    return <ErrorMsg>{brandsQuery.error.message}</ErrorMsg>;
  }

  if (kbQuery.error) {
    return <ErrorMsg>{kbQuery.error.message}</ErrorMsg>;
  }

  const getKbCategories = (topicId: string) => {
    client
      .query({
        query: gql(queries.knowledgeBaseCategories),
        fetchPolicy: "network-only",
        variables: { topicIds: [topicId] },
      })
      .then(({ data }) => {
        setKbCategories({
          ...kbCategories,
          [topicId]: data ? data.knowledgeBaseCategories : [],
        });
      });
  };

  const getForms = (brandId: string) => {
    client
      .query({
        query: gql(queries.integrations),
        fetchPolicy: "network-only",
        variables: { brandId, kind: "lead" },
      })
      .then(({ data }) => {
        setForms(data.integrations);
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  return (
    <General
      {...props}
      forms={forms}
      getForms={getForms}
      kbTopics={
        kbQuery && kbQuery.data ? kbQuery.data.knowledgeBaseTopics || [] : []
      }
      kbCategories={kbCategories}
      getKbCategories={getKbCategories}
      brands={brandsQuery.data.allBrands || []}
    />
  );
}
