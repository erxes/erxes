import { ISegmentCondition } from 'modules/segments/types';
import React from 'react';
// import { FilterProperty } from '../styles';

type Props = {
  condition: ISegmentCondition;
};

type State = {};

class ConditionDetail extends React.Component<Props, State> {
  render() {
    const { condition } = this.props;

    return (
      <p>{`${condition.propertyType}'s ${condition.propertyLabel}'s value = ${condition.propertyValue}`}</p>
    );
  }
}

export default ConditionDetail;
