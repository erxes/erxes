import * as compose from 'lodash.flowright';

import {
  BoardsQueryResponse,
  StagesQueryResponse
} from '@erxes/ui-cards/src/boards/types';

import { DepartmentsQueryResponse } from '@erxes/ui/src/team/types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { IOption } from '../types';
import { IPipeline } from '@erxes/ui-cards/src/boards/types';
import PipelineForm from '../components/PipelineForm';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { queries } from '@erxes/ui-cards/src/settings/boards/graphql';
import { queries as teamQueries } from '@erxes/ui/src/team/graphql';
import { queries as tagQueries } from '@erxes/ui-tags/src/graphql';
import { TagsQueryResponse } from '@erxes/ui-tags/src/types';
import { withProps } from '@erxes/ui/src/utils';

type Props = {
  pipeline?: IPipeline;
  boardId?: string;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  show: boolean;
  type: string;
  options?: IOption;
};

type FinalProps = {
  stagesQuery: StagesQueryResponse;
  boardsQuery: BoardsQueryResponse;
  departmentsQuery: DepartmentsQueryResponse;
  tagsQuery: TagsQueryResponse;
} & Props;

class PipelineFormContainer extends React.Component<FinalProps> {
  render() {
    const {
      stagesQuery,
      boardsQuery,
      departmentsQuery,
      boardId,
      renderButton,
      options,
      tagsQuery
    } = this.props;

    if (
      (stagesQuery && stagesQuery.loading) ||
      (boardsQuery && boardsQuery.loading) ||
      (departmentsQuery && departmentsQuery.loading) ||
      (tagsQuery && tagsQuery.loading)
    ) {
      return <Spinner />;
    }

    const stages = stagesQuery ? stagesQuery.stages : [];
    const boards = boardsQuery.boards || [];
    const departments = departmentsQuery.departments || [];
    const tags = tagsQuery.tags || [];

    const extendedProps = {
      ...this.props,
      stages,
      boards,
      departments,
      boardId,
      renderButton,
      tags
    };

    const Form = options ? options.PipelineForm : PipelineForm;

    return <Form {...extendedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql(gql(tagQueries.tags), {
      name: 'tagsQuery',
      options: (props: Props) => ({
        variables: { type: `cards:${props.type}` }
      })
    }),

    graphql<Props, StagesQueryResponse, { pipelineId: string }>(
      gql(queries.stages),
      {
        name: 'stagesQuery',
        skip: props => !props.pipeline,
        options: ({ pipeline }: { pipeline?: IPipeline }) => ({
          variables: { pipelineId: pipeline ? pipeline._id : '', isAll: true },
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<{}, DepartmentsQueryResponse>(gql(teamQueries.departments), {
      name: 'departmentsQuery'
    }),
    graphql<Props, BoardsQueryResponse, {}>(gql(queries.boards), {
      name: 'boardsQuery',
      options: ({ type }) => ({
        variables: { type }
      })
    })
  )(PipelineFormContainer)
);
