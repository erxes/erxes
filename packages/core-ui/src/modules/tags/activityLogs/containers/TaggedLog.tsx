import * as compose from "lodash.flowright";

import { IActivityLog } from "@erxes/ui-log/src/activityLogs/types";
import React from "react";
import Spinner from "@erxes/ui/src/components/Spinner";
import TaggedLog from "../component/TaggedLog";
import { TagsQueryResponse } from "../../types";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { queries } from "@erxes/ui-tags/src/graphql";
import { withProps } from "@erxes/ui/src/utils";

type Props = {
  tagIds: string[];
  activity: IActivityLog;
};

type FinalProps = {
  tagsQuery: TagsQueryResponse;
} & Props;

const TaggedLogContainer = (props: FinalProps) => {
  const { tagsQuery } = props;

  if (tagsQuery.loading) {
    return <Spinner />;
  }

  const tags = tagsQuery.tags;

  return <TaggedLog tags={tags} {...props} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, TagsQueryResponse, { tagIds: string[] }>(gql(queries.tags), {
      name: "tagsQuery",
      options: ({ tagIds }) => ({
        variables: { tagIds },
        fetchPolicy: "network-only",
      }),
    })
  )(TaggedLogContainer)
);
