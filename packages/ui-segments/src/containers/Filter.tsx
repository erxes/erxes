import * as compose from "lodash.flowright";

import { Counts } from "@erxes/ui/src/types";
import { router, withProps } from "@erxes/ui/src/utils";
import { useLocation, useNavigate } from "react-router-dom";

import Filter from "../components/SidebarFilter";
import React from "react";
import { SegmentsQueryResponse } from "../types";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { queries } from "../graphql";

type Props = {
  contentType: string;
  config?: any;
  counts: Counts;
};

type FinalProps = {
  segmentsQuery: SegmentsQueryResponse;
} & Props;

const FilterContainer = (props: FinalProps) => {
  const { segmentsQuery } = props;

  const navigate = useNavigate();
  const location = useLocation();

  const currentSegment = router.getParam(location, "segment");

  const setSegment = (segment) => {
    router.setParams(navigate, location, { segment });
    router.removeParams(navigate, location, "page");
  };

  const removeSegment = () => {
    router.removeParams(navigate, location, "segment");
  };

  const extendedProps = {
    ...props,
    currentSegment,
    setSegment,
    removeSegment,
    segments: segmentsQuery.segments || [],
    loading: segmentsQuery.loading,
    treeView: true,
  };

  return <Filter {...extendedProps} />;
};

export default withProps<Props>(
  compose(
    graphql(gql(queries.segments), {
      name: "segmentsQuery",
      options: ({ contentType, config }: Props) => ({
        variables: { contentTypes: [contentType], config },
      }),
    })
  )(FilterContainer)
);
