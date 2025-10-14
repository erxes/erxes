import { useParams } from "react-router-dom";
import { gql, useQuery } from "@apollo/client";
import queries from "../graphql/queries";
import Spinner from "@erxes/ui/src/components/Spinner";
import React from "react";
import Form from "../components/Form";

export default function FormContainer() {
  const { id } = useParams();

  const { data, loading, refetch } = useQuery(gql(queries.scoreCampaign), {
    variables: {
      _id: id,
    },
  });

  if (loading) {
    return <Spinner />;
  }
  const campaign = data?.scoreCampaign;

  return <Form campaign={campaign} refetch={refetch} />;
}
