import * as compose from "lodash.flowright";

import { router, withProps } from "@erxes/ui/src/utils";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { Counts } from "@erxes/ui/src/types";
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
  const [searchParams, setSearchParams] = useSearchParams();

  const currentSegment = router.getParam(location, "segment");

  const setSegment = (segment) => {
    setSearchParams({ segment: segment });
    searchParams.has("page") && searchParams.delete("page");
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
