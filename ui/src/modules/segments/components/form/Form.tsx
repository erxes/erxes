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
import {
  IEvent,
  IField,
  ISegment,
  ISegmentCondition,
  ISegmentMap,
  ISegmentWithConditionDoc,
  ISubSegment
} from 'modules/segments/types';
import ConditionsList from './ConditionsList';

import { ColorPick, ColorPicker } from 'modules/settings/styles';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import { FilterBox, SegmentWrapper } from '../styles';
import PropertyList from '../../containers/form/PropertyList';

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
  fetchFields?: (pipelineId?: string) => void;

  isModal?: boolean;
};

type State = {
  _id?: string;
  name: string;
  description: string;
  subOf: string;
  color: string;
  conditionsConjunction: string;

  segments: ISegmentMap[];
  state: string;
  showAddGroup: boolean;
  chosenSegment?: ISegmentMap;
};

class SegmentFormAutomations extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    let state = 'form';
    let showAddGroup = true;

    const segment: ISegment = props.segment || {
      name: '',
      description: '',
      subOf: '',
      color: generateRandomColorCode(),
      conditionsConjunction: 'and',
      getConditionSegments: [
        {
          contentType: props.contentType || 'customer',
          conditionsConjunction: 'and'
        }
      ]
    };

    if (
      !props.segment ||
      (props.segment && props.segment.getConditionSegments.length === 0)
    ) {
      state = 'list';
      showAddGroup = false;
    }

    if (
      props.segment ||
      (props.segment && props.segment.getConditionSegments.length > 0)
    ) {
      state = 'list';
    }

    const segments = segment.getConditionSegments.map((item: ISegment) => ({
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

  renderDetailForm = (formProps: IFormProps) => {
    const { isModal } = this.props;
    const { name, description, color } = this.state;

    if (isModal) {
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
      </>
    );
  };

  addCondition = (condition: ISegmentCondition, segmentKey?: string) => {
    const segments = [...this.state.segments];

    const foundedSegment = segments.find(segment => segment.key === segmentKey);
    const foundedSegmentIndex = segments.findIndex(
      segment => segment.key === segmentKey
    );

    if (foundedSegment) {
      foundedSegment.conditions = [
        ...foundedSegment.conditions,
        { key: Math.random().toString(), ...condition }
      ];

      segments[foundedSegmentIndex] = foundedSegment;

      this.setState({ segments, state: 'list', showAddGroup: true });
    }
  };

  removeCondition = (key: string, segmentKey?: string) => {
    const segments = [...this.state.segments];

    const foundedSegment = segments.find(segment => segment.key === segmentKey);
    const foundedSegmentIndex = segments.findIndex(
      segment => segment.key === segmentKey
    );

    if (foundedSegment) {
      const foundedConIndex = foundedSegment.conditions.findIndex(
        condition => condition.key === key
      );

      if (foundedConIndex === 0) {
        segments.splice(foundedSegmentIndex, 1);
      }

      if (foundedConIndex > -1 && foundedConIndex !== 0) {
        foundedSegment.conditions.splice(foundedConIndex, 1);
      }

      segments[foundedSegmentIndex] = foundedSegment;

      this.setState({ segments });
    }
  };

  onClickBackToList = () => {
    this.setState({ chosenSegment: undefined, state: 'list' });
  };

  removeSegment = (segmentKey: string) => {
    const segments = [...this.state.segments];

    const foundedSegmentIndex = segments.findIndex(
      segment => segment.key === segmentKey
    );

    segments.splice(foundedSegmentIndex, 1);
    this.setState({ segments });
  };

  addNewProperty = (segmentKey: string) => {
    const segments = [...this.state.segments];

    const foundedSegment = segments.find(segment => segment.key === segmentKey);

    this.setState({ chosenSegment: foundedSegment, state: 'form' });
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
      state: 'form',
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
    const foundedSegmentIndex = segments.findIndex(
      segment => segment.key === segmentKey
    );

    if (foundedSegment) {
      foundedSegment.conditionsConjunction = conjunction;

      segments[foundedSegmentIndex] = foundedSegment;

      this.setState({ segments });
    }
  };

  renderConditionsList = () => {
    const { contentType } = this.props;
    const {
      segments,
      state,
      chosenSegment,
      conditionsConjunction
    } = this.state;

    if (state !== 'form') {
      return segments.map((segment, index) => {
        return (
          <>
            <ConditionsList
              key={Math.random()}
              conditionsConjunction={conditionsConjunction}
              changeConditionsConjunction={this.changeConditionsConjunction}
              addNewProperty={this.addNewProperty}
              onClickBackToList={this.onClickBackToList}
              removeCondition={this.removeCondition}
              removeSegment={this.removeSegment}
              contentType={contentType}
              index={index}
              segment={segment}
              addCondition={this.addCondition}
              changeSubSegmentConjunction={this.changeSubSegmentConjunction}
            />
          </>
        );
      });
    }

    if (chosenSegment) {
      return (
        <PropertyList
          hideBackButton={false}
          onClickBackToList={this.onClickBackToList}
          contentType={contentType}
          segment={chosenSegment}
          addCondition={this.addCondition}
          changeSubSegmentConjunction={this.changeSubSegmentConjunction}
        />
      );
    }

    return <></>;
  };

  renderFilterItem = () => {
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
            icon="plus"
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
    const { segments, conditionsConjunction, color } = this.state;
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
      conditionSegments
    };
  };

  renderForm = (formProps: IFormProps) => {
    const { segment, renderButton, afterSave, closeModal } = this.props;

    const { values, isSubmitted } = formProps;

    return (
      <>
        {this.renderDetailForm(formProps)}
        {this.renderFilterItem()}

        <ModalFooter id="button-group">
          <Button.Group>
            <Button
              btnStyle="simple"
              type="button"
              icon="times-circle"
              onClick={closeModal}
            >
              Cancel
            </Button>

            {renderButton({
              name: 'segment',
              values: this.generateDoc(values),
              callback: closeModal || afterSave,
              isSubmitted,
              object: segment
            })}
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
