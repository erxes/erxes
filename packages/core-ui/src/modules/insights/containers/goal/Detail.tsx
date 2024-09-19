import React from 'react';

import { gql, useQuery } from '@apollo/client';

import Detail from '../../components/goal/Detail';
import { queries } from '../../graphql';
import { IGoalType } from '../../types';

type Props = {
  goal: IGoalType;
};

const DetailContainer = (props: Props) => {
  const { goal } = props;

  const pipelineDetailQuery = useQuery(gql(queries.pipelineDetail), {
    skip: !goal.pipelineId,
    variables: {
      _id: goal.pipelineId,
    },
  });

  const boardDetailQuery = useQuery(gql(queries.boardDetail), {
    skip: !goal.boardId,
    variables: {
      _id: goal.boardId,
    },
  });

  const stageDetailQuery = useQuery(gql(queries.stageDetail), {
    skip: !goal.stageId,
    variables: {
      _id: goal.stageId,
    },
  });

  const userDetailQuery = useQuery(gql(queries.userDetail), {
    skip: !goal.contribution?.length,
    variables: {
      _id: goal.contribution && goal.contribution[0],
    },
  });

  if (
    pipelineDetailQuery.loading ||
    boardDetailQuery.loading ||
    stageDetailQuery.loading ||
    userDetailQuery.loading
  ) {
    return null;
  }

  const updatedProps = {
    goal,
    pipelineDetail: pipelineDetailQuery?.data?.pipelineDetail || {},
    boardDetail: boardDetailQuery?.data?.boardDetail || {},
    stageDetail: stageDetailQuery?.data?.stageDetail || {},
    userDetail: userDetailQuery?.data?.userDetail || {},
  };

  return <Detail {...updatedProps} />;
};

export default DetailContainer;
