import Button from 'modules/common/components/Button';
import { FlexRightItem } from 'modules/layout/styles';
import PropertyList from 'modules/segments/containers/form/PropertyList';
import { ISegmentCondition, ISegmentMap } from 'modules/segments/types';
import React from 'react';
import {
  ConditionItem,
  ConditionRemove,
  FilterBox,
  FilterProperty,
  FilterRow
} from '../styles';

type Props = {
  segment: ISegmentMap;
  contentType: string;
  index: number;
  addCondition: (condition: ISegmentCondition, segmentKey: string) => void;
  addNewProperty: (segmentKey: string) => void;
  removeCondition: (key: string, segmentKey?: string) => void;
  removeSegment: (segmentKey: string) => void;
};

type State = {};

class ConditionsList extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = { state: 'list' };
  }

  addProperty = () => {
    const { segment, addNewProperty } = this.props;
    return addNewProperty(segment.key);
  };

  removeCondition = condition => {
    const { removeCondition, segment } = this.props;

    return removeCondition(condition.key, segment.key);
  };

  removeSegment = () => {
    const { removeSegment, segment } = this.props;

    return removeSegment(segment.key);
  };

  render() {
    const { segment, index } = this.props;
    const { conditions } = segment;

    if (conditions.length === 0 && index === 0) {
      return <PropertyList {...this.props} />;
    }

    return (
      <>
        <ConditionRemove>
          <Button
            className="round"
            size="small"
            btnStyle="simple"
            icon="times"
            onClick={this.removeSegment}
          />
        </ConditionRemove>
        <FilterBox>
          {conditions.map(condition => {
            return (
              <ConditionItem key={Math.random()}>
                <FilterRow>
                  <FilterProperty>{condition.propertyName}</FilterProperty>
                </FilterRow>
                <FlexRightItem>
                  <Button
                    className="round"
                    size="small"
                    btnStyle="simple"
                    icon="times"
                    onClick={this.removeCondition.bind(this, condition)}
                  />
                </FlexRightItem>
              </ConditionItem>
            );
          })}

          <Button
            size="small"
            btnStyle="simple"
            icon="plus"
            onClick={this.addProperty}
          >
            Add property
          </Button>
        </FilterBox>
      </>
    );
  }
}

export default ConditionsList;
