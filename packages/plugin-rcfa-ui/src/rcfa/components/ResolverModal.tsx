import React from 'react';
import BoardSelect from '@erxes/ui-cards/src/boards/containers/BoardSelect';
import Button from '@erxes/ui/src/components/Button';
import { withProps } from '@erxes/ui/src/utils/core';
import { gql } from '@apollo/client';
import { mutations } from '../graphql';
import * as compose from 'lodash.flowright';
import { Alert, ControlLabel, FormControl, FormGroup, __ } from '@erxes/ui/src';
import { graphql } from '@apollo/client/react/hoc';
import { refetchQueries } from '../containers/Section';

type Props = {
  mainType: string;
  mainTypeId: string;
  issueId: string;
  closeModal: () => void;
};

type FinalProps = {
  createActionInRoot: any;
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
      createActionInRoot,
      issueId
    } = this.props;
    const { stageId } = this.state;

    const onSelect = (value, name) => {
      this.setState({ [name]: value } as Pick<State, keyof State>);
    };

    const create = async e => {
      if (e.key === 'Enter') {
        const { value } = e.currentTarget as HTMLInputElement;
        const payload = {
          mainType,
          destinationType: 'task',
          itemId: mainTypeId,
          destinationStageId: stageId,
          issueId,
          name: value
        };

        await createActionInRoot({ variables: payload })
          .then(() => {
            Alert.success('Action created successfully');
            closeModal();
          })
          .catch(error => {
            Alert.error(error.message);
          });
      }
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

        {stageId && (
          <>
            <FormGroup>
              <ControlLabel required>{__('Name')}</ControlLabel>
              <FormControl
                required
                type="text"
                name="name"
                placeholder="Type a name and press enter"
                onKeyPress={create}
              />
            </FormGroup>
          </>
        )}
      </>
    );
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(mutations.createActionInRoot), {
      name: 'createActionInRoot',
      options: ({ mainTypeId }) => ({
        refetchQueries: refetchQueries({ mainTypeId })
      })
    })
  )(rcfaCreateTaskModal)
);
