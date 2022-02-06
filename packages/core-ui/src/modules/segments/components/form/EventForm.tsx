import {
  IConditionFilter,
  IEvent,
  ISegmentCondition
} from 'modules/segments/types';
import Select from 'react-select-plus';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import FormControl from 'modules/common/components/form/Control';
import React from 'react';
import { OperatorList, SegmentBackIcon } from '../styles';
import { CenterContent } from 'erxes-ui/lib/styles/main';
import Button from 'modules/common/components/Button';
import { DEFAULT_OPERATORS, EVENT_OCCURENCES } from '../constants';
import Icon from 'modules/common/components/Icon';

type Props = {
  events: IEvent[];
  segmentKey: string;
  addCondition: (
    condition: ISegmentCondition,
    segmentKey: string,
    boardId?: string,
    pipelineId?: string,
    formId?: string
  ) => void;
  condition?: ISegmentCondition;
  onClickBackToList: () => void;
};

type State = {
  eventName: string;
  eventOccurence: string;
  eventOccurenceValue: number;
  eventAttributeFilters: IConditionFilter[];
};

class EventForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { condition = {} } = props;

    this.state = {
      eventName: condition.eventName,
      eventOccurence: condition.eventOccurence,
      eventOccurenceValue: condition.eventOccurenceValue,
      eventAttributeFilters: condition.eventAttributeFilters || {}
    };
  }

  onChangeSelect = (key, e) => {
    const value = e ? e.value : '';

    this.setState(({ [key]: value } as unknown) as Pick<State, keyof State>);
  };

  onChangeOccurenceValue = e => {
    const value = e.target.value;
    this.setState({ eventOccurenceValue: value ? parseFloat(value) : 0 });
  };

  renderInput = attributeName => {
    const { eventAttributeFilters } = this.state;

    const eventAttributeFilter = eventAttributeFilters[0] || {};

    const onChangeSelect = e => {
      eventAttributeFilter.operator = e ? e.value : '';

      this.setState({ eventAttributeFilters: [eventAttributeFilter] });
    };

    const onChangeAttributeValue = e => {
      eventAttributeFilter.value = e.target.value;

      this.setState({ eventAttributeFilters: [eventAttributeFilter] });
    };

    if (eventAttributeFilter && eventAttributeFilter.name === attributeName) {
      return (
        <>
          <FormGroup>
            <Select
              placeholder="Select operator"
              options={DEFAULT_OPERATORS.map(b => ({
                value: b.value,
                label: b.name
              }))}
              value={eventAttributeFilter.operator}
              onChange={onChangeSelect}
            />
          </FormGroup>
          <FormGroup>
            <FormControl
              placeholder="value"
              type="number"
              value={eventAttributeFilter.value}
              onChange={onChangeAttributeValue}
            />
          </FormGroup>
        </>
      );
    }
    return;
  };

  isChecked = attributeName => {
    const { eventAttributeFilters } = this.state;

    return (
      eventAttributeFilters[0] &&
      eventAttributeFilters[0].name === attributeName
    );
  };

  onClickAttribute = attributeName => {
    const attritibutes = [{ name: attributeName, operator: '', value: '' }];

    this.setState({ eventAttributeFilters: attritibutes });
  };

  renderAttributes = () => {
    const { events } = this.props;
    const { eventName } = this.state;

    const event = events.find(e => e.name === eventName) || ({} as IEvent);

    if (event.attributeNames && event.attributeNames.length > 0) {
      const attributeNames = event.attributeNames;

      return (
        <>
          <ControlLabel>Attributes</ControlLabel>
          {attributeNames.map((attributeName, index) => {
            return (
              <div key={index}>
                <FormControl
                  key={Math.random()}
                  componentClass="radio"
                  value={attributeName}
                  onChange={this.onClickAttribute.bind(this, attributeName)}
                  checked={this.isChecked(attributeName)}
                >
                  {attributeName}
                </FormControl>
                {this.renderInput(attributeName)}
              </div>
            );
          })}
        </>
      );
    }

    return <></>;
  };

  onClick = () => {
    const { segmentKey, addCondition, condition } = this.props;
    const {
      eventName,
      eventOccurence,
      eventOccurenceValue,
      eventAttributeFilters
    } = this.state;

    return addCondition(
      {
        type: 'event',
        key: condition ? condition.key : '',
        eventName,
        eventOccurence,
        eventOccurenceValue,
        eventAttributeFilters:
          eventAttributeFilters[0] && eventAttributeFilters[0].operator
            ? eventAttributeFilters
            : []
      },
      segmentKey
    );
  };

  render() {
    const { events } = this.props;
    const { eventName, eventOccurenceValue, eventOccurence } = this.state;

    return (
      <>
        <SegmentBackIcon onClick={this.props.onClickBackToList}>
          <Icon icon="angle-left" size={20} /> back
        </SegmentBackIcon>
        <OperatorList>
          <FormGroup>
            <ControlLabel>Event</ControlLabel>
            <Select
              value={eventName}
              options={events.map(b => ({ value: b.name, label: b.name }))}
              onChange={this.onChangeSelect.bind(this, 'eventName')}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Occurence</ControlLabel>
            <Select
              value={eventOccurence}
              options={EVENT_OCCURENCES.map(b => ({
                value: b.value,
                label: b.name
              }))}
              onChange={this.onChangeSelect.bind(this, 'eventOccurence')}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Value</ControlLabel>
            <FormControl
              type="number"
              value={eventOccurenceValue}
              onChange={this.onChangeOccurenceValue}
            />
          </FormGroup>

          {this.renderAttributes()}

          <CenterContent>
            <Button onClick={this.onClick} btnStyle="default">
              Apply filter
            </Button>
          </CenterContent>
        </OperatorList>
      </>
    );
  }
}

export default EventForm;
