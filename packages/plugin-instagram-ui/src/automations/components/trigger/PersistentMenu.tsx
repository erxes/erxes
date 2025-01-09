import React from "react";
import * as compose from "lodash.flowright";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { queries } from "../../bots/graphql";
import { withProps } from "@erxes/ui/src/utils/core";
import { QueryResponse } from "@erxes/ui/src/types";
import FormControl from "@erxes/ui/src/components/form/Control";
import Spinner from "@erxes/ui/src/components/Spinner";
import { ListItem } from "../../styles";
import colors from "@erxes/ui/src/styles/colors";
import EmptyState from "@erxes/ui/src/components/EmptyState";

type Props = {
  botId?: string;
  onChange: (name: string, value: any) => void;
  persistentMenuIds?: string[];
  displaySelectedContent?: boolean;
};

type FinalProps = {
  botQueryResponse: { igbootMessengerBot: any } & QueryResponse;
} & Props;

const renderSelectedMenus = (persistentMenus: any[], ids: string[]) => {
  return (
    <span style={{ color: colors.colorPrimary }}>
      {persistentMenus
        .filter((menu) => ids.includes(menu._id))
        .map((persistentMenu) => persistentMenu.text)
        .join(",")}
    </span>
  );
};

function PersistentMenuSelector({
  botQueryResponse,
  persistentMenuIds = [],
  onChange,
  displaySelectedContent,
}: FinalProps) {
  const { igbootMessengerBot, loading } = botQueryResponse || {};

  if (loading) {
    return <Spinner objective />;
  }

  const { persistentMenus = [] } = igbootMessengerBot || {};

  if (displaySelectedContent) {
    return renderSelectedMenus(persistentMenus, persistentMenuIds);
  }

  const onCheck = (_id) => {
    const updatedMenuIds = persistentMenuIds.includes(_id)
      ? persistentMenuIds.filter((id) => id !== _id)
      : [...persistentMenuIds, _id];

    onChange("persistentMenuIds", updatedMenuIds);
  };

  if (!persistentMenus.length) {
    return (
      <EmptyState
        text="No persistent menus in selected bot"
        icon="list-ul"
        extra="Persistent menu with link can't display as selectable condition on section"
      />
    );
  }

  return persistentMenus.map(
    ({ _id, text, type }) =>
      type !== "link" && (
        <ListItem key={_id}>
          <FormControl
            componentclass="radio"
            color={colors.colorCoreBlue}
            checked={persistentMenuIds?.includes(_id)}
            onClick={() => onCheck(_id)}
          />
          <span>{text}</span>
        </ListItem>
      )
  );
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.detail), {
      name: "botQueryResponse",
      options: ({ botId }) => ({
        variables: { _id: botId },
      }),
      skip: ({ botId }) => !botId,
    })
  )(PersistentMenuSelector)
);
