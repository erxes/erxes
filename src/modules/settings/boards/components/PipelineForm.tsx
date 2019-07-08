import { IUser } from 'modules/auth/types';
import { COLORS } from 'modules/boards/constants';
import { IPipeline, IStage } from 'modules/boards/types';
import {
  Button,
  ControlLabel,
  Form,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { colors } from 'modules/common/styles';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import { ColorPick, ColorPicker } from 'modules/settings/styles';
import React from 'react';
import { Modal, OverlayTrigger, Popover } from 'react-bootstrap';
import { BlockPicker } from 'react-color';
import Select from 'react-select-plus';
import { SelectMemberStyled } from '../styles';
import { Stages } from './';

type Props = {
  type: string;
  show: boolean;
  boardId: string;
  pipeline?: IPipeline;
  stages?: IStage[];
  members: IUser[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  stages: IStage[];
  visibility: string;
  selectedMembers: IUser[];
  backgroundColor: string;
};

class PipelineForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { pipeline, stages } = this.props;

    this.state = {
      stages: (stages || []).map(stage => ({ ...stage })),
      visibility: pipeline ? pipeline.visibility || 'public' : 'public',
      selectedMembers: this.generateMembersParams(
        pipeline ? pipeline.members : []
      ),
      backgroundColor: (pipeline && pipeline.bgColor) || colors.colorPrimaryDark
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

  generateMembersParams = members => {
    return members.map(member => ({
      value: member._id,
      label:
        (member.details && member.details.fullName) ||
        member.email ||
        member.username
    }));
  };

  collectValues = items => {
    return items.map(item => item.value);
  };

  onColorChange = e => {
    this.setState({ backgroundColor: e.hex });
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
      ...finalValues,
      type,
      boardId: pipeline ? pipeline.boardId : boardId,
      stages: this.state.stages.filter(el => el.name),
      memberIds: this.collectValues(this.state.selectedMembers),
      bgColor: this.state.backgroundColor
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

    const popoverTop = (
      <Popover id="color-picker">
        <BlockPicker
          width="266px"
          color={this.state.backgroundColor}
          onChange={this.onColorChange}
          colors={COLORS}
        />
      </Popover>
    );

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
            <ControlLabel>Background</ControlLabel>
            <div>
              <OverlayTrigger
                trigger="click"
                rootClose={true}
                placement="bottom"
                overlay={popoverTop}
              >
                <ColorPick>
                  <ColorPicker
                    style={{ backgroundColor: this.state.backgroundColor }}
                  />
                </ColorPick>
              </OverlayTrigger>
            </div>
          </FormGroup>

          <FormGroup>
            <ControlLabel required={true}>Visibility</ControlLabel>
            <FormControl
              {...formProps}
              name="visibility"
              componentClass="select"
              value={this.state.visibility}
              onChange={this.onChangeVisibility}
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
      <Modal
        show={show}
        onHide={closeModal}
        enforceFocus={false}
        dialogClassName="transform"
      >
        <Form renderContent={this.renderContent} />
      </Modal>
    );
  }
}

export default PipelineForm;
