import { COLORS } from '@erxes/ui/src/constants/colors';
import { Flex } from '@erxes/ui/src/styles/main';
import { IBoard, IPipeline, IStage } from '@erxes/ui-cards/src/boards/types';
import { IDepartment } from '@erxes/ui-team/src/types';
import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { colors } from '@erxes/ui/src/styles';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { __, generateTree } from 'coreui/utils';
import { ExpandWrapper } from '@erxes/ui-settings/src/styles';
import { ColorPick, ColorPicker } from '@erxes/ui/src/styles/main';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import React from 'react';
import Modal from 'react-bootstrap/Modal';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import TwitterPicker from 'react-color/lib/Twitter';
import Select from 'react-select-plus';
import { SelectMemberStyled } from '@erxes/ui-settings/src/boards/styles';
import { IOption } from '../types';
import BoardNumberConfigs from './numberConfig/BoardNumberConfigs';
import Stages from './Stages';
import { FlexContent, FlexItem } from '@erxes/ui/src/layout/styles';

type Props = {
  type: string;
  show: boolean;
  boardId: string;
  pipeline?: IPipeline;
  stages?: IStage[];
  boards: IBoard[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  options?: IOption;
  renderExtraFields?: (formProps: IFormProps) => JSX.Element;
  extraFields?: any;
  departments: IDepartment[];
};

type State = {
  stages: IStage[];
  visibility: string;
  selectedMemberIds: string[];
  backgroundColor: string;
  isCheckUser: boolean;
  isCheckDepartment: boolean;
  excludeCheckUserIds: string[];
  boardId: string;
  numberConfig?: string;
  numberSize?: string;
  departmentIds?: string[];
};

class PipelineForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { pipeline, stages } = this.props;

    this.state = {
      stages: (stages || []).map(stage => ({ ...stage })),
      visibility: pipeline ? pipeline.visibility || 'public' : 'public',
      selectedMemberIds: pipeline ? pipeline.memberIds || [] : [],
      backgroundColor:
        (pipeline && pipeline.bgColor) || colors.colorPrimaryDark,
      isCheckUser: pipeline ? pipeline.isCheckUser || false : false,
      isCheckDepartment: pipeline ? pipeline.isCheckDepartment || false : false,
      excludeCheckUserIds: pipeline ? pipeline.excludeCheckUserIds || [] : [],
      boardId: props.boardId || '',
      numberConfig: (pipeline && pipeline.numberConfig) || '',
      numberSize: (pipeline && pipeline.numberSize) || '',
      departmentIds: pipeline ? pipeline.departmentIds || [] : []
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

  onChangeDepartments = options => {
    this.setState({ departmentIds: (options || []).map(o => o.value) });
  };

  onChangeDominantUsers = items => {
    this.setState({ excludeCheckUserIds: items });
  };

  collectValues = items => {
    return items.map(item => item.value);
  };

  onColorChange = e => {
    this.setState({ backgroundColor: e.hex });
  };

  onChangeNumber = (key: string, value: string) => {
    this.setState({ [key]: value } as any);
  };

  generateDoc = (values: {
    _id?: string;
    name: string;
    visibility: string;
  }) => {
    const { pipeline, type, extraFields } = this.props;
    const {
      selectedMemberIds,
      stages,
      backgroundColor,
      isCheckUser,
      isCheckDepartment,
      excludeCheckUserIds,
      boardId,
      numberConfig,
      numberSize,
      departmentIds
    } = this.state;

    const finalValues = values;

    if (pipeline) {
      finalValues._id = pipeline._id;
    }

    return {
      ...finalValues,
      ...extraFields,
      type,
      boardId,
      stages: stages.filter(el => el.name),
      memberIds: selectedMemberIds,
      bgColor: backgroundColor,
      isCheckUser,
      isCheckDepartment,
      excludeCheckUserIds,
      numberConfig,
      numberSize,
      departmentIds
    };
  };

  renderNumberInput() {
    return (
      <FormGroup>
        <BoardNumberConfigs
          onChange={(key: string, conf: string) =>
            this.onChangeNumber(key, conf)
          }
          config={this.state.numberConfig || ''}
          size={this.state.numberSize || ''}
        />
      </FormGroup>
    );
  }

  renderSelectMembers() {
    const { visibility, selectedMemberIds, departmentIds } = this.state;

    if (visibility === 'public') {
      return;
    }

    return (
      <>
        <FormGroup>
          <SelectMemberStyled zIndex={2003}>
            <ControlLabel>Members</ControlLabel>

            <SelectTeamMembers
              label="Choose members"
              name="selectedMemberIds"
              initialValue={selectedMemberIds}
              onSelect={this.onChangeMembers}
            />
          </SelectMemberStyled>
        </FormGroup>
        <FormGroup>
          <SelectMemberStyled zIndex={2002}>
            <ControlLabel>Departments</ControlLabel>
            <Select
              value={departmentIds}
              options={generateTree(
                this.props.departments,
                null,
                (node, level) => ({
                  value: node._id,
                  label: `${'---'.repeat(level)} ${node.title}`
                })
              )}
              onChange={this.onChangeDepartments.bind(this)}
              placeholder={__('Choose department ...')}
              multi={true}
            />
          </SelectMemberStyled>
        </FormGroup>
      </>
    );
  }

  onChangeIsCheckUser = e => {
    const isChecked = (e.currentTarget as HTMLInputElement).checked;
    this.setState({ isCheckUser: isChecked });
  };

  onChangeIsCheckDepartment = e => {
    const isChecked = (e.currentTarget as HTMLInputElement).checked;
    this.setState({ isCheckDepartment: isChecked });
  };

  renderDominantUsers() {
    const { isCheckUser, isCheckDepartment, excludeCheckUserIds } = this.state;

    if (!isCheckUser && !isCheckDepartment) {
      return;
    }

    return (
      <FormGroup>
        <SelectMemberStyled>
          <ControlLabel>
            Users eligible to see all {this.props.type}
          </ControlLabel>

          <SelectTeamMembers
            label="Choose members"
            name="excludeCheckUserIds"
            initialValue={excludeCheckUserIds}
            onSelect={this.onChangeDominantUsers}
          />
        </SelectMemberStyled>
      </FormGroup>
    );
  }

  renderBoards() {
    const { boards } = this.props;

    const boardOptions = boards.map(board => ({
      value: board._id,
      label: board.name
    }));

    const onChange = item => this.setState({ boardId: item.value });

    return (
      <FormGroup>
        <ControlLabel required={true}>Board</ControlLabel>
        <Select
          placeholder={__('Choose a board')}
          value={this.state.boardId}
          options={boardOptions}
          onChange={onChange}
          clearable={false}
        />
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

    const popoverBottom = (
      <Popover id="color-picker">
        <TwitterPicker
          width="266px"
          triangle="hide"
          color={this.state.backgroundColor}
          onChange={this.onColorChange}
          colors={COLORS}
        />
      </Popover>
    );

    return (
      <div id="manage-pipeline-modal">
        <Modal.Header closeButton={true}>
          <Modal.Title>
            {pipeline ? `Edit ${pipelineName}` : `Add ${pipelineName}`}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <FlexContent>
            <FlexItem count={4}>
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
            </FlexItem>
          </FlexContent>

          {renderExtraFields && renderExtraFields(formProps)}

          <Flex>
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
                  overlay={popoverBottom}
                >
                  <ColorPick>
                    <ColorPicker
                      style={{ backgroundColor: this.state.backgroundColor }}
                    />
                  </ColorPick>
                </OverlayTrigger>
              </div>
            </FormGroup>
          </Flex>

          {this.renderBoards()}

          {this.renderSelectMembers()}

          {this.renderNumberInput()}

          <FormGroup>
            <FlexContent>
              <FlexItem>
                <ControlLabel>
                  {__(`Show only the user's assigned(created)`)}{' '}
                  {this.props.type}
                </ControlLabel>
                <span style={{ marginLeft: '10px' }}>
                  <FormControl
                    componentClass="checkbox"
                    checked={this.state.isCheckUser}
                    onChange={this.onChangeIsCheckUser}
                  />
                </span>
              </FlexItem>
              <FlexItem>
                <ControlLabel>
                  {__(`Show only user’s assigned (created)`)} {this.props.type}{' '}
                  {__(`by department`)}
                </ControlLabel>
                <span style={{ marginLeft: '10px' }}>
                  <FormControl
                    componentClass="checkbox"
                    checked={this.state.isCheckDepartment}
                    onChange={this.onChangeIsCheckDepartment}
                  />
                </span>
              </FlexItem>
            </FlexContent>
          </FormGroup>

          {this.renderDominantUsers()}

          <FormGroup>
            <ControlLabel>Stages</ControlLabel>
            <div id="stages-in-pipeline-form">
              <Stages
                options={options}
                type={this.props.type}
                stages={this.state.stages}
                onChangeStages={this.onChangeStages}
                departments={this.props.departments}
              />
            </div>
          </FormGroup>

          <Modal.Footer>
            <Button
              btnStyle="simple"
              type="button"
              icon="times-circle"
              onClick={closeModal}
            >
              Cancel
            </Button>

            {renderButton({
              name: pipelineName,
              values: this.generateDoc(values),
              isSubmitted,
              callback: closeModal,
              object: pipeline,
              confirmationUpdate: true
            })}
          </Modal.Footer>
        </Modal.Body>
      </div>
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
        size="xl"
      >
        <Form renderContent={this.renderContent} />
      </Modal>
    );
  }
}

export default PipelineForm;
