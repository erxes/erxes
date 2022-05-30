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
  propertyType?: string;
  config: any;
  onChangeConfig?: (value) => void;
};

class Form extends React.Component<any, any, any> {
  generatePipelineOptions = boards => {
    const config = this.props.config || {};
    const { boardId } = config;

    const board = (boards || []).find(b => b._id === boardId);

    if (!board) {
      return [];
    }

    return (board.pipelines || []).map(p => ({
      value: p._id,
      label: p.name
    }));
  };

  onChangePipeLine = (_key, e) => {
    const config = this.props.config || {};
    const boardId = config.boardId;
    const pipelineId = e ? e.value : '';

    const result = { boardId, pipelineId };

    this.props.onChangeConfig(result);
  };

  onChangeBoard = (_key, e) => {
    const config = this.props.config || {};
    const boardId = e ? e.value : '';

    const pipelineId = config.pipelineId;

    const result = { boardId, pipelineId };

    this.props.onChangeConfig(result);
  };

  render() {
    const {
      boardsQuery,
      hideDetailForm,
      propertyType,
      type,
      component
    } = this.props;

    const config = this.props.config || {};

    if (boardsQuery.loading) {
      return <Spinner />;
    }

    const boards = boardsQuery.boards || [];

    const content = (
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
                value={config.pipelineId}
                onChange={this.onChangePipeLine.bind(this, 'pipelineId')}
                options={this.generatePipelineOptions(boards)}
              />
            </FormGroup>
          </FlexItem>
        </FlexContent>
      </>
    );

    if (component === 'filter') {
      if (
        propertyType &&
        !['cards:deal', 'cards:ticket', 'cards:task'].includes(propertyType)
      ) {
        return null;
      }

      if (
        !hideDetailForm &&
        ['cards:deal', 'cards:ticket', 'cards:task'].includes(type)
      ) {
        return null;
      }

      return content;
    } else if (['cards:deal', 'cards:ticket', 'cards:task'].includes(type)) {
      return content;
    }
  }
}

const generateVariable = (type, propertyType) => {
  if (['cards:deal', 'cards:ticket', 'cards:task'].includes(type)) {
    return { type: type.split(':')[1] };
  }

  return { type: propertyType.split(':')[1] };
};

export default withProps<Props>(
  compose(
    graphql<Props, BoardsQueryResponse, {}>(gql(queries.boards), {
      name: 'boardsQuery',
      options: ({ type, propertyType }) => ({
        variables: generateVariable(type, propertyType)
      })
    })
  )(Form)
);
