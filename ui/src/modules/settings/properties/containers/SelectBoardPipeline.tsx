import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { queries } from 'modules/boards/graphql';
import { BoardsQueryResponse } from 'modules/boards/types';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import Spinner from 'modules/common/components/Spinner';
import { IButtonMutateProps } from 'modules/common/types';
import { mutations } from 'modules/settings/boards/graphql';
import { withProps } from 'modules/common/utils';
import React from 'react';
import { ChildProps, graphql } from 'react-apollo';
import SelectBoards from '../components/SelectBoardPipeline';
import { IBoardSelectItem } from '../types';

type Props = {
  onChangeItems: (items: any) => any;
  selectedItems: IBoardSelectItem[];
  isRequired?: boolean;
  description?: string;
  type: string;
};

type FinalProps = {
  boardsQuery: BoardsQueryResponse;
} & Props;

const SelectContainer = (props: ChildProps<FinalProps>) => {
  const { boardsQuery } = props;

  const boards = boardsQuery.boards || [];

  if (boardsQuery.loading) {
    return <Spinner objective={true} />;
  }

  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback
  }: IButtonMutateProps) => {
    const callBackResponse = () => {
      boardsQuery.refetch();

      if (callback) {
        callback();
      }
    };

    return (
      <ButtonMutate
        mutation={mutations.boardAdd}
        variables={values}
        callback={callBackResponse}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully added a ${name}`}
      />
    );
  };

  const updatedProps = {
    ...props,
    boards,
    items: [],
    renderButton
  };

  return <SelectBoards {...updatedProps} />;
};

const getRefetchQueries = () => {
  return [
    {
      query: gql(queries.boards),
      variables: {}
    }
  ];
};

export default withProps<Props>(
  compose(
    graphql<Props, BoardsQueryResponse, { type: string }>(gql(queries.boards), {
      name: 'boardsQuery',
      options: ({ type }) => ({
        variables: {
          type
        },
        refetchQueries: getRefetchQueries
      })
    })
  )(SelectContainer)
);
