import { gql, useQuery } from "@apollo/client";
import {
  AccountBox,
  AccountItem,
  AccountTitle
} from "@erxes/ui-inbox/src/settings/integrations/styles";
import Button from "@erxes/ui/src/components/Button";
import EmptyState from "@erxes/ui/src/components/EmptyState";
import Spinner from "@erxes/ui/src/components/Spinner";
import { __ } from "@erxes/ui/src/utils/core";
import React from "react";
import { queries } from "../../graphql";
import client from "@erxes/ui/src/apolloClient";

export function SelectAccountPages({
  initialValue,
  filterParams,
  accountId,
  onSelect
}: {
  accountId: string;
  initialValue: string;
  filterParams?: any;
  onSelect: (value: string, name: string) => void;
}) {
  const { error, loading, data } = useQuery(gql(queries.instagramGetPages), {
    variables: {
      ...filterParams,
      accountId,
      kind: "instagram-messenger"
    },
    skip: !accountId
  });

  if (error) {
    return (
      <EmptyState
        icon='info-circle'
        text={error.message}
      />
    );
  }

  if (loading) {
    return <Spinner objective />;
  }

  const pages = data?.instagramGetPages || [];

  const handleSelectPage = (pageId) => {
    if (initialValue === pageId) {
      return onSelect("", "pageId");
    }

    onSelect(pageId, "pageId");
  };

  return (
    <AccountBox>
      <AccountTitle>{__("instagram pages")}</AccountTitle>
      {pages.map(({ id, name }) => (
        <AccountItem key={id}>
          <span>{name}</span>
          <Button
            onClick={() => handleSelectPage(id)}
            btnStyle={initialValue === id ? "primary" : "simple"}>
            {initialValue === id ? __("Selected") : __("Select This Page")}
          </Button>
        </AccountItem>
      ))}
    </AccountBox>
  );
}

export const fetchPageDetail = async (account, pageId) => {
  if (!account) return null;
  console.log(pageId, "page");
  let name;
  let profileUrl;

  await fetch(
    `https://graph.facebook.com/v13.0/${pageId}? 
     fields=username,profile_picture_url&access_token=${account.token}`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      name = data.username;
      profileUrl = data?.profile_picture_url;
    })
    .catch((error) => {
      console.error("Error fetching data from Graph API:", error);
    });

  return { profileUrl, name };
};
