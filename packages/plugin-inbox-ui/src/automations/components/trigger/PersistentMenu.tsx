import React from "react";
import * as compose from "lodash.flowright";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { withProps } from "@erxes/ui/src/utils/core";
import { QueryResponse } from "@erxes/ui/src/types";
import FormControl from "@erxes/ui/src/components/form/Control";
import Spinner from "@erxes/ui/src/components/Spinner";
import { ListItem } from "../../styles";
import colors from "@erxes/ui/src/styles/colors";
import EmptyState from "@erxes/ui/src/components/EmptyState";
import { IntegrationDetailQueryResponse } from "@erxes/ui-inbox/src/settings/integrations/types";
import { queries as integrationQueries } from "@erxes/ui-inbox/src/settings/integrations/graphql";
type Props = {
  botId?: string;
  onChange: (name: string, value: any) => void;
  persistentMenuIds?: string[];
  displaySelectedContent?: boolean;
};

type FinalProps = {
  botQueryResponse: { integrationDetail: any } & QueryResponse;
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
  displaySelectedContent
}: FinalProps) {
  const { integrationDetail, loading } = botQueryResponse || {};

  if (loading) {
    return <Spinner objective />;
  }

  const { messengerData = {} } = integrationDetail || {}; // Ensure messengerData exists
  const { persistentMenus = [] } = messengerData; // Destructure persistentMenus
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
        text='No persistent menus in selected bot'
        icon='list-ul'
        extra="Persistent menu with link can't display as selectable condition on section"
      />
    );
  }

  return persistentMenus.map(
    ({ _id, text, type }) =>
      type !== "link" && (
        <ListItem key={_id}>
          <FormControl
            componentclass='radio'
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
    graphql<Props, IntegrationDetailQueryResponse>(
      gql(integrationQueries.integrationDetail),
      {
        name: "botQueryResponse",
        options: ({ botId }) => ({
          variables: { _id: botId || "" }
        }),
        skip: ({ botId }) => !botId
      }
    )
  )(PersistentMenuSelector)
);
