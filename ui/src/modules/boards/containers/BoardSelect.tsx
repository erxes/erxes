import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { Alert, withProps } from '../../common/utils';
import BoardSelect from '../components/BoardSelect';
import { queries } from '../graphql';
import {
  BoardsQueryResponse,
  DealsQueryResponse,
  IStage,
  PipelinesQueryResponse,
  StagesQueryResponse,
  TasksQueryResponse,
  TicketsQueryResponse
} from '../types';

type Props = {
  type: string;
  cardId?: string;
  stageId?: string;
  boardId: string;
  pipelineId: string;
  callback?: () => void;
  onChangeStage?: (stageId: string) => void;
  onChangePipeline: (pipelineId: string, stages: IStage[]) => void;
  onChangeBoard: (boardId: string) => void;
  onChangeCard?: (cardId: string) => void;
  autoSelectStage?: boolean;
  autoSelectCard?: boolean;
};

type FinalProps = {
  boardsQuery: BoardsQueryResponse;
  pipelinesQuery: PipelinesQueryResponse;
  stagesQuery: StagesQueryResponse;
  tasksQuery: TasksQueryResponse;
  ticketsQuery: TicketsQueryResponse;
  dealsQuery: DealsQueryResponse;
} & Props;

class BoardSelectContainer extends React.Component<FinalProps> {
  onChangeBoard = (boardId: string) => {
    this.props.onChangeBoard(boardId);

    this.props.pipelinesQuery
      .refetch({ boardId })
      .then(({ data }) => {
        const pipelines = data.pipelines;

        if (pipelines.length > 0) {
          this.onChangePipeline(pipelines[0]._id);
        }
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  onChangePipeline = (pipelineId: string) => {
    const { stagesQuery } = this.props;

    stagesQuery
      .refetch({ pipelineId })
      .then(({ data }) => {
        const stages = data.stages;

        this.props.onChangePipeline(pipelineId, stages);

        if (
          stages.length > 0 &&
          typeof this.props.autoSelectStage === 'undefined'
        ) {
          this.onChangeStage(stages[0]._id);
        }
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  onChangeStage = (stageId: string, callback?: any) => {
      this.props.tasksQuery
        .refetch({ stageId })
        .then(({ data }) => {
          const tasks = data.tasks;

          if (this.props.onChangeStage) {
            this.props.onChangeStage(stageId);
          }


          if (
            tasks.length > 0 &&
            typeof this.props.autoSelectCard === 'undefined'
          ) {
            this.onChangeStage(tasks[0]._id);
          }
        })
        .catch(e => {
          Alert.error(e.message);
        });
    

    if (callback) {
      callback();
    }

  };

  onChangeCard = (cardId: string) => {
 
    if (this.props.onChangeCard) {
      this.props.onChangeCard(cardId);
    }

  }

  render() {
    const { boardsQuery, pipelinesQuery, stagesQuery, tasksQuery, ticketsQuery, dealsQuery ,type} = this.props;

    const boards = boardsQuery.boards || [];
    const pipelines = pipelinesQuery.pipelines || [];
    const stages = stagesQuery.stages || [];
    

    let cards: any[] = [];

    if (type === "deal"){
      cards = dealsQuery.deals || [];
    }else if (type === "task") {
      cards = tasksQuery.tasks || [];
    }else if (type === "ticket") {
      cards = ticketsQuery.tickets || [];
    }

    

    const extendedProps = {
      ...this.props,
      boards,
      pipelines,
      stages,
      cards,
      onChangeBoard: this.onChangeBoard,
      onChangePipeline: this.onChangePipeline,
      onChangeStage: this.onChangeStage,
      onChangeCard: this.onChangeCard
    };

    return <BoardSelect {...extendedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, BoardsQueryResponse>(gql(queries.boards), {
      name: 'boardsQuery',
      options: ({ type }) => ({
        variables: { type }
      })
    }),
    graphql<Props, PipelinesQueryResponse, { boardId: string }>(
      gql(queries.pipelines),
      {
        name: 'pipelinesQuery',
        options: ({ boardId = '' }) => ({
          variables: { boardId }
        })
      }
    ),
    graphql<Props, StagesQueryResponse, { pipelineId: string }>(
      gql(queries.stages),
      {
        name: 'stagesQuery',
        options: ({ pipelineId = '' }) => ({
          variables: { pipelineId }
        })
      }
    ),
    graphql<Props, TasksQueryResponse, { stageId: string }>(
      gql(queries.tasks),
      {
        name: 'tasksQuery',
        options: ({ stageId = '' }) => ({
          variables: { stageId }
        })
      }
    ),
    graphql<Props, TicketsQueryResponse, { stageId: string }>(
      gql(queries.tickets),
      {
        name: 'ticketsQuery',
        options: ({ stageId = '' }) => ({
          variables: { stageId }
        })
      }
    ),
    graphql<Props, DealsQueryResponse, { stageId: string }>(
      gql(queries.deals),
      {
        name: 'dealsQuery',
        options: ({ stageId = '' }) => ({
          variables: { stageId }
        })
      }
    )
  )(BoardSelectContainer)
);
