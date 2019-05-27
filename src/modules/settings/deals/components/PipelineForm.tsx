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
  name: string;
  stages: IStage[];
  visiblity: string;
  selectedMembers: IUser[];
};

class PipelineForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { pipeline, stages, selectedMembers } = this.props;

    this.state = {
      name: pipeline ? pipeline.name : '',
      stages: (stages || []).map(stage => ({ ...stage })),
      visiblity: pipeline ? pipeline.visiblity || 'public' : 'public',
      selectedMembers: this.generateMembersParams(selectedMembers)
    };
  }

  onChangeStages = stages => {
    this.setState({ stages });
  };

  onChangeVisiblity = (e: React.FormEvent<HTMLElement>) => {
    this.setState({
      visiblity: (e.currentTarget as HTMLInputElement).value
    });
  };

  onChangeMembers = items => {
    this.setState({ selectedMembers: items });
  };

  onChangeName = value => {
    this.setState({ name: value });
  };

  generateMembersParams = members => {
    return members.map(member => ({
      value: member._id,
      label: (member.details && member.details.fullName) || member.email || ''
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
        visiblity: this.state.visiblity,
        memberIds: this.collectValues(this.state.selectedMembers)
      }
    };
  };

  closeModal = () => {
    this.props.closeModal();
  };

  save = e => {
    e.preventDefault();

    const { save, closeModal, pipeline } = this.props;

    save(
      this.generateDoc(),
      () => {
        this.setState({
          selectedMembers: [],
          visiblity: 'public',
          stages: [],
          name: ''
        });
        closeModal();
      },
      pipeline
    );
  };

  renderSelectMembers() {
    const { members } = this.props;
    const { visiblity, selectedMembers } = this.state;

    if (visiblity === 'public') {
      return;
    }

    return (
      <FormGroup>
        <SelectMemberStyled>
          <ControlLabel>Members</ControlLabel>

          <Select
            placeholder={__('Choose members')}
            onChange={this.onChangeMembers}
            value={selectedMembers}
            options={this.generateMembersParams(members)}
            multi={true}
          />
        </SelectMemberStyled>
      </FormGroup>
    );
  }

  renderContent() {
    const { stages, visiblity, name } = this.state;

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>

          <FormControl
            id="pipeline-name"
            defaultValue={name}
            type="text"
            onChange={this.onChangeName}
            autoFocus={true}
            required={true}
          />
        </FormGroup>

        <ControlLabel required={true}>Visiblity</ControlLabel>
        <FormGroup>
          <FormControl
            id="visiblity"
            componentClass="select"
            value={visiblity}
            onChange={this.onChangeVisiblity}
          >
            <option value="public">{__('Public')}</option>
            <option value="private">{__('Private')}</option>
          </FormControl>
        </FormGroup>
        {this.renderSelectMembers()}

        <Stages stages={stages} onChangeStages={this.onChangeStages} />
      </>
    );
  }

  render() {
    const { show, pipeline } = this.props;

    if (!show) {
      return null;
    }

    return (
      <Modal show={show} onHide={this.closeModal} dialogClassName="transform">
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
                onClick={this.closeModal}
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
