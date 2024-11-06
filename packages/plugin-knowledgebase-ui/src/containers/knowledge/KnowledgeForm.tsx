import { gql, useQuery } from "@apollo/client";

import { BrandsQueryResponse } from "@erxes/ui/src/brands/types";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import { ITopic } from "@erxes/ui-knowledgebase/src/types";
import KnowledgeForm from "../../components/knowledge/KnowledgeForm";
import React from "react";
import Spinner from "@erxes/ui/src/components/Spinner";
import { queries as brandQueries } from "@erxes/ui/src/brands/graphql";
import { isEnabled } from "@erxes/ui/src/utils/core";
import { queries } from "@erxes/ui-knowledgebase/src/graphql";

type Props = {
  topic: ITopic;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

const KnowledgeFormContainer = ({ topic, ...props }: Props) => {
  const getBrandListQuery = useQuery<BrandsQueryResponse>(
    gql(brandQueries.brands),
    {
      fetchPolicy: "network-only"
    }
  );

  const getSegmentListQuery = useQuery<any>(gql(queries.getSegmentList), {
    variables: {
      contentTypes: ["core:user"]
    }
  });

  if (getBrandListQuery.loading || getSegmentListQuery.loading) {
    return <Spinner objective={true} />;
  }

  const updatedProps = {
    ...props,
    topic,
    segments: getSegmentListQuery?.data?.segments || [],
    brands: getBrandListQuery?.data?.brands || []
  };

  return <KnowledgeForm {...updatedProps} />;
};

export default KnowledgeFormContainer;
