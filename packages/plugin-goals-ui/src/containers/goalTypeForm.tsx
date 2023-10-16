import { ButtonMutate, withProps } from '@erxes/ui/src';
import { IUser } from '@erxes/ui/src/auth/types';
import { UsersQueryResponse } from '@erxes/ui/src/auth/types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import * as compose from 'lodash.flowright';
import React from 'react';
import { Alert } from '@erxes/ui/src/utils';
import GoalTypeForm from '../components/goalTypeForm';
import { mutations, queries } from '../graphql';
import {
  IGoalType,
  BoardsQueryResponse,
  IStage,
  PipelinesQueryResponse,
  StagesQueryResponse
} from '../types';
import { __ } from 'coreui/utils';
import { graphql } from '@apollo/client/react/hoc';
import { gql } from '@apollo/client';
type Props = {
  goalType: IGoalType;
  getAssociatedGoalType?: (insuranceTypeId: string) => void;
  closeModal: () => void;
  type: string;
  stageId?: string;
  boardId: string;
  pipelineId: string;
  callback?: () => void;
  onChangeStage?: (stageId: string) => void;
  onChangePipeline: (pipelineId: string, stages: IStage[]) => void;
  onChangeBoard: (boardId: string) => void;
  autoSelectStage?: boolean;
  translator?: (key: string, options?: any) => string;
};

type FinalProps = {
  usersQuery: UsersQueryResponse;
  currentUser: IUser;
  boardsQuery: BoardsQueryResponse;
  pipelinesQuery: PipelinesQueryResponse;
  stagesQuery: StagesQueryResponse;
} & Props;

class GoalTypeFromContainer extends React.Component<FinalProps> {
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
    if (this.props.onChangeStage) {
      this.props.onChangeStage(stageId);
    }

    if (callback) {
      callback();
    }
  };
  render() {
    const { boardsQuery, pipelinesQuery, stagesQuery } = this.props;

    const boards = boardsQuery.boards || [];
    const pipelines = pipelinesQuery.pipelines || [];
    const stages = stagesQuery.stages || [];

    const renderButton = ({
      name,
      values,
      isSubmitted,
      object
    }: IButtonMutateProps) => {
      const { closeModal, getAssociatedGoalType } = this.props;

      const afterSave = data => {
        closeModal();

        if (getAssociatedGoalType) {
          getAssociatedGoalType(data.goalTypesAdd);
        }
      };

      return (
        <ButtonMutate
          mutation={object ? mutations.goalTypesEdit : mutations.goalTypesAdd}
          variables={values}
          callback={afterSave}
          refetchQueries={getRefetchQueries()}
          isSubmitted={isSubmitted}
          type="submit"
          successMessage={`You successfully ${
            object ? 'updated' : 'added'
          } a ${name}`}
        >
          {__('Save')}
        </ButtonMutate>
      );
    };
    const updatedProps = {
      ...this.props,
      renderButton,
      boards,
      pipelines,
      stages,
      onChangeBoard: this.onChangeBoard,
      onChangePipeline: this.onChangePipeline,
      onChangeStage: this.onChangeStage
    };
    return <GoalTypeForm selectedMembers={[]} {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return ['goalTypesMain', 'goalTypeDetail', 'goalTypes'];
};

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
    )
  )(GoalTypeFromContainer)
);
