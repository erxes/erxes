import React from 'react';
import BoardSelect from '@erxes/ui-cards/src/boards/containers/BoardSelect';
import Button from '@erxes/ui/src/components/Button';
import { withProps } from '@erxes/ui/src/utils/core';
import { gql } from '@apollo/client';
import { mutations } from '../graphql';
import * as compose from 'lodash.flowright';
import { __ } from '@erxes/ui/src';
import { graphql } from '@apollo/client/react/hoc';
import { refetchQueries } from '../containers/Section';

type Props = {
  mainType: string;
  mainTypeId: string;
  issueId: string;
  closeModal: () => void;
  callback: () => void;
};

type FinalProps = {
  resolveRCFA: any;
} & Props;

type State = {
  stageId: string;
  pipelineId: string;
  boardId: string;
};

class rcfaCreateTaskModal extends React.Component<FinalProps, State> {
  constructor(props: any) {
    super(props);

    this.state = {
      stageId: '',
      pipelineId: '',
      boardId: ''
    };
  }

  render() {
    const {
      mainType,
      mainTypeId,
      closeModal,
      callback,
      resolveRCFA,
      issueId
    } = this.props;
    const { stageId } = this.state;

    const onSelect = (value, name) => {
      this.setState({ [name]: value } as Pick<State, keyof State>);
    };

    const create = async () => {
      const payload = {
        mainType,
        destinationType: 'task',
        itemId: mainTypeId,
        destinationStageId: stageId,
        issueId
      };

      await resolveRCFA({ variables: payload });

      callback();
      closeModal();
    };

    return (
      <>
        <BoardSelect
          type="task"
          boardId={this.state.boardId}
          pipelineId={this.state.pipelineId}
          stageId={this.state.stageId}
          onChangeBoard={boardId => onSelect(boardId, 'boardId')}
          onChangePipeline={pipelineId => onSelect(pipelineId, 'pipelineId')}
          onChangeStage={stageId => onSelect(stageId, 'stageId')}
        />

        {stageId && <Button onClick={create}>{__('Done')}</Button>}
        <Button onClick={closeModal} btnStyle="simple">
          {__('Close')}
        </Button>
      </>
    );
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(mutations.resolveRCFA), {
      name: 'resolveRCFA',
      options: ({ mainTypeId }) => ({
        refetchQueries: refetchQueries({ mainTypeId })
      })
    })
  )(rcfaCreateTaskModal)
);
