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

  conditionsContent = () => {
    const { segment } = this.props;
    const { conditions } = segment;

    return (
      <>
        <ConditionRemove>
          <Button
            className="round"
            size="small"
            btnStyle="simple"
            icon="times"
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
  };

  conditionsList = () => {
    const { segment, index } = this.props;
    const { conditions } = segment;

    if (conditions.length === 0 && index === 0) {
      return <PropertyList {...this.props} />;
    }

    return this.conditionsContent();
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
