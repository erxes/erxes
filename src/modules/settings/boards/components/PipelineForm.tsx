import { IUser } from 'modules/auth/types';
import {
  Button,
  ControlLabel,
  Form,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import { Modal } from 'react-bootstrap';
import Select from 'react-select-plus';
import { SelectMemberStyled } from '../styles';
import { IPipeline, IStage } from '../types';
import { Stages } from './';
type Props = {
  type: string;
  show?: boolean;
  boardId: string;
  pipeline?: IPipeline;
  stages?: IStage[];
  members: IUser[];
  selectedMembers: IUser[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  stages: IStage[];
  visibility: string;
  selectedMembers: IUser[];
};

class PipelineForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { pipeline, stages, selectedMembers } = this.props;

    this.state = {
      stages: (stages || []).map(stage => ({ ...stage })),
      visibility: pipeline ? pipeline.visibility || 'public' : 'public',
      selectedMembers: this.generateMembersParams(selectedMembers)
    };
  }

  onChangeStages = stages => {
    this.setState({ stages });
  };

  onChangevisibility = (e: React.FormEvent<HTMLElement>) => {
    this.setState({
      visibility: (e.currentTarget as HTMLInputElement).value
    });
  };

  onChangeMembers = items => {
    this.setState({ selectedMembers: items });
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

  generateDoc = (values: {
    _id?: string;
    name: string;
    visibility: string;
  }) => {
    const { pipeline, type, boardId } = this.props;
    const finalValues = values;

    if (pipeline) {
      finalValues._id = pipeline._id;
    }

    return {
      _id: finalValues._id,
      name: finalValues.name,
      type,
      boardId: pipeline ? pipeline.boardId : boardId,
      stages: this.state.stages.filter(el => el.name),
      visibility: finalValues.visibility,
      memberIds: this.collectValues(this.state.selectedMembers)
    };
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

  renderContent = (formProps: IFormProps) => {
    const { pipeline, renderButton, closeModal } = this.props;
    const { values, isSubmitted } = formProps;
    const object = pipeline || ({} as IPipeline);

    return (
      <>
        <Modal.Header closeButton={true}>
          <Modal.Title>
            {pipeline ? 'Edit pipeline' : 'Add pipeline'}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <FormGroup>
            <ControlLabel required={true}>Name</ControlLabel>
            <FormControl
              {...formProps}
              name="name"
              defaultValue={object.name}
              autoFocus={true}
              required={true}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel required={true}>visibility</ControlLabel>
            <FormControl
              {...formProps}
              name="visibility"
              componentClass="select"
              defaultValue={object.visibility}
              value={this.state.visibility}
              onChange={this.onChangevisibility}
            >
              <option value="public">{__('Public')}</option>
              <option value="private">{__('Private')}</option>
            </FormControl>
          </FormGroup>
          {this.renderSelectMembers()}

          <Stages
            type={this.props.type}
            stages={this.state.stages}
            onChangeStages={this.onChangeStages}
          />

          <Modal.Footer>
            <Button
              btnStyle="simple"
              type="button"
              icon="cancel-1"
              onClick={closeModal}
            >
              Cancel
            </Button>

            {renderButton({
              name: 'pipeline',
              values: this.generateDoc(values),
              isSubmitted,
              callback: closeModal,
              object: pipeline
            })}
          </Modal.Footer>
        </Modal.Body>
      </>
    );
  };

  render() {
    const { show, closeModal } = this.props;

    if (!show) {
      return null;
    }

    return (
      <Modal show={show} onHide={closeModal} dialogClassName="transform">
        <Form renderContent={this.renderContent} />
      </Modal>
    );
  }
}

export default PipelineForm;
