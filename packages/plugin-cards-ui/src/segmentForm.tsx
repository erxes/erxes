import gql from 'graphql-tag';
import { ControlLabel } from '@erxes/ui/src/components/form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import Select from 'react-select-plus';
import { FlexContent, FlexItem } from '@erxes/ui/src/layout/styles';
import React from 'react';
import { BoardsQueryResponse } from '@erxes/ui-cards/src/boards/types';
import { withProps } from '@erxes/ui/src/utils';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';

import { queries } from '@erxes/ui-settings/src/boards/graphql';
import Spinner from '@erxes/ui/src/components/Spinner';

type Props = {
  type: string;
  config: string;
  onChangeConfig?: (value) => void;
};

type FinalProps = {
  boardsQuery: BoardsQueryResponse;
} & Props;

type State = {
  boardId: string;
  pipelineId: string;
};

class Form extends React.Component<any, any, any> {
  constructor(props: FinalProps) {
    super(props);

    const { config } = this.props;

    this.state = {
      boardId: config ? config.boardId : '',
      pipelineId: config ? config.pipelineId : ''
    };
  }

  generatePipelineOptions = () => {
    const { boardId } = this.state;

    const board = (this.props.boards || []).find(b => b._id === boardId);

    if (!board) {
      return [];
    }

    return (board.pipelines || []).map(p => ({
      value: p._id,
      label: p.name
    }));
  };

  render() {
    const { boardsQuery } = this.props;
    const { boardId, pipelineId } = this.state;

    if (boardsQuery.loading) {
      return <Spinner />;
    }

    const boards = boardsQuery.boards || [];

    return (
      <>
        <FlexContent>
          <FlexItem>
            <FormGroup>
              <ControlLabel>Board</ControlLabel>
              <Select
                value={boardId}
                options={boards.map(b => ({
                  value: b._id,
                  label: b.name
                }))}
                // onChange={onChangeBoardItem.bind(this, 'boardId')}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Pipeline</ControlLabel>

              <Select
                value={pipelineId}
                // onChange={onChangeBoardItem.bind(this, 'pipelineId')}
                options={this.generatePipelineOptions()}
              />
            </FormGroup>
          </FlexItem>
        </FlexContent>
      </>
    );
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, BoardsQueryResponse, {}>(gql(queries.boards), {
      name: 'boardsQuery',
      options: ({ type }) => ({
        variables: { type: type.split(':')[1] }
      })
    })
  )(Form)
);
