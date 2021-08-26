import { ISegmentCondition } from 'modules/segments/types';
import { __ } from 'modules/common/utils';
import React from 'react';
import { FilterProperty } from '../styles';

type Props = {
  condition: ISegmentCondition;
};

type State = {};

class ConditionDetail extends React.Component<Props, State> {
  render() {
    const { condition } = this.props;

    return (
      <FilterProperty>
        <p>{`${condition.propertyType}'s`}</p>
        {condition.propertyLabel}
        {condition.propertyValue}
      </FilterProperty>
    );
  }
}

export default ConditionDetail;
