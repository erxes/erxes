import Button from 'modules/common/components/Button';
import { FlexRightItem } from 'modules/layout/styles';
import PropertyList from 'modules/segments/containers/form/PropertyList';
import { ISegmentCondition, ISegmentMap } from 'modules/segments/types';
import React from 'react';
import { ConditionItem, FilterBox, FilterProperty, FilterRow } from '../styles';

type Props = {
  segment: ISegmentMap;
  contentType: string;
  index: number;
  addCondition: (condition: ISegmentCondition, segmentKey: string) => void;
};

type State = {
  state: string;
};

class ConditionsList extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = { state: 'list' };
  }

  conditionsContent = () => {
    const { segment } = this.props;
    const { conditions } = segment;

    return (
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

        <Button size="small" btnStyle="simple" icon="plus">
          Add property
        </Button>
      </FilterBox>
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
    const { state } = this.state;

    switch (state) {
      case 'list':
        return this.conditionsList();

      default:
        return this.conditionsList();
    }
  }
}

export default ConditionsList;
