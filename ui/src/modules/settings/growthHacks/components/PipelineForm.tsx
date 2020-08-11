import client from 'apolloClient';
import gql from 'graphql-tag';
import { COLORS } from 'modules/boards/constants';
import { FlexContent } from 'modules/boards/styles/item';
import { IBoard, IPipeline } from 'modules/boards/types';
import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import DateControl from 'modules/common/components/form/DateControl';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { colors } from 'modules/common/styles';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import { SelectMemberStyled } from 'modules/settings/boards/styles';
import { ColorPick, ColorPicker, ExpandWrapper } from 'modules/settings/styles';
import SelectTeamMembers from 'modules/settings/team/containers/SelectTeamMembers';
import React from 'react';
import Modal from 'react-bootstrap/Modal';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import TwitterPicker from 'react-color/lib/Twitter';
import Select from 'react-select-plus';
import { metricOptions } from '../constants';
import { queries } from '../graphql';
import { Box, DateItem } from '../styles';

type Props = {
  type: string;
  show: boolean;
  boardId?: string;
  pipeline?: IPipeline;
  boards: IBoard[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  visibility: string;
  selectedMemberIds: string[];
  backgroundColor: string;
  hackScoringType: string;
  templates: any[];
  templateId?: string;
  metric?: string;
  boardId: string;
  startDate?: Date;
  endDate?: Date;
};

class PipelineForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { pipeline } = this.props;

    this.state = {
      visibility: pipeline ? pipeline.visibility || 'public' : 'public',
      selectedMemberIds: pipeline ? pipeline.memberIds || [] : [],
      backgroundColor:
        (pipeline && pipeline.bgColor) || colors.colorPrimaryDark,
      hackScoringType: (pipeline && pipeline.hackScoringType) || 'ice',
      templates: [],
      templateId: pipeline ? pipeline.templateId : '',
      metric: pipeline ? pipeline.metric : '',
      startDate: pipeline ? pipeline.startDate : undefined,
      endDate: pipeline ? pipeline.endDate : undefined,
      boardId: props.boardId || ''
    };
  }

  getTemplates() {
    client
      .query({
        query: gql(queries.pipelineTemplates),
        variables: { type: 'growthHack' }
      })
      .then(({ data }: { data: any }) => {
        if (data && data.pipelineTemplates) {
          this.setState({ templates: data.pipelineTemplates });
        }
      })
      .catch(error => {
        console.log(error.message); // tslint:disable-line
      });
  }

  componentDidMount() {
    this.getTemplates();
  }

  onChangeVisibility = (e: React.FormEvent<HTMLElement>) => {
    this.setState({
      visibility: (e.currentTarget as HTMLInputElement).value
    });
  };

  onChangeValue = <T extends keyof State>(key: T, value: State[T]) => {
    this.setState(({ [key]: value } as unknown) as Pick<State, keyof State>);
  };

  onDateInputChange = (type: string, date) => {
    if (type === 'endDate') {
      this.setState({ endDate: date });
    } else {
      this.setState({ startDate: date });
    }
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
    const { pipeline, type } = this.props;
    const {
      selectedMemberIds,
      backgroundColor,
      templateId,
      hackScoringType,
      startDate,
      endDate,
      metric,
      boardId
    } = this.state;
    const finalValues = values;

    if (pipeline) {
      finalValues._id = pipeline._id;
    }

    return {
      ...finalValues,
      type,
      boardId,
      memberIds: selectedMemberIds,
      bgColor: backgroundColor,
      templateId,
      hackScoringType,
      startDate,
      endDate,
      metric
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

  renderTemplates() {
    const { templates, templateId } = this.state;

    const templateOptions = templates.map(template => ({
      value: template._id,
      label: template.name
    }));

    const onChange = item => this.onChangeValue('templateId', item.value);

    return (
      <FormGroup>
        <ControlLabel>Template</ControlLabel>

        <Select
          placeholder={__('Choose template')}
          value={templateId}
          options={templateOptions}
          onChange={onChange}
          clearable={false}
        />
      </FormGroup>
    );
  }

  renderBoards() {
    const { boards } = this.props;

    const boardOptions = boards.map(board => ({
      value: board._id,
      label: board.name
    }));

    const onChange = item => this.onChangeValue('boardId', item.value);

    return (
      <FormGroup>
        <ControlLabel required={true}>Campaign</ControlLabel>
        <Select
          placeholder={__('Choose a campaign')}
          value={this.state.boardId}
          options={boardOptions}
          onChange={onChange}
          clearable={false}
        />
      </FormGroup>
    );
  }

  renderBox(type, desc, formula) {
    const onClick = () => this.onChangeValue('hackScoringType', type);

    return (
      <Box selected={this.state.hackScoringType === type} onClick={onClick}>
        <b>{__(type)}</b>
        <p>
          {__(desc)} <strong>{formula}</strong>
        </p>
      </Box>
    );
  }

  renderContent = (formProps: IFormProps) => {
    const { pipeline, renderButton, closeModal } = this.props;
    const { values, isSubmitted } = formProps;
    const object = pipeline || ({} as IPipeline);
    const { startDate, endDate, metric, visibility } = this.state;

    const onChangeMetric = item => this.onChangeValue('metric', item.value);

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
      <>
        <Modal.Header closeButton={true}>
          <Modal.Title>{pipeline ? 'Edit project' : 'Add project'}</Modal.Title>
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

          {this.renderBoards()}

          <FormGroup>
            <ControlLabel>Scoring type</ControlLabel>

            <FlexContent>
              {this.renderBox(
                'ice',
                'Set the Impact, Confidence and Ease factors for your tasks. Final score is calculated by the formula:',
                'Impact * Confidence * Ease'
              )}
              {this.renderBox(
                'rice',
                'Set the Reach, Impact, Confidence and Effort factors for your tasks. Final score is calculated by the formula:',
                '(Reach * Impact * Confidence) / Effort'
              )}
              {this.renderBox(
                'pie',
                'Set the Potential, Importance and Ease factors for your tasks. Final score is calculated by the formula:',
                '(Potential + Importance + Ease) / 3'
              )}
            </FlexContent>
          </FormGroup>

          <FormGroup>
            <FlexContent>
              <DateItem>
                <ControlLabel required={true}>Start date</ControlLabel>
                <DateControl
                  {...formProps}
                  required={true}
                  name="startDate"
                  placeholder={'Start date'}
                  value={startDate}
                  onChange={this.onDateInputChange.bind(this, 'startDate')}
                />
              </DateItem>
              <DateItem>
                <ControlLabel required={true}>End date</ControlLabel>
                <DateControl
                  {...formProps}
                  required={true}
                  name="endDate"
                  placeholder={'End date'}
                  value={endDate}
                  onChange={this.onDateInputChange.bind(this, 'endDate')}
                />
              </DateItem>
            </FlexContent>
          </FormGroup>

          <FlexContent>
            <ExpandWrapper>
              <FormGroup>
                <ControlLabel>Metric</ControlLabel>
                <Select
                  placeholder={__('Choose a metric')}
                  value={metric}
                  options={metricOptions}
                  onChange={onChangeMetric}
                  clearable={false}
                />
              </FormGroup>
            </ExpandWrapper>
            <ExpandWrapper>
              <FlexContent>
                <ExpandWrapper>
                  <FormGroup>
                    <ControlLabel required={true}>Visibility</ControlLabel>
                    <FormControl
                      {...formProps}
                      name="visibility"
                      componentClass="select"
                      value={visibility}
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
                          style={{
                            backgroundColor: this.state.backgroundColor
                          }}
                        />
                      </ColorPick>
                    </OverlayTrigger>
                  </div>
                </FormGroup>
              </FlexContent>
            </ExpandWrapper>
          </FlexContent>

          {this.renderSelectMembers()}
          {this.renderTemplates()}

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
        size="lg"
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
