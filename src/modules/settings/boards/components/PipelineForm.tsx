import { COLORS } from 'modules/boards/constants';
import { FlexContent } from 'modules/boards/styles/item';
import { IPipeline, IStage } from 'modules/boards/types';
import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { colors } from 'modules/common/styles';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import { ColorPick, ColorPicker, ExpandWrapper } from 'modules/settings/styles';
import SelectTeamMembers from 'modules/settings/team/containers/SelectTeamMembers';
import React from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import Modal from 'react-bootstrap-latest/Modal';
import BlockPicker from 'react-color/lib/Block';
import { SelectMemberStyled } from '../styles';
import { IOption } from '../types';
import Stages from './Stages';

type Props = {
  type: string;
  show: boolean;
  boardId: string;
  pipeline?: IPipeline;
  stages?: IStage[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  options?: IOption;
  renderExtraFields?: (formProps: IFormProps) => JSX.Element;
  extraFields?: any;
};

type State = {
  stages: IStage[];
  visibility: string;
  selectedMemberIds: string[];
  backgroundColor: string;
};

class PipelineForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { pipeline, stages } = this.props;

    this.state = {
      stages: (stages || []).map(stage => ({ ...stage })),
      visibility: pipeline ? pipeline.visibility || 'public' : 'public',
      selectedMemberIds: pipeline ? pipeline.memberIds || [] : [],
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
    this.setState({ selectedMemberIds: items });
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
    const { pipeline, type, boardId, extraFields } = this.props;
    const { selectedMemberIds, stages, backgroundColor } = this.state;
    const finalValues = values;

    if (pipeline) {
      finalValues._id = pipeline._id;
    }

    return {
      ...finalValues,
      ...extraFields,
      type,
      boardId: pipeline ? pipeline.boardId : boardId,
      stages: stages.filter(el => el.name),
      memberIds: selectedMemberIds,
      bgColor: backgroundColor
    };
  };

  renderSelectMembers() {
    const { visibility, selectedMemberIds } = this.state;

    if (visibility === 'public') {
      return;
    }
    const self = this;

    const onChange = items => {
      self.setState({ selectedMemberIds: items });
    };

    return (
      <FormGroup>
        <SelectMemberStyled>
          <ControlLabel>Members</ControlLabel>

          <SelectTeamMembers
            label="Choose members"
            name="selectedMemberIds"
            value={selectedMemberIds}
            onSelect={onChange}
          />
        </SelectMemberStyled>
      </FormGroup>
    );
  }

  renderContent = (formProps: IFormProps) => {
    const {
      pipeline,
      renderButton,
      closeModal,
      options,
      renderExtraFields
    } = this.props;
    const { values, isSubmitted } = formProps;
    const object = pipeline || ({} as IPipeline);
    const pipelineName =
      options && options.pipelineName
        ? options.pipelineName.toLowerCase()
        : 'pipeline';

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
            {pipeline ? `Edit ${pipelineName}` : `Add ${pipelineName}`}
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

          {renderExtraFields && renderExtraFields(formProps)}

          <FlexContent>
            <ExpandWrapper>
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
            </ExpandWrapper>
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
          </FlexContent>

          {this.renderSelectMembers()}

          <FormGroup>
            <ControlLabel>Stages</ControlLabel>
            <Stages
              options={options}
              type={this.props.type}
              stages={this.state.stages}
              onChangeStages={this.onChangeStages}
            />
          </FormGroup>

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
              name: pipelineName,
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
        animation={false}
      >
        <Form renderContent={this.renderContent} />
      </Modal>
    );
  }
}

export default PipelineForm;
