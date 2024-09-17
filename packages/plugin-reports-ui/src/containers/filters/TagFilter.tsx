import CountsByTag from "@erxes/ui/src/components/CountsByTag";
import React from "react";
import { TAG_TYPES } from "@erxes/ui-tags/src/constants";
import { gql } from "@apollo/client";
import { queries } from "../../graphql";
import { queries as tagQueries } from "@erxes/ui-tags/src/graphql";
import { useQuery } from "@apollo/client";

const DashboardFilterContainer = () => {
  const countByTagsQuery = useQuery(gql(queries.reportsCountByTags));
  const tagsQuery = useQuery(gql(tagQueries.tags), {
    variables: {
      type: TAG_TYPES.REPORT
    }
  });

  const counts = countByTagsQuery?.data?.reportsCountByTags || {};

  return (
    <CountsByTag
      tags={(tagsQuery ? tagsQuery.data?.tags : null) || []}
      counts={counts || {}}
      manageUrl="/settings/tags?type=dashboard:dashboard"
      loading={tagsQuery?.loading || false}
    />
  );
};

export default DashboardFilterContainer;
