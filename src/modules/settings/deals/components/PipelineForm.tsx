import { IUser } from 'modules/auth/types';
import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import { Modal } from 'react-bootstrap';
import Select from 'react-select-plus';
import { SelectMemberStyled } from '../styles';
import { IPipeline, IStage } from '../types';
import { Stages } from './';
type Props = {
  show?: boolean;
  boardId: string;
  pipeline?: IPipeline;
  stages?: IStage[];
  members: IUser[];
  selectedMembers: IUser[];
  save: (
    params: { doc: { name: string; boardId?: string; stages: IStage[] } },
    callback: () => void,
    pipeline?: IPipeline
  ) => void;
  closeModal: () => void;
};

type State = {
  stages: IStage[];
  type: string;
  selectedMembers: IUser[];
};

class PipelineForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      stages: (props.stages || []).map(stage => ({ ...stage })),
      type: props.pipeline ? props.pipeline.type || 'public' : 'public',
      selectedMembers: this.generateMembersParams(props.selectedMembers)
    };
  }

  onChangeStages = stages => {
    this.setState({ stages });
  };

  onChangeType = (e: React.FormEvent<HTMLElement>) => {
    this.setState({
      type: (e.currentTarget as HTMLInputElement).value
    });
  };

  generateMembersParams = members => {
    return members.map(member => ({
      value: member._id,
      label: (member.details && member.details.fullName) || ''
    }));
  };

  collectValues = items => {
    return items.map(item => item.value);
  };

  generateDoc = () => {
    const { pipeline } = this.props;

    return {
      doc: {
        name: (document.getElementById('pipeline-name') as HTMLInputElement)
          .value,
        boardId: pipeline ? pipeline.boardId : this.props.boardId,
        stages: this.state.stages.filter(el => el.name),
        type: this.state.type,
        memberIds: this.collectValues(this.state.selectedMembers)
      }
    };
  };

  save = e => {
    e.preventDefault();

    const { save, closeModal, pipeline } = this.props;

    save(
      this.generateDoc(),
      () => {
        closeModal();
      },
      pipeline
    );
  };

  renderSelectMembers() {
    const { members } = this.props;
    const { type } = this.state;
    const self = this;

    const onChange = items => {
      self.setState({ selectedMembers: items });
    };

    if (type === 'public') {
      return;
    }

    return (
      <FormGroup>
        <SelectMemberStyled>
          <ControlLabel>Members</ControlLabel>
          <Select
            placeholder={__('Choose members')}
            onChange={onChange}
            value={self.state.selectedMembers}
            options={self.generateMembersParams(members)}
            multi={true}
          />
        </SelectMemberStyled>
      </FormGroup>
    );
  }

  renderContent() {
    const { pipeline } = this.props;
    const { stages, type } = this.state;

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>

          <FormControl
            id="pipeline-name"
            defaultValue={pipeline ? pipeline.name : ''}
            type="text"
            autoFocus={true}
            required={true}
          />

          <ControlLabel required={true}>Type</ControlLabel>

          <FormControl
            id="type"
            componentClass="select"
            value={type}
            onChange={this.onChangeType}
          >
            <option value="public">{__('Public')}</option>
            <option value="private">{__('Private')}</option>
          </FormControl>
          {this.renderSelectMembers()}
        </FormGroup>

        <Stages stages={stages} onChangeStages={this.onChangeStages} />
      </>
    );
  }

  render() {
    const { show, pipeline, closeModal } = this.props;

    if (!show) {
      return null;
    }

    return (
      <Modal show={show} onHide={closeModal} dialogClassName="transform">
        <form onSubmit={this.save}>
          <Modal.Header closeButton={true}>
            <Modal.Title>
              {pipeline ? 'Edit pipeline' : 'Add pipeline'}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {this.renderContent()}
            <Modal.Footer>
              <Button
                btnStyle="simple"
                type="button"
                icon="cancel-1"
                onClick={closeModal}
              >
                Cancel
              </Button>

              <Button btnStyle="success" icon="checked-1" type="submit">
                Save
              </Button>
            </Modal.Footer>
          </Modal.Body>
        </form>
      </Modal>
    );
  }
}

export default PipelineForm;
