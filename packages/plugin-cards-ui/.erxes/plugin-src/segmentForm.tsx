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
  config: any;
  onChangeConfig?: (value) => void;
};

class Form extends React.Component<any, any, any> {
  generatePipelineOptions = () => {
    const { config } = this.props;
    const { boardId } = config;

    const board = (this.props.boards || []).find(b => b._id === boardId);

    if (!board) {
      return [];
    }

    return (board.pipelines || []).map(p => ({
      value: p._id,
      label: p.name
    }));
  };

  onChangePipeLine = (_key, e) => {
    const { config } = this.props;
    const boarId = config.boardId;
    const pipelineId = e ? e.value : '';

    const result = { boarId, pipelineId };

    this.props.onChangeConfig(result);
  };

  onChangeBoard = (_key, e) => {
    const { config } = this.props;
    const boarId = e ? e.value : '';

    const pipelineId = config.pipelineId;

    const result = { boarId, pipelineId };

    this.props.onChangeConfig(result);
  };

  render() {
    const {
      boardsQuery,
      config,
      hideDetailForm,
      propertyType,
      type
    } = this.props;

    if (boardsQuery.loading) {
      return <Spinner />;
    }

    const boards = boardsQuery.boards || [];

    if (propertyType && !['deal', 'ticket', 'task'].includes(propertyType)) {
      return null;
    }

    if (!hideDetailForm && ['deal', 'ticket', 'task'].includes(type)) {
      return null;
    }

    return (
      <>
        <FlexContent>
          <FlexItem>
            <FormGroup>
              <ControlLabel>Board</ControlLabel>
              <Select
                value={config.boardId}
                options={boards.map(b => ({
                  value: b._id,
                  label: b.name
                }))}
                onChange={this.onChangeBoard.bind(this, 'boardId')}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Pipeline</ControlLabel>

              <Select
                value={config.boardId}
                onChange={this.onChangePipeLine.bind(this, 'pipelineId')}
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
