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
  type: string;
  show: boolean;
  boardId: string;
  pipeline?: IPipeline;
  stages?: IStage[];
  members: IUser[];
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
  visibility: string;
  selectedMembers: IUser[];
};

class PipelineForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { pipeline, stages, members } = this.props;

    const memberIds = pipeline ? pipeline.memberIds || [] : [];

    let selectedMembers: IUser[] = [];

    if (pipeline) {
      selectedMembers = members.filter(member =>
        memberIds.includes(member._id)
      );
    }

    this.state = {
      name: pipeline ? pipeline.name : '',
      stages: (stages || []).map(stage => ({ ...stage })),
      visibility: pipeline ? pipeline.visibility || 'public' : 'public',
      selectedMembers: this.generateMembersParams(selectedMembers)
    };
  }

  onChangeStages = stages => {
    this.setState({ stages });
  };

  onChangeVisibility = (e: React.FormEvent<HTMLElement>) => {
    this.setState({
      visibility: (e.currentTarget as HTMLInputElement).value
    });
  };

  onChangeMembers = items => {
    this.setState({ selectedMembers: items });
  };

  onChangeName = (e: React.FormEvent<HTMLElement>) => {
    this.setState({ name: (e.currentTarget as HTMLInputElement).value });
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
    const { pipeline, type } = this.props;
    const { name, stages, visibility, selectedMembers } = this.state;

    return {
      doc: {
        name,
        type,
        boardId: pipeline ? pipeline.boardId : this.props.boardId,
        stages: stages.filter(el => el.name),
        visibility,
        memberIds: this.collectValues(selectedMembers)
      }
    };
  };

  save = e => {
    e.preventDefault();

    const { save, pipeline, closeModal } = this.props;

    save(this.generateDoc(), () => closeModal(), pipeline);
  };

  renderSelectMembers() {
    const { members } = this.props;
    const { visibility, selectedMembers } = this.state;

    if (visibility === 'public') {
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
    const { stages, visibility, name } = this.state;

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>

          <FormControl
            defaultValue={name}
            type="text"
            onChange={this.onChangeName}
            autoFocus={true}
            required={true}
          />
        </FormGroup>

        <ControlLabel required={true}>Visibility</ControlLabel>
        <FormGroup>
          <FormControl
            componentClass="select"
            value={visibility}
            onChange={this.onChangeVisibility}
          >
            <option value="public">{__('Public')}</option>
            <option value="private">{__('Private')}</option>
          </FormControl>
        </FormGroup>
        {this.renderSelectMembers()}

        <Stages
          type={this.props.type}
          stages={stages}
          onChangeStages={this.onChangeStages}
        />
      </>
    );
  }

  render() {
    const { pipeline, show, closeModal } = this.props;

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
