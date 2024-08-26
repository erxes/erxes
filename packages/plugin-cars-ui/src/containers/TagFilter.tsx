import { CountByTagsQueryResponse } from "../types";
import { TagsQueryResponse } from "@erxes/ui-tags/src/types";
import CountsByTag from "@erxes/ui/src/components/CountsByTag";
import React from "react";
import { gql, useQuery } from "@apollo/client";
import { queries } from "../graphql";
import { queries as tagQueries } from "@erxes/ui-tags/src/graphql";

const TagFilterContainer = () => {
  const countByTagsQuery = useQuery<CountByTagsQueryResponse>(
    gql(queries.carCountByTags)
  );

  const tagsQuery = useQuery<TagsQueryResponse>(gql(tagQueries.tags), {
    variables: {
      type: "cars:car"
    }
  });

  const counts = countByTagsQuery?.data?.carCountByTags || {};

  return (
    <CountsByTag
      tags={(tagsQuery ? tagsQuery?.data?.tags : null) || []}
      counts={counts}
      manageUrl="/settings/tags?type=core:product"
      loading={(tagsQuery ? tagsQuery.loading : null) || false}
    />
  );
};

export default TagFilterContainer;
