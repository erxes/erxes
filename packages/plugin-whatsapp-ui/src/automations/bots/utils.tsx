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
  const { error, loading, data } = useQuery(gql(queries.whatsappGetNumbers), {
    variables: {
      ...filterParams,
      accountId,
      kind: "whatsapp-messenger"
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

  const pages = data?.whatsappGetNumbers || [];

  const handleSelectPage = (pageId) => {
    if (initialValue === pageId) {
      return onSelect("", "pageId");
    }

    onSelect(pageId, "pageId");
  };

  return (
    <AccountBox>
      <AccountTitle>{__("Whatsapp Numbers")}</AccountTitle>
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

export const fetchPageDetail = async (account, whatsappNumber) => {
  if (!account) return null;
  let name;
  let profileUrl;
  let display_phone_number;
  await fetch(
    `https://graph.facebook.com/v13.0/${whatsappNumber}?fields=&access_token=${account.token}`
  )
    .then((response) => response.json())
    .then((data) => {
      console.log(data, "dataaaa");
      name = data.verified_name;
      display_phone_number = data.display_phone_number;
      profileUrl = data?.picture?.data?.url;
    });

  return { profileUrl, name, display_phone_number };
};
