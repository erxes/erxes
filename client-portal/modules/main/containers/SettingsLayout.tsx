import { Config, IUser, Store } from "../../types";
import { gql, useMutation } from "@apollo/client";

import Layout from "./Layout";
import React from "react";
import SettingsLayout from "../components/SettingsLayout";
import { mutations } from "../../user/graphql";

type Props = {
  children: (values: any) => JSX.Element;
};

function SettingsLayoutContainer(props: Props) {
  const [logout, { data, error }] = useMutation(gql(mutations.logout));

  if (error) {
    return <div>{error.message}</div>;
  }

  if (data) {
    window.location.href = "/";
  }

  return (
    <Layout headingSpacing={true}>
      {(layoutProps: Store) => (
        <SettingsLayout
          {...layoutProps}
          logout={logout}
          children={props.children}
        />
      )}
    </Layout>
  );
}

export default SettingsLayoutContainer;
