import Button from 'modules/common/components/Button';
import { FlexRightItem } from 'modules/layout/styles';
import PropertyCondition from 'modules/segments/containers/form/PropertyCondition';
import { IField, ISegmentCondition, ISegmentMap } from 'modules/segments/types';
import { CenterContent } from 'erxes-ui/lib/styles/main';
import { __ } from 'modules/common/utils';
import React from 'react';
import {
  Condition,
  ConditionItem,
  ConditionRemove,
  ConjunctionButtons,
  ConjunctionButtonsVertical,
  FilterRow,
  SegmentBackIcon
} from '../styles';
import ConditionDetail from '../../containers/preview/ConditionDetail';
import PropertyForm from '../form/PropertyForm';
import Icon from 'modules/common/components/Icon';

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
  removeCondition: (key: string, segmentKey?: string) => void;
  removeSegment: (segmentKey: string) => void;
  onClickBackToList: () => void;
  changeSubSegmentConjunction: (
    segmentKey: string,
    conjunction: string
  ) => void;
  onClickField?: (field, condition) => void;
  chosenField?: IField;
  chosenCondition?: ISegmentCondition;
  isAutomation: boolean;
  boardId: string;
  pipelineId: string;
};

type State = {};

class ConditionsList extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = { chosenField: undefined, chosenCondition: undefined };
  }

  onClickField = (field, condition) => {
    if (this.props.onClickField) {
      return this.props.onClickField(field, condition);
    }

    return;
  };

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

    return (
      <ConditionItem useMargin={useMargin} key={Math.random()}>
        <FilterRow>
          <ConditionDetail
            onClickField={this.onClickField}
            condition={condition}
            pipelineId={segment.pipelineId}
            segmentId={segment._id}
          />

          <FlexRightItem>
            <Button
              className="round"
              size="small"
              btnStyle="simple"
              icon="times"
              onClick={this.removeCondition.bind(this, condition)}
            />
          </FlexRightItem>
        </FilterRow>
      </ConditionItem>
    );
  }

  render() {
    const {
      segment,
      index,
      addCondition,
      chosenField,
      chosenCondition,
      onClickBackToList
    } = this.props;

    const { conditions } = segment;

    if (conditions.length === 0 && index === 0) {
      return <PropertyCondition {...this.props} hideBackButton={true} />;
    }

    if (chosenField && chosenCondition) {
      return (
        <>
          <SegmentBackIcon onClick={onClickBackToList}>
            <Icon icon="angle-left" size={20} /> back
          </SegmentBackIcon>
          <PropertyForm
            field={chosenField}
            condition={chosenCondition}
            segment={segment}
            addCondition={addCondition}
          />
        </>
      );
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
        <Condition>
          <div style={{ position: 'relative' }}>
            {this.renderSubSegmentConjunction()}
            {conditions.map(condition => {
              return this.renderCondition(condition);
            })}
          </div>

          <Button
            size="small"
            btnStyle="simple"
            icon="plus"
            onClick={this.addProperty}
          >
            Add property
          </Button>
        </Condition>
      </div>
    );
  }
}

export default ConditionsList;
