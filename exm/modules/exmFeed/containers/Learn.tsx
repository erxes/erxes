import Learn from "../components/Learn";
import React from "react";
import gql from "graphql-tag";
import { queries } from "../graphql";
import { useQuery } from "@apollo/client";

const LearnContainer = ({ currentUser }) => {
  const allUsersQuery = useQuery(gql(queries.allUsers));

  const users =
    allUsersQuery && !allUsersQuery.loading
      ? allUsersQuery.data.allUsers.filter((u) => u._id !== currentUser._id)
      : [];

  return <Learn currentUser={currentUser} />;
};

export default LearnContainer;
