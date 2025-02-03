import * as compose from "lodash.flowright";

import { IOptions, IPipeline, StagesQueryResponse } from "../../types";

import { IItem } from "../../types";
import Move from "../../components/editForm/Move";
import React from "react";
import { queries as boardQueries } from "../../graphql";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { withProps } from "@erxes/ui/src/utils";

type Props = {
  item: IItem;
  stageId?: string;
  options: IOptions;
  onChangeStage?: (stageId: string) => void;
  hasGreyBackground?: boolean;
};

class MoveContainer extends React.Component<{
  stagesQuery: any;
  options: IOptions;
}> {
  render() {
    const { stagesQuery } = this.props;

    const stages = stagesQuery.salesStages || [];

    const updatedProps = {
      ...this.props,
      stages,
    };

    return <Move {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<
      { item: { pipeline: IPipeline }; options: IOptions },
      StagesQueryResponse,
      { pipelineId: string }
    >(gql(boardQueries.stages), {
      name: "stagesQuery",
      options: ({ item: { pipeline } }) => ({
        variables: {
          pipelineId: pipeline._id,
        },
      }),
    })
  )(MoveContainer)
);
