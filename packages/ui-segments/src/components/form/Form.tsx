import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';

import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import CommonForm from '@erxes/ui/src/components/form/Form';
import ControlLabel from '@erxes/ui/src/components/form/Label';

import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { __, generateRandomColorCode } from '@erxes/ui/src/utils';
import { FlexContent, FlexItem } from '@erxes/ui/src/layout/styles';
import Popover from 'react-bootstrap/Popover';
import TwitterPicker from 'react-color/lib/Twitter';
import {
  IConditionsForPreview,
  IEvent,
  IField,
  ISegment,
  ISegmentCondition,
  ISegmentMap,
  ISegmentWithConditionDoc,
  ISubSegment
} from '../../types';
import ConditionsList from '../preview/ConditionsList';

import { ColorPick, ColorPicker } from '@erxes/ui/src/styles/main';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import { FilterBox, SegmentBackIcon, SegmentWrapper, Count } from '../styles';
import PropertyCondition from '../../containers/form/PropertyCondition';
import { Link } from 'react-router-dom';
import PropertyForm from './PropertyForm';
import EventForm from './EventForm';
import { RenderDynamicComponent } from '@erxes/ui/src/utils/core';

type Props = {
  contentType: string;
  fields: IField[];
  events: IEvent[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  filterContent?: (values: any) => void;
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
    config?: any;
    conditionsConjunction?: string;
  }) => void;

  isModal?: boolean;
  hideDetailForm?: boolean;
  count: number;
};

type State = {
  _id?: string;
  name: string;
  description: string;
  subOf: string;
  color: string;
  conditionsConjunction: string;
  shouldWriteActivityLog: boolean;

  segments: ISegmentMap[];
  state: string;
  showAddGroup: boolean;
  chosenSegment?: ISegmentMap;

  chosenProperty?: IField;
  chosenCondition?: ISegmentCondition;
  chosenSegmentKey?: string;
  config: any;
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
      shouldWriteActivityLog: false,
      subSegmentConditions: [
        {
          contentType: props.contentType || 'customer',
          conditionsConjunction: 'and'
        }
      ],
      config: {}
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
      config: item.config,
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
    const { subOf, segments, conditionsConjunction, config } = this.state;
    const { previewCount } = this.props;

    const conditionsForPreview: IConditionsForPreview[] = [];

    segments.forEach((segment: ISegmentMap) => {
      conditionsForPreview.push({
        type: 'subSegment',
        subSegmentForPreview: segment
      });
    });

    if (previewCount) {
      previewCount({
        conditions: conditionsForPreview,
        config,
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

  onChangeConfig = config => {
    this.setState({ config });
  };

  renderExtraContent = () => {
    const { contentType, hideDetailForm } = this.props;
    const { config } = this.state;

    const plugins: any[] = (window as any).plugins || [];

    for (const plugin of plugins) {
      if (contentType.includes(`${plugin.name}:`) && plugin.segmentForm) {
        return (
          <RenderDynamicComponent
            scope={plugin.scope}
            component={plugin.segmentForm}
            injectedProps={{
              config,
              type: contentType,
              onChangeConfig: this.onChangeConfig,
              hideDetailForm,
              component: 'form'
            }}
          />
        );
      }
    }

    return null;
  };

  renderDetailForm = (formProps: IFormProps) => {
    const { hideDetailForm } = this.props;
    const { name, description, color, shouldWriteActivityLog } = this.state;

    if (hideDetailForm) {
      return;
    }

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
        {this.renderExtraContent()}
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
      chosenSegmentKey,
      config
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
            config={config}
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
          config={config}
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
      config,
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
      config,
      shouldWriteActivityLog
    };
  };

  renderSaveButton = (formProps: IFormProps) => {
    const {
      segments,
      state,
      subOf,
      conditionsConjunction,
      config
    } = this.state;
    const { values, isSubmitted } = formProps;
    const {
      renderButton,
      segment,
      afterSave,
      closeModal,
      previewCount,
      isModal,
      filterContent
    } = this.props;

    const onPreviewCount = () => {
      const conditionsForPreview: IConditionsForPreview[] = [];

      segments.forEach((seg: ISegmentMap) => {
        conditionsForPreview.push({
          type: 'subSegment',
          subSegmentForPreview: seg
        });
      });

      if (previewCount) {
        previewCount({
          conditions: conditionsForPreview,
          config,
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
      if (filterContent) {
        return (
          <>
            <Button
              id="segment-show-count"
              onClick={onPreviewCount}
              icon="refresh-1"
            >
              {__('Count')}
            </Button>

            {filterContent(this.generateDoc(values))}
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
    const { count, isModal } = this.props;

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
              <Link to={`/segments?contentType=${contentType}`}>
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
