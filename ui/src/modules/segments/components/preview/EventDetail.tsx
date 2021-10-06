import { ISegmentCondition } from 'modules/segments/types';
import React from 'react';
import { ConditionDetailText, PropertyText } from '../styles';

type Props = {
  condition: ISegmentCondition;
  segmentKey: string;
  onClickEvent: (condition, segmentKey) => void;
};

class EventDetail extends React.Component<Props, {}> {
  onClickEvent = () => {
    const { condition, segmentKey } = this.props;

    this.props.onClickEvent(condition, segmentKey);
  };

  render() {
    const { condition } = this.props;

    const { eventName, eventOccurence, eventOccurenceValue } = condition;

    return (
      <ConditionDetailText>
        <PropertyText onClick={this.onClickEvent}>{eventName}</PropertyText>
        <span>{` event is`} </span>
        <span>{`${eventOccurence} ${eventOccurenceValue}`}</span>
      </ConditionDetailText>
    );
  }
}

export default EventDetail;
