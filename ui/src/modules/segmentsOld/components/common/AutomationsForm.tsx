import { IBoard } from 'modules/boards/types';
import Button from 'modules/common/components/Button';
import CommonForm from 'modules/common/components/form/Form';
import { CenterContent, ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';

import {
  IEvent,
  IField,
  ISegment,
  ISegmentCondition,
  ISegmentWithConditionDoc,
  ISubSegment
} from 'modules/segments/types';
import React from 'react';
import {
  AddSegmentButton,
  ConjunctionButtons,
  FilterBox,
  SegmentTitle,
  SegmentWrapper
} from '../styles';
import AddConditionButton from './AddConditionButton';
import PropertyCondition from './PropertyCondition';

type SegmentMap = {
  key: string;
  contentType: string;
  conditions: ISegmentCondition[];
  conditionsConjunction: string;
};

type Props = {
  contentType?: string;
  fields: IField[];
  events: IEvent[];
  boards?: IBoard[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  edit?: (params: { _id: string; doc: ISegmentWithConditionDoc }) => void;
  segment?: ISegment;
  headSegments: ISegment[];
  segments: ISegment[];
  isForm?: boolean;
  closeModal?: () => void;
  afterSave?: () => void;
  fetchFields?: (pipelineId?: string) => void;

  isModal?: boolean;
};

type State = {
  conditionsConjunction?: string;
  segments: SegmentMap[];
};

class SegmentFormAutomations extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const segment: ISegment = props.segment || {
      conditionsConjunction: 'and'
    };

    const segments = segment.getConditionSegments
      ? segment.getConditionSegments.map((item: ISegment) => ({
          _id: item._id,
          key: Math.random().toString(),
          contentType: item.contentType || 'customer',
          conditionsConjunction: item.conditionsConjunction,
          conditions: item.conditions.map((cond: ISegmentCondition) => ({
            key: Math.random().toString(),
            ...cond
          }))
        }))
      : [
          {
            key: Math.random().toString(),
            contentType: props.contentType || 'customer',
            conditions: [
              {
                key: Math.random().toString(),
                type: 'property'
              }
            ],
            conditionsConjunction: 'and'
          }
        ];

    this.state = {
      segments,
      conditionsConjunction: segment.conditionsConjunction
    };
  }

  addCondition = (condition: ISegmentCondition, segmentKey?: string) => {
    const segments = [...this.state.segments];

    const foundedSegment = segments.find(segment => segment.key === segmentKey);
    const foundedSegmentIndex = segments.findIndex(
      segment => segment.key === segmentKey
    );

    if (foundedSegment) {
      foundedSegment.conditions = [...foundedSegment.conditions, condition];

      segments[foundedSegmentIndex] = foundedSegment;

      this.setState({ segments });
    }
  };

  changePropertyCondition = (args: {
    segmentKey?: string;
    key: string;
    name: string;
    operator: string;
    value: string;
  }) => {
    const condition = {
      type: 'property',
      key: args.key,
      propertyName: args.name,
      propertyOperator: args.operator,
      propertyValue: args.value
    };

    const segments = [...this.state.segments];

    const foundedSegment = segments.find(
      segment => segment.key === args.segmentKey
    );
    const foundedSegmentIndex = segments.findIndex(
      segment => segment.key === args.segmentKey
    );

    if (foundedSegment) {
      foundedSegment.conditions = foundedSegment.conditions.map(c => {
        if (c.key === condition.key) {
          return condition;
        } else {
          return c;
        }
      });

      segments[foundedSegmentIndex] = foundedSegment;

      this.setState({ segments });
    }
  };

  removeCondition = (key: string, segmentKey?: string) => {
    const segments = [...this.state.segments];

    const foundedSegment = segments.find(segment => segment.key === segmentKey);
    const foundedSegmentIndex = segments.findIndex(
      segment => segment.key === segmentKey
    );

    if (foundedSegment) {
      const foundedConIndex = foundedSegment.conditions.findIndex(
        condition => condition.key === key
      );

      if (foundedConIndex > -1) {
        foundedSegment.conditions.splice(foundedConIndex, 1);
      }

      segments[foundedSegmentIndex] = foundedSegment;

      this.setState({ segments });
    }
  };

  handleChange = <T extends keyof State>(name: T, value: State[T]) => {
    this.setState(({ [name]: value } as unknown) as Pick<State, keyof State>);
  };

  onChangeBoardItem = (key, e) => {
    const { fetchFields } = this.props;
    const value = e ? e.value : '';

    this.setState({ [key]: value } as any, () => {
      if (fetchFields && key === 'pipelineId') {
        fetchFields(value);
      }
    });
  };

  generateDoc = (values: { _id?: string; conditionsConjunction: string }) => {
    const { contentType, segment } = this.props;
    const { segments, conditionsConjunction } = this.state;
    const finalValues = values;

    const conditionSegments: ISubSegment[] = [];

    if (segment && segment._id) {
      finalValues._id = segment._id;
    }

    segments.forEach((cond: SegmentMap) => {
      const { key, ...item } = cond;

      conditionSegments.push(item);
    });

    return {
      ...finalValues,
      conditionsConjunction,
      contentType,
      conditionSegments
    };
  };

  renderCondition(
    segmentKey: string,
    condition: ISegmentCondition,
    index: number,
    conjunction: string
  ) {
    const { fields } = this.props;

    return (
      <PropertyCondition
        fields={fields}
        key={condition.key}
        conditionKey={condition.key || ''}
        segmentKey={segmentKey}
        index={index}
        name={condition.propertyName || ''}
        operator={condition.propertyOperator || ''}
        value={condition.propertyValue || ''}
        onChange={this.changePropertyCondition}
        onRemove={this.removeCondition}
        changeConjunction={this.changeConjunction}
        conjunction={conjunction}
      />
    );
  }

  renderConditions(segmentKey) {
    const { segments } = this.state;

    const foundedSegment = segments.find(segment => segment.key === segmentKey);

    if (foundedSegment) {
      return (
        <>
          <SegmentTitle>{__('Filters')}</SegmentTitle>
          {foundedSegment.conditions.map((condition, index) =>
            this.renderCondition(
              segmentKey,
              condition,
              index,
              foundedSegment.conditionsConjunction
            )
          )}
        </>
      );
    }

    return <></>;
  }

  renderFilters = segmentKey => {
    return (
      <FilterBox>
        {this.renderConditions(segmentKey)}
        <AddConditionButton
          segmentKey={segmentKey}
          isModal={this.props.isModal}
          contentType={this.props.contentType || ''}
          addCondition={this.addCondition}
        />
      </FilterBox>
    );
  };

  addSegment = () => {
    const { contentType } = this.props;

    this.setState({
      segments: [
        ...this.state.segments,
        {
          key: Math.random().toString(),
          conditions: [{ key: Math.random().toString(), type: 'property' }],
          conditionsConjunction: 'and',
          contentType: contentType || 'customer'
        }
      ]
    });
  };

  changeConjunction = (segmentKey: string, conjunction: string) => {
    const segments = [...this.state.segments];

    const foundedSegment = segments.find(segment => segment.key === segmentKey);
    const foundedSegmentIndex = segments.findIndex(
      segment => segment.key === segmentKey
    );

    if (foundedSegment) {
      foundedSegment.conditionsConjunction = conjunction;

      segments[foundedSegmentIndex] = foundedSegment;

      this.setState({ segments });
    }
  };

  renderConjunction = (segmentKey: string, index: number) => {
    const { conditionsConjunction } = this.state;

    if (index === 0) {
      return <></>;
    }

    const onClickAnd = () => {
      this.setState({ conditionsConjunction: 'and' });
    };

    const onClickOr = () => {
      this.setState({ conditionsConjunction: 'or' });
    };

    let btnStyleAnd = 'success';
    let btnSyleOr = 'simple';

    if (conditionsConjunction === 'or') {
      btnStyleAnd = 'simple';
      btnSyleOr = 'success';
    }

    return (
      <CenterContent>
        <ConjunctionButtons isGeneral={true}>
          <Button.Group hasGap={false}>
            <Button onClick={onClickAnd} btnStyle={btnStyleAnd}>
              {__('And')}
            </Button>
            <Button onClick={onClickOr} btnStyle={btnSyleOr}>
              {__('Or')}
            </Button>
          </Button.Group>
        </ConjunctionButtons>
      </CenterContent>
    );
  };

  renderContent = () => {
    const { segments } = this.state;

    return segments.map((segment, index) => {
      return (
        <>
          {this.renderConjunction(segment.key, index)}
          {this.renderFilters(segment.key)}
        </>
      );
    });
  };

  renderForm = (formProps: IFormProps) => {
    const { segment, renderButton, afterSave, closeModal } = this.props;

    const { values, isSubmitted } = formProps;

    return (
      <>
        {this.renderContent()}

        <CenterContent>
          <AddSegmentButton>
            <Button onClick={this.addSegment} btnStyle="simple">
              Add new segment group
            </Button>
          </AddSegmentButton>
        </CenterContent>

        <ModalFooter id="button-group">
          <Button.Group>
            <Button
              btnStyle="simple"
              type="button"
              icon="times-circle"
              onClick={closeModal}
            >
              Cancel
            </Button>

            {renderButton({
              name: 'segment',
              values: this.generateDoc(values),
              callback: closeModal || afterSave,
              isSubmitted,
              object: segment
            })}
          </Button.Group>
        </ModalFooter>
      </>
    );
  };

  render() {
    return (
      <SegmentWrapper>
        <CommonForm renderContent={this.renderForm} />
      </SegmentWrapper>
    );
  }
}

export default SegmentFormAutomations;
