import { CountByTagsQueryResponse } from "../types";
import CountsByTag from "@erxes/ui/src/components/CountsByTag";
import React from "react";
import { TAG_TYPES } from "@erxes/ui-tags/src/constants";
import { TagsQueryResponse } from "@erxes/ui-tags/src/types";
import { gql } from "@apollo/client";
import { queries } from "../graphql";
import { queries as tagQueries } from "@erxes/ui-tags/src/graphql";
import { useQuery } from "@apollo/client";

const TagFilterContainer = () => {
  const countByTagsQuery = useQuery<CountByTagsQueryResponse>(
    gql(queries.productCountByTags)
  );
  const tagsQuery = useQuery<TagsQueryResponse>(gql(tagQueries.tags), {
    variables: {
      type: TAG_TYPES.PRODUCT
    }
  });

  const counts =
    (countByTagsQuery.data && countByTagsQuery.data.productCountByTags) || {};
  const tags = (tagsQuery.data && tagsQuery.data.tags) || [];

  return (
    <CountsByTag
      tags={tags}
      counts={counts}
      manageUrl="/settings/tags?type=core:product"
      loading={(tagsQuery ? tagsQuery.loading : null) || false}
    />
  );
};

export default TagFilterContainer;
