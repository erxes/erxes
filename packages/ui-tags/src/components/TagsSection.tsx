import {
  BarItems,
  Box,
  EmptyState,
  Icon,
  SidebarList,
  Spinner
} from "@erxes/ui/src";
import { generateTree, isEnabled } from "@erxes/ui/src/utils/core";
import { gql, useQuery } from "@apollo/client";
import { removeParams, setParams } from "@erxes/ui/src/utils/router";

import { Link } from "react-router-dom";
import React from "react";
import { SidebarListItem } from "@erxes/ui-settings/src/styles";
import { queries } from "../graphql";

export function TagsSection({
  location,
  navigate,
  queryParams,
  type
}: {
  location: any;
  navigate: any;
  queryParams: any;
  type: string;
}) {
  const { data, error, loading } = useQuery(gql(queries.tags), {
    variables: { type }
  });

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <EmptyState text={error.message} />;
  }

  const tags = data?.tags || [];

  const handleRemoveParams = () => {
    removeParams(navigate, location, "tagIds");
  };

  const handleSetParams = _id => {
    let tagIds = queryParams?.tagIds || [];
    tagIds = typeof tagIds === "string" ? [tagIds] : tagIds;
    if (tagIds.find(tagId => tagId === _id)) {
      tagIds = tagIds.filter(tagId => tagId !== _id);
    } else {
      tagIds = [...tagIds, _id];
    }
    removeParams(navigate, location, "page");
    setParams(navigate, location, { tagIds });
  };
  const extraButtons = (
    <BarItems>
      <Link to={`/settings/tags?tagType=${type}`}>
        <button>
          <Icon icon="cog" />
        </button>
      </Link>
      {queryParams.tagIds && (
        <a>
          <button onClick={handleRemoveParams}>
            <Icon icon="cancel-1" />
          </button>
        </a>
      )}
    </BarItems>
  );

  return (
    <Box name="tags" title="Filter by Tags" extraButtons={extraButtons} isOpen>
      <SidebarList>
        {generateTree(
          tags.map(tag => (!tag?.parentId ? { ...tag, parentId: null } : tag)),
          null,
          ({ _id, colorCode, name }, level) => {
            return (
              <SidebarListItem
                key={_id}
                $isActive={(queryParams?.tagIds || []).includes(_id)}
                onClick={handleSetParams.bind(this, _id)}
              >
                <a>
                  {"\u00A0 \u00A0 ".repeat(level)}
                  <Icon icon="tag-2" color={colorCode} />
                  {name}
                </a>
              </SidebarListItem>
            );
          }
        )}
      </SidebarList>
    </Box>
  );
}
