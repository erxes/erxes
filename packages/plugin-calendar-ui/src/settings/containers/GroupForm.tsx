import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import Spinner from '@erxes/ui/src/components/Spinner';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { withProps } from '@erxes/ui/src/utils';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import GroupForm from '../components/GroupForm';
import { queries } from '../graphql';
import { BoardsQueryResponse, IGroup } from '../types';

type Props = {
  group?: IGroup;
  boardId?: string;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  show: boolean;
};

type FinalProps = {
  boardsQuery: BoardsQueryResponse;
} & Props;

class GroupFormContainer extends React.Component<FinalProps> {
  render() {
    const { boardsQuery, boardId, renderButton } = this.props;

    if (boardsQuery.loading) {
      return <Spinner />;
    }

    const boards = boardsQuery.calendarBoards || [];

    const extendedProps = {
      ...this.props,
      boards,
      boardId,
      renderButton
    };

    return <GroupForm {...extendedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, BoardsQueryResponse, {}>(gql(queries.boards), {
      name: 'boardsQuery',
      options: () => ({
        variables: {}
      })
    })
  )(GroupFormContainer)
);
