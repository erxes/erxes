import Button from 'modules/common/components/Button';
import { FlexRightItem } from 'modules/layout/styles';
import PropertyList from 'modules/segments/containers/form/PropertyList';
import { ISegmentCondition, ISegmentMap } from 'modules/segments/types';
import { CenterContent } from 'erxes-ui/lib/styles/main';
import { __ } from 'modules/common/utils';
import React from 'react';
import {
  ConditionItem,
  ConditionRemove,
  ConjunctionButtons,
  FilterBox,
  FilterProperty,
  FilterRow
} from '../styles';

type Props = {
  segment: ISegmentMap;
  contentType: string;
  conditionsConjunction: string;
  index: number;
  changeConditionsConjunction: (value: string) => void;
  addCondition: (condition: ISegmentCondition, segmentKey: string) => void;
  addNewProperty: (segmentKey: string) => void;
  removeCondition: (key: string, segmentKey?: string) => void;
  removeSegment: (segmentKey: string) => void;
  onClickBackToList: () => void;
};

type State = {};

class ConditionsList extends React.Component<Props, State> {
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

  renderConjunction = () => {
    const {
      conditionsConjunction,
      index,
      changeConditionsConjunction
    } = this.props;

    if (index === 0) {
      return <></>;
    }

    const onClickAnd = () => {
      changeConditionsConjunction('and');
    };

    const onClickOr = () => {
      changeConditionsConjunction('or');
    };

    let btnStyleAnd = 'default';
    let btnSyleOr = 'simple';

    if (conditionsConjunction === 'or') {
      btnStyleAnd = 'simple';
      btnSyleOr = 'default';
    }

    return (
      <CenterContent>
        <ConjunctionButtons>
          <Button.Group hasGap={false}>
            <Button size="small" onClick={onClickAnd} btnStyle={btnStyleAnd}>
              {__('And')}
            </Button>
            <Button size="small" onClick={onClickOr} btnStyle={btnSyleOr}>
              {__('Or')}
            </Button>
          </Button.Group>
        </ConjunctionButtons>
      </CenterContent>
    );
  };

  render() {
    const { segment, index } = this.props;
    const { conditions } = segment;

    if (conditions.length === 0 && index === 0) {
      return <PropertyList {...this.props} hideBackButton={false} />;
    }

    return (
      <div>
        {this.renderConjunction()}
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
      </div>
    );
  }
}

export default ConditionsList;
