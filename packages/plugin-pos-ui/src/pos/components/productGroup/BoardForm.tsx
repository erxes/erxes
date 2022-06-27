import Modal from 'react-bootstrap/Modal';
import React from 'react';
import { Button } from '@erxes/ui/src';
import BoardSelectContainer from '@erxes/ui-cards/src/boards/containers/BoardSelect';
import { ISyncCard } from '../../../types';

type Props = {
  group?: ISyncCard;
  onSubmit: (group: ISyncCard) => void;
  onDelete: (group: ISyncCard) => void;
  closeModal: () => void;
  mode: 'create' | 'update';
  categories: ISyncCard[];
};

type State = {
  group: ISyncCard;
  categories: ISyncCard[];
};

class BoardForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      group: props.group || {
        branchIds: [],
        boardId: '',
        pipelineId: '',
        stageId: '',
        assignedUserIds: []
      },
      categories: props.categories
    };
  }

  onChangeFunction = (name: any, value: any) => {
    const { group } = this.state;
    group[name] = value;
    this.setState({ group });
  };

  onClicksave = () => {
    this.props.onSubmit(this.state.group);
    this.props.closeModal();
  };

  onClickCancel = () => {
    this.props.closeModal();
  };

  onChangeConfig = (code: string, value) => {
    const { group } = this.state;
    group[code] = value;

    this.setState({ group }, () => {
      // this.props.group('cardsConfig', group);
    });
  };
  render() {
    const { mode } = this.props;
    const { group, categories } = this.state;

    const onChangeBoard = (boardId: string) => {
      this.onChangeConfig('boardId', boardId);
    };

    const onChangePipeline = (pipelineId: string) => {
      this.onChangeConfig('pipelineId', pipelineId);
    };

    const onChangeStage = (stageId: string) => {
      this.onChangeConfig('stageId', stageId);
    };

    const onAssignedUsersSelect = users => {
      this.onChangeConfig('assignedUserIds', users);
    };

    return (
      <>
        {/* <BoardSelectContainer
          type="deal"
          autoSelectStage={false}
          boardId={config.boardId}
          pipelineId={config.pipelineId}
          stageId={config.stageId}
          onChangeBoard={onChangeBoard}
          onChangePipeline={onChangePipeline}
          onChangeStage={onChangeStage}
        /> */}
        <Modal.Footer>
          <Button
            btnStyle="simple"
            type="button"
            icon="times-circle"
            onClick={this.onClickCancel}
          >
            Cancel
          </Button>

          <Button
            onClick={this.onClicksave}
            btnStyle="success"
            icon={mode === 'update' ? 'check-circle' : 'plus-circle'}
          >
            {mode === 'update' ? 'Save' : 'Add to POS'}
          </Button>
        </Modal.Footer>
      </>
    );
  }
}
export default BoardForm;
