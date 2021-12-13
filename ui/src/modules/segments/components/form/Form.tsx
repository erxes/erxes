import { IBoard } from 'modules/boards/types';
import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import CommonForm from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __, generateRandomColorCode } from 'modules/common/utils';
import { FlexContent, FlexItem } from 'modules/layout/styles';
import Popover from 'react-bootstrap/Popover';
import TwitterPicker from 'react-color/lib/Twitter';
import Select from 'react-select-plus';
import {
  IConditionsForPreview,
  IEvent,
  IField,
  ISegment,
  ISegmentCondition,
  ISegmentMap,
  ISegmentWithConditionDoc,
  ISubSegment
} from 'modules/segments/types';
import ConditionsList from '../preview/ConditionsList';

import { ColorPick, ColorPicker } from 'modules/settings/styles';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import { FilterBox, SegmentBackIcon, SegmentWrapper, Count } from '../styles';
import PropertyCondition from '../../containers/form/PropertyCondition';
import { Link } from 'react-router-dom';
import { isBoardKind } from 'modules/segments/utils';
import Icon from 'modules/common/components/Icon';
import PropertyForm from '../form/PropertyForm';
import EventForm from './EventForm';

type Props = {
  contentType: string;
  fields: IField[];
  events: IEvent[];
  boards?: IBoard[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  edit?: (params: { _id: string; doc: ISegmentWithConditionDoc }) => void;
  segment?: ISegment;
  headSegments: ISegment[];
  segments: ISegment[];
  isForm?: boolean;
  closeModal?: () => void;
  afterSave?: () => void;

  previewCount?: (args: {
    conditions: IConditionsForPreview[];
    subOf?: string;
    conditionsConjunction?: string;
  }) => void;

  isModal?: boolean;
  hideDetailForm?: boolean;
  count: number;
  usageType?: string;
};

type State = {
  _id?: string;
  name: string;
  description: string;
  subOf: string;
  color: string;
  conditionsConjunction: string;
  boardId: string;
  pipelineId: string;
  shouldWriteActivityLog: boolean;

  segments: ISegmentMap[];
  state: string;
  showAddGroup: boolean;
  chosenSegment?: ISegmentMap;

  chosenProperty?: IField;
  chosenCondition?: ISegmentCondition;
  chosenSegmentKey?: string;
};

class SegmentFormAutomations extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    let state = 'propertyForm';
    let showAddGroup = true;

    const segment: ISegment = props.segment || {
      name: '',
      description: '',
      subOf: '',
      color: generateRandomColorCode(),
      conditionsConjunction: 'and',
      boardId: '',
      pipelineId: '',
      shouldWriteActivityLog: false,
      subSegmentConditions: [
        {
          contentType: props.contentType || 'customer',
          conditionsConjunction: 'and'
        }
      ]
    };

    if (
      !props.segment ||
      (props.segment && props.segment.subSegmentConditions.length === 0)
    ) {
      state = 'list';
      showAddGroup = false;
    }

    if (
      props.segment ||
      (props.segment && props.segment.subSegmentConditions.length > 0)
    ) {
      state = 'list';
    }

    const segments = segment.subSegmentConditions.map((item: ISegment) => ({
      _id: item._id,
      key: Math.random().toString(),
      contentType: item.contentType || 'customer',
      conditionsConjunction: item.conditionsConjunction,
      conditions: item.conditions
        ? item.conditions.map((cond: ISegmentCondition) => ({
            key: Math.random().toString(),
            ...cond
          }))
        : []
    }));

    this.state = {
      ...segment,
      showAddGroup,
      segments,
      state,
      chosenSegment: undefined
    };
  }

  componentDidMount() {
    const { subOf, segments, conditionsConjunction } = this.state;
    const { previewCount } = this.props;

    const conditionsForPreview: IConditionsForPreview[] = [];

    segments.forEach((cond: ISegmentMap) => {
      conditionsForPreview.push({
        type: 'subSegment',
        subSegmentForPreview: cond
      });
    });

    if (previewCount) {
      previewCount({
        conditions: conditionsForPreview,
        subOf,
        conditionsConjunction
      });
    }
  }

  renderSubOf(formProps: IFormProps) {
    const onChange = (e: React.FormEvent) =>
      this.handleChange('subOf', (e.currentTarget as HTMLInputElement).value);

    return (
      <FormGroup>
        <ControlLabel>Sub segment of</ControlLabel>
        <FormControl
          {...formProps}
          name="subOf"
          componentClass="select"
          value={this.state.subOf || ''}
          onChange={onChange}
        >
          <option value="">{__('Not selected')}</option>
          {this.props.headSegments.map(segment => (
            <option value={segment._id} key={segment._id}>
              {segment.name}
            </option>
          ))}
        </FormControl>
      </FormGroup>
    );
  }

  handleChange = <T extends keyof State>(name: T, value: State[T]) => {
    this.setState(({ [name]: value } as unknown) as Pick<State, keyof State>);
  };

  generatePipelineOptions = () => {
    const { boardId } = this.state;

    const board = (this.props.boards || []).find(b => b._id === boardId);

    if (!board) {
      return [];
    }

    return (board.pipelines || []).map(p => ({
      value: p._id,
      label: p.name
    }));
  };

  renderDetailForm = (formProps: IFormProps) => {
    const { hideDetailForm, contentType, boards = [] } = this.props;
    const {
      name,
      description,
      color,
      boardId,
      pipelineId,
      shouldWriteActivityLog
    } = this.state;

    if (hideDetailForm) {
      return;
    }

    const onChangeBoardItem = (key, e) => {
      const value = e ? e.value : '';

      this.setState(({ [key]: value } as unknown) as Pick<State, keyof State>);
    };

    const nameOnChange = (e: React.FormEvent) =>
      this.handleChange('name', (e.currentTarget as HTMLInputElement).value);

    const descOnChange = (e: React.FormEvent) =>
      this.handleChange(
        'description',
        (e.currentTarget as HTMLInputElement).value
      );

    const colorOnChange = e => this.handleChange('color', e.hex);

    const onShouldWriteActivityLogChange = (e: React.FormEvent) => {
      this.handleChange(
        'shouldWriteActivityLog',
        (e.currentTarget as HTMLInputElement).checked
      );
    };

    const popoverTop = (
      <Popover id="color-picker">
        <TwitterPicker triangle="hide" color={color} onChange={colorOnChange} />
      </Popover>
    );

    return (
      <>
        <FlexContent>
          <FlexItem count={5}>
            <FormGroup>
              <ControlLabel required={true}>Segment Name</ControlLabel>
              <FormControl
                {...formProps}
                name="name"
                value={name}
                onChange={nameOnChange}
                required={true}
                autoFocus={true}
              />
            </FormGroup>
          </FlexItem>
          <FlexItem count={3} hasSpace={true}>
            {this.renderSubOf(formProps)}
          </FlexItem>
        </FlexContent>
        <FlexContent>
          <FlexItem count={7}>
            <FormGroup>
              <ControlLabel>Description</ControlLabel>
              <FormControl
                {...formProps}
                name="description"
                value={description}
                onChange={descOnChange}
              />
            </FormGroup>
          </FlexItem>
          <FlexItem hasSpace={true}>
            <FormGroup>
              <ControlLabel>Color</ControlLabel>
              <div id="segment-color">
                <OverlayTrigger
                  trigger="click"
                  rootClose={true}
                  placement="bottom"
                  overlay={popoverTop}
                >
                  <ColorPick>
                    <ColorPicker style={{ backgroundColor: color }} />
                  </ColorPick>
                </OverlayTrigger>
              </div>
            </FormGroup>
          </FlexItem>
        </FlexContent>
        <FlexContent>
          <FlexItem>
            <FormControl
              name="shouldWriteActivityLogChange"
              componentClass="checkbox"
              onChange={onShouldWriteActivityLogChange}
              checked={shouldWriteActivityLog}
            >
              Write activity log when items enter this segment
            </FormControl>
          </FlexItem>
        </FlexContent>
        {isBoardKind(contentType) ? (
          <>
            <FlexContent>
              <FlexItem>
                <FormGroup>
                  <ControlLabel>Board</ControlLabel>
                  <Select
                    value={boardId}
                    options={boards.map(b => ({
                      value: b._id,
                      label: b.name
                    }))}
                    onChange={onChangeBoardItem.bind(this, 'boardId')}
                  />
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Pipeline</ControlLabel>

                  <Select
                    value={pipelineId}
                    onChange={onChangeBoardItem.bind(this, 'pipelineId')}
                    options={this.generatePipelineOptions()}
                  />
                </FormGroup>
              </FlexItem>
            </FlexContent>
          </>
        ) : (
          <></>
        )}
      </>
    );
  };

  addCondition = (condition: ISegmentCondition, segmentKey?: string) => {
    const segments = [...this.state.segments];

    const foundedSegment = segments.find(segment => segment.key === segmentKey);
    const segmentIndex = segments.findIndex(
      segment => segment.key === segmentKey
    );

    if (foundedSegment) {
      if (condition.key) {
        const foundedConditionIndex = foundedSegment.conditions.findIndex(
          value => value.key === condition.key
        );

        foundedSegment.conditions[foundedConditionIndex] = condition;
      } else {
        condition.key = Math.random().toString();

        foundedSegment.conditions = [...foundedSegment.conditions, condition];
      }

      segments[segmentIndex] = foundedSegment;

      this.setState({
        segments,
        state: 'list',
        showAddGroup: true,
        chosenProperty: undefined,
        chosenCondition: undefined
      });
    }
  };

  removeCondition = (key: string, segmentKey?: string) => {
    const segments = [...this.state.segments];

    const foundedSegment = segments.find(segment => segment.key === segmentKey);
    const segmentIndex = segments.findIndex(
      segment => segment.key === segmentKey
    );

    if (foundedSegment) {
      const conditionsIndex = foundedSegment.conditions.findIndex(
        condition => condition.key === key
      );

      if (conditionsIndex === 0 && foundedSegment.conditions.length === 1) {
        segments.splice(segmentIndex, 1);

        return this.setState({ segments });
      } else {
        foundedSegment.conditions.splice(conditionsIndex, 1);
      }

      segments[segmentIndex] = foundedSegment;

      this.setState({ segments });
    }
  };

  onClickBackToList = () => {
    this.setState({
      chosenSegment: undefined,
      state: 'list',
      chosenProperty: undefined,
      chosenCondition: undefined
    });
  };

  removeSegment = (segmentKey: string) => {
    const segments = [...this.state.segments];

    const segmentIndex = segments.findIndex(
      segment => segment.key === segmentKey
    );

    segments.splice(segmentIndex, 1);
    this.setState({ segments });
  };

  addNewProperty = (segmentKey: string) => {
    const segments = [...this.state.segments];

    const foundedSegment = segments.find(segment => segment.key === segmentKey);

    this.setState({ chosenSegment: foundedSegment, state: 'propertyForm' });
  };

  addNewEvent = (segmentKey: string) => {
    const segments = [...this.state.segments];

    const foundedSegment = segments.find(segment => segment.key === segmentKey);

    this.setState({ chosenSegment: foundedSegment, state: 'eventForm' });
  };

  addSegment = () => {
    const { contentType } = this.props;

    const newSegment = {
      key: Math.random().toString(),
      conditions: [],
      conditionsConjunction: 'and',
      contentType: contentType || 'customer'
    };

    this.setState({
      state: 'propertyForm',
      segments: [...this.state.segments, newSegment],
      chosenSegment: newSegment
    });
  };

  changeConditionsConjunction = (value: string) => {
    return this.setState({ conditionsConjunction: value });
  };

  changeSubSegmentConjunction = (segmentKey: string, conjunction: string) => {
    const segments = [...this.state.segments];

    const foundedSegment = segments.find(segment => segment.key === segmentKey);
    const segmentIndex = segments.findIndex(
      segment => segment.key === segmentKey
    );

    if (foundedSegment) {
      foundedSegment.conditionsConjunction = conjunction;

      segments[segmentIndex] = foundedSegment;

      this.setState({ segments });
    }
  };

  renderConditionsList = () => {
    const { contentType, hideDetailForm, events } = this.props;
    const {
      segments,
      state,
      chosenSegment,
      conditionsConjunction,
      chosenProperty,
      chosenCondition,
      boardId,
      pipelineId,
      chosenSegmentKey
    } = this.state;

    if (chosenProperty && chosenCondition && chosenSegmentKey) {
      return (
        <>
          <SegmentBackIcon onClick={this.onClickBackToList}>
            <Icon icon="angle-left" size={20} /> back
          </SegmentBackIcon>
          <PropertyForm
            field={chosenProperty}
            condition={chosenCondition}
            segmentKey={chosenSegmentKey}
            addCondition={this.addCondition}
          />
        </>
      );
    }

    if (state === 'list') {
      return segments.map((segment, index) => {
        return (
          <ConditionsList
            key={Math.random()}
            conditionsConjunction={conditionsConjunction}
            changeConditionsConjunction={this.changeConditionsConjunction}
            addNewProperty={this.addNewProperty}
            addNewEvent={this.addNewEvent}
            onClickBackToList={this.onClickBackToList}
            removeCondition={this.removeCondition}
            removeSegment={this.removeSegment}
            contentType={contentType}
            index={index}
            segment={segment}
            addCondition={this.addCondition}
            changeSubSegmentConjunction={this.changeSubSegmentConjunction}
            onClickProperty={this.onClickProperty}
            onClickEvent={this.onClickEvent}
            chosenProperty={chosenProperty}
            chosenCondition={chosenCondition}
            hideDetailForm={hideDetailForm || false}
            boardId={boardId}
            pipelineId={pipelineId}
          />
        );
      });
    }

    if (chosenSegment && state === 'propertyForm') {
      return (
        <PropertyCondition
          key={Math.random()}
          hideBackButton={false}
          onClickBackToList={this.onClickBackToList}
          contentType={contentType}
          segment={chosenSegment}
          addCondition={this.addCondition}
          hideDetailForm={hideDetailForm || false}
          changeSubSegmentConjunction={this.changeSubSegmentConjunction}
          boardId={boardId}
          pipelineId={pipelineId}
        />
      );
    }

    if ((chosenSegment || chosenSegmentKey) && state === 'eventForm') {
      return (
        <EventForm
          condition={chosenCondition}
          key={Math.random()}
          segmentKey={
            chosenSegment ? chosenSegment.key : chosenSegmentKey || ''
          }
          onClickBackToList={this.onClickBackToList}
          addCondition={this.addCondition}
          events={events}
        />
      );
    }

    return <></>;
  };

  onClickProperty = (field, condition, segmentKey) => {
    this.setState({
      chosenProperty: field,
      chosenCondition: condition,
      showAddGroup: false,
      chosenSegmentKey: segmentKey,
      state: 'propertyForm'
    });
  };

  onClickEvent = (condition, segmentKey) => {
    this.setState({
      chosenCondition: condition,
      showAddGroup: false,
      chosenSegmentKey: segmentKey,
      state: 'eventForm'
    });
  };

  renderAddGroupButton = () => {
    const { state, showAddGroup } = this.state;

    let show = false;

    if (state === 'list') {
      show = true;
    }

    if (!showAddGroup) {
      show = false;
    }

    return (
      <FilterBox>
        {this.renderConditionsList()}
        {show ? (
          <Button
            onClick={this.addSegment}
            size="small"
            btnStyle="simple"
            icon="add"
          >
            Add new group
          </Button>
        ) : (
          <></>
        )}
      </FilterBox>
    );
  };

  generateDoc = (values: {
    _id?: string;
    name: string;
    subOf: string;
    color: string;
    conditionsConjunction: string;
  }) => {
    const { contentType, segment } = this.props;
    const {
      segments,
      conditionsConjunction,
      color,
      boardId,
      pipelineId,
      shouldWriteActivityLog
    } = this.state;
    const finalValues = values;

    const conditionSegments: ISubSegment[] = [];

    if (segment && segment._id) {
      finalValues._id = segment._id;
    }

    segments.forEach((cond: ISegmentMap) => {
      const { key, ...item } = cond;

      conditionSegments.push(item);
    });

    return {
      ...finalValues,
      color,
      conditionsConjunction,
      contentType,
      conditionSegments,
      boardId,
      pipelineId,
      shouldWriteActivityLog
    };
  };

  renderSaveButton = (formProps: IFormProps) => {
    const { segments, state, subOf, conditionsConjunction } = this.state;
    const { values, isSubmitted } = formProps;
    const {
      renderButton,
      segment,
      afterSave,
      closeModal,
      previewCount,
      isModal,
      usageType
    } = this.props;

    const onPreviewCount = () => {
      const conditionsForPreview: IConditionsForPreview[] = [];

      segments.forEach((cond: ISegmentMap) => {
        conditionsForPreview.push({
          type: 'subSegment',
          subSegmentForPreview: cond
        });
      });

      if (previewCount) {
        previewCount({
          conditions: conditionsForPreview,
          subOf,
          conditionsConjunction
        });
      }
    };

    if (
      segments.length > 0 &&
      segments[0].conditions.length > 0 &&
      state === 'list'
    ) {
      if (usageType && usageType === 'export') {
        return (
          <>
            {renderButton({
              name: 'segment',
              text: 'Apply',
              values: this.generateDoc(values),
              callback: closeModal || afterSave,
              isSubmitted,
              object: segment
            })}
          </>
        );
      }

      return (
        <>
          {isModal ? (
            <Button
              id="segment-show-count"
              onClick={onPreviewCount}
              icon="refresh-1"
            >
              {__('Refresh count')}
            </Button>
          ) : (
            <Button
              id="segment-show-count"
              icon="crosshairs"
              onClick={onPreviewCount}
            >
              Show count
            </Button>
          )}

          {renderButton({
            name: 'segment',
            values: this.generateDoc(values),
            callback: closeModal || afterSave,
            isSubmitted,
            object: segment
          })}
        </>
      );
    }

    return <></>;
  };

  renderCount = () => {
    const { segments, state } = this.state;
    const { count, isModal, usageType } = this.props;

    if (usageType && usageType === 'export') {
      return null;
    }

    if (
      segments.length > 0 &&
      segments[0].conditions.length > 0 &&
      state === 'list' &&
      isModal
    ) {
      return (
        <Count>
          {__('Items Found')}: <span>{count}</span>
        </Count>
      );
    }

    return null;
  };

  renderForm = (formProps: IFormProps) => {
    const { closeModal, isModal, contentType } = this.props;

    return (
      <>
        {this.renderDetailForm(formProps)}
        {this.renderAddGroupButton()}
        {this.renderCount()}
        <ModalFooter id="button-group">
          <Button.Group>
            {isModal ? (
              <Button
                btnStyle="simple"
                type="button"
                icon="times-circle"
                onClick={closeModal}
              >
                Cancel
              </Button>
            ) : (
              <Link to={`/segments/${contentType}`}>
                <Button btnStyle="simple" icon="times-circle">
                  Cancel
                </Button>
              </Link>
            )}

            {this.renderSaveButton(formProps)}
          </Button.Group>
        </ModalFooter>
      </>
    );
  };

  render() {
    return (
      <SegmentWrapper>
        <CommonForm renderContent={this.renderForm} />
      </SegmentWrapper>
    );
  }
}

export default SegmentFormAutomations;
