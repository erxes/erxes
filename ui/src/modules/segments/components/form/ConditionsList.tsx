import PropertyList from 'modules/segments/containers/form/PropertyList';
import { ISegmentCondition, ISegmentMap } from 'modules/segments/types';
import React from 'react';
import { FilterBox } from '../styles';

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

    console.log(conditions);

    return (
      <FilterBox>
        {conditions.map(condition => {
          return <p key={Math.random()}>{condition.propertyName}</p>;
        })}
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
