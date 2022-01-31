import Button from 'modules/common/components/Button';
import { FlexRightItem } from 'modules/layout/styles';
import PropertyCondition from 'modules/segments/containers/form/PropertyCondition';
import { IField, ISegmentCondition, ISegmentMap } from 'modules/segments/types';
import { __ } from 'modules/common/utils';
import React from 'react';
import {
  Condition,
  ConditionItem,
  ConjunctionButtons,
  ConjunctionButtonsVertical,
  FilterRow,
  // ConditionRemove,
  ConditionGroup,
  ButtonWrapper
} from '../styles';
import PropertyDetail from '../../containers/preview/PropertyDetail';
import Icon from 'modules/common/components/Icon';
import EventDetail from './EventDetail';
import Tip from 'modules/common/components/Tip';

type Props = {
  segment: ISegmentMap;
  contentType: string;
  conditionsConjunction: string;
  index: number;
  changeConditionsConjunction: (value: string) => void;
  addCondition: (
    condition: ISegmentCondition,
    segmentKey: string,
    boardId?: string,
    pipelineId?: string
  ) => void;
  addNewProperty: (segmentKey: string) => void;
  addNewEvent: (segmentKey: string) => void;
  removeCondition: (key: string, segmentKey?: string) => void;
  removeSegment: (segmentKey: string) => void;
  onClickBackToList: () => void;
  changeSubSegmentConjunction: (
    segmentKey: string,
    conjunction: string
  ) => void;
  onClickProperty: (field, condition, segmentKey) => void;
  onClickEvent: (condition, segmentKey) => void;
  chosenProperty?: IField;
  chosenCondition?: ISegmentCondition;
  hideDetailForm: boolean;
  boardId: string;
  pipelineId: string;
};

type State = {};

class ConditionsList extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = { chosenProperty: undefined, chosenCondition: undefined };
  }

  addProperty = () => {
    const { segment, addNewProperty } = this.props;
    return addNewProperty(segment.key);
  };

  addEvent = () => {
    const { segment, addNewEvent } = this.props;
    return addNewEvent(segment.key);
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
    );
  };

  renderSubSegmentConjunction = () => {
    const { segment, changeSubSegmentConjunction } = this.props;
    const { conditionsConjunction, conditions } = segment;

    if (conditions && conditions.length <= 1) {
      return <></>;
    }

    const onClickAnd = () => {
      changeSubSegmentConjunction(segment.key, 'and');
    };

    const onClickOr = () => {
      changeSubSegmentConjunction(segment.key, 'or');
    };

    let btnStyleAnd = 'default';
    let btnSyleOr = 'simple';

    if (conditionsConjunction === 'or') {
      btnStyleAnd = 'simple';
      btnSyleOr = 'default';
    }

    return (
      <ConjunctionButtonsVertical>
        <Button.Group hasGap={false}>
          <Button size="small" onClick={onClickOr} btnStyle={btnSyleOr}>
            <span>Or</span>
          </Button>
          <Button size="small" onClick={onClickAnd} btnStyle={btnStyleAnd}>
            <span>And</span>
          </Button>
        </Button.Group>
      </ConjunctionButtonsVertical>
    );
  };

  renderCondition(condition: ISegmentCondition) {
    const { segment } = this.props;
    const { conditions } = segment;

    let useMargin = true;

    if (conditions && conditions.length <= 1) {
      useMargin = false;
    }

    if (condition.type === 'property') {
      return (
        <ConditionItem useMargin={useMargin} key={Math.random()}>
          <FilterRow>
            <PropertyDetail
              onClickProperty={this.props.onClickProperty}
              condition={condition}
              pipelineId={segment.pipelineId}
              segmentId={segment._id}
              segmentKey={segment.key}
            />

            <FlexRightItem>
              <div onClick={this.removeCondition.bind(this, condition)}>
                <Icon icon="times" size={16} />
              </div>
            </FlexRightItem>
          </FilterRow>
        </ConditionItem>
      );
    }

    return (
      <ConditionItem useMargin={useMargin} key={Math.random()}>
        <FilterRow>
          <EventDetail
            condition={condition}
            onClickEvent={this.props.onClickEvent}
            segmentKey={segment.key}
          />

          <FlexRightItem>
            <div onClick={this.removeCondition.bind(this, condition)}>
              <Icon icon="times" size={16} />
            </div>
          </FlexRightItem>
        </FilterRow>
      </ConditionItem>
    );
  }

  render() {
    const { segment, index, hideDetailForm } = this.props;

    const { conditions } = segment;
    const hasCondition = conditions && conditions.length <= 1;

    if (conditions.length === 0 && index === 0) {
      return <PropertyCondition {...this.props} hideBackButton={true} />;
    }

    return (
      <ConditionGroup>
        {this.renderConjunction()}

        <Condition>
          {this.renderSubSegmentConjunction()}
          {conditions.map(condition => {
            return this.renderCondition(condition);
          })}
        </Condition>

        <ButtonWrapper hasCondition={hasCondition}>
          <Button
            size="small"
            btnStyle="simple"
            icon="add"
            onClick={this.addProperty}
          >
            Add property
          </Button>

          {!hideDetailForm ? (
            <Button
              size="small"
              btnStyle="simple"
              icon="add"
              onClick={this.addEvent}
            >
              Add event
            </Button>
          ) : null}
        </ButtonWrapper>

        <Tip text={'Delete'}>
          <Button
            btnStyle="simple"
            size="small"
            onClick={this.removeSegment}
            icon="times"
          />
        </Tip>
      </ConditionGroup>
    );
  }
}

export default ConditionsList;
