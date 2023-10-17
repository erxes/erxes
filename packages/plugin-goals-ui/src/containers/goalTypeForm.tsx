import { ButtonMutate, withProps } from '@erxes/ui/src';
import { IUser } from '@erxes/ui/src/auth/types';
import { UsersQueryResponse } from '@erxes/ui/src/auth/types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import * as compose from 'lodash.flowright';
import React from 'react';
import { Alert } from '@erxes/ui/src/utils';
import GoalTypeForm from '../components/goalTypeForm';
import { mutations, queries } from '../graphql';
import Spinner from '@erxes/ui/src/components/Spinner';
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
import BoardSelect from '@erxes/ui-cards/src/boards/containers/BoardSelect';
import { ITopic } from '@erxes/ui-knowledgeBase/src/types';
import { IBoard, IPipeline } from '@erxes/ui-cards/src/boards/types';
type Props = {
  goalType: IGoalType;
  getAssociatedGoalType?: (insuranceTypeId: string) => void;
  closeModal: () => void;
  //   type: string;
  //   stageId?: string;
  //   boardId: string;
  //   pipelineId: string;
  //   callback?: () => void;
  //   onChangeStage?: (stageId: string) => void;
  //   onChangePipeline: (pipelineId: string, stages: IStage[]) => void;
  //   onChangeBoard: (boardId: string) => void;
  //   autoSelectStage?: boolean;
  //   translator?: (key: string, options?: any) => string;

  onChangeItems: (items: any) => any;
  selectedItems: any[];
  isRequired?: boolean;
  description?: string;
  type: string;

  topics: ITopic[];
  boards: IBoard[];
  pipelines: IPipeline[];
  fetchPipelines: (boardId: string) => void;
  handleFormChange: (name: string, value: string | boolean) => void;
};

type FinalProps = {
  usersQuery: UsersQueryResponse;
  currentUser: IUser;

  boardsQuery: BoardsQueryResponse;
} & Props;

class GoalTypeFromContainer extends React.Component<FinalProps> {
  render() {
    const { boardsQuery } = this.props;

    const boards = boardsQuery.boards || [];

    if (boardsQuery.loading) {
      return <Spinner objective={true} />;
    }

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
      renderButton
      // boards,
      // items: []

      // boards,
      // pipelines,
      // stages,
      // onChangeBoard: this.onChangeBoard,
      // onChangePipeline: this.onChangePipeline,
      // onChangeStage: this.onChangeStage
    };
    return <GoalTypeForm selectedMembers={[]} {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return ['goalTypesMain', 'goalTypeDetail', 'goalTypes'];
};
export default withProps<Props>(
  compose(
    graphql<Props, BoardsQueryResponse, { type: string }>(gql(queries.boards), {
      name: 'boardsQuery',
      options: ({ type }) => ({
        variables: {
          type: type = 'purchase'
        },
        refetchQueries: getRefetchQueries
      })
    })
  )(GoalTypeFromContainer)
);

// export default withProps<Props>(compose()(GoalTypeFromContainer));

// export default withProps<Props>(
//   compose(
//     graphql<Props, BoardsQueryResponse>(gql(queries.boards), {
//       name: 'boardsQuery',
//       options: ({ type }) => ({
//         variables: { type: 'deal' }
//       })
//     }),
//     graphql<Props, PipelinesQueryResponse, { boardId: string }>(
//       gql(queries.pipelines),
//       {
//         name: 'pipelinesQuery',
//         options: ({ boardId = '' }) => ({
//           variables: { boardId }
//         })
//       }
//     ),
//     graphql<Props, StagesQueryResponse, { pipelineId: string }>(
//       gql(queries.stages),
//       {
//         name: 'stagesQuery',
//         options: ({ pipelineId = '' }) => ({
//           variables: { pipelineId }
//         })
//       }
//     )
//   )(GoalTypeFromContainer)
// );
