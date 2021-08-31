import { IBoard } from 'modules/boards/types';
import Button from 'modules/common/components/Button';
import EmptyContent from 'modules/common/components/empty/EmptyContent';
import FormControl from 'modules/common/components/form/Control';
import CommonForm from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import Icon from 'modules/common/components/Icon';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __, generateRandomColorCode } from 'modules/common/utils';
import { FlexContent, FlexItem } from 'modules/layout/styles';
import {
  IConditionFilter,
  IEvent,
  IField,
  ISegment,
  ISegmentCondition,
  ISegmentWithConditionDoc
} from 'modules/segments/types';
import { isBoardKind } from 'modules/segments/utils';
import { EMPTY_NEW_SEGMENT_CONTENT } from 'modules/settings/constants';
import { ColorPick, ColorPicker } from 'modules/settings/styles';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import TwitterPicker from 'react-color/lib/Twitter';
import { Link } from 'react-router-dom';
import Select from 'react-select-plus';
import { FilterBox, SegmentTitle, SegmentWrapper } from '../styles';
import AddConditionButton from './AddConditionButton';
import EventCondition from './EventCondition';
import PropertyCondition from './PropertyCondition';

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
  previewCount?: (args: {
    conditions: ISegmentCondition[];
    subOf?: string;
    boardId?: string;
    pipelineId?: string;
  }) => void;
  isModal?: boolean;
  isAutomation?: boolean;
};

type State = {
  _id?: string;
  name: string;
  description: string;
  subOf: string;
  color: string;
  conditions: ISegmentCondition[];
  boardId?: string;
  pipelineId?: string;
  conditionsConjunction?: string;
  isCreate?: boolean;
};

class SegmentForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const segment: ISegment = props.segment || {
      name: '',
      description: '',
      subOf: '',
      color: generateRandomColorCode(),
      conditions: [],
      conditionsConjunction: ''
    };

    segment.conditions = segment.conditions.map((cond: ISegmentCondition) => ({
      key: Math.random().toString(),
      ...cond
    }));

    this.state = segment;
  }

  componentDidMount() {
    const { previewCount } = this.props;
    const { conditions, subOf, boardId, pipelineId } = this.state;

    if (previewCount) {
      previewCount({ conditions, subOf, boardId, pipelineId });
    }
  }

  addCondition = (condition: ISegmentCondition) => {
    this.setState({
      conditions: [...this.state.conditions, condition]
    });
  };

  changeEventCondition = (args: {
    key: string;
    name: string;
    attributeFilters: IConditionFilter[];
    occurence: string;
    occurenceValue: number;
  }) => {
    const condition = {
      type: 'event',
      key: args.key,
      eventName: args.name,
      eventOccurence: args.occurence,
      eventOccurenceValue: args.occurenceValue,
      eventAttributeFilters: (args.attributeFilters || []).map(filter => {
        const { key, ...rest } = filter;

        return rest;
      })
    };

    this.setState({
      conditions: this.state.conditions.map(c =>
        c.key === condition.key ? condition : c
      )
    });
  };

  changePropertyCondition = (args: {
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

    this.setState({
      conditions: this.state.conditions.map(c =>
        c.key === condition.key ? condition : c
      )
    });
  };

  removeCondition = (key: string) => {
    const conditions = this.state.conditions.filter(c => c.key !== key);

    this.setState({ conditions });
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

  generateDoc = (values: {
    _id?: string;
    name: string;
    subOf: string;
    color: string;
    conditionsConjunction: string;
  }) => {
    const { contentType } = this.props;
    const { color, conditions, boardId, pipelineId, _id, name } = this.state;
    const finalValues = values;

    const updatedConditions: ISegmentCondition[] = [];

    if (_id) {
      finalValues._id = _id;
    }

    if (!finalValues.name) {
      finalValues.name = name;
    }

    conditions.forEach((cond: ISegmentCondition) => {
      const { key, ...rest } = cond;
      updatedConditions.push(rest);
    });

    return {
      ...finalValues,
      color,
      boardId,
      pipelineId,
      contentType,
      conditions: updatedConditions
    };
  };

  generatePipelineOptions = () => {
    const { boardId } = this.state;

    const board = (this.props.boards || []).find(b => b._id === boardId);

    if (!board) {
      return [];
    }

    return (board.pipelines || []).map(p => ({
      value: p._id,
      label: p.name
    }));
  };

  renderParent() {
    const { contentType } = this.props;
    const { subOf } = this.state;

    if (!subOf) {
      return null;
    }

    return (
      <Link to={`/segments/edit/${contentType}/${subOf}`} target="_blank">
        <Icon icon="arrows-up-right" />
        {__('See parent segment conditions')}
      </Link>
    );
  }

  renderCondition(condition: ISegmentCondition) {
    const { fields, events } = this.props;
    if (
      condition.type === 'property' &&
      condition.propertyType &&
      condition.propertyType === 'form_submission'
    ) {
      return (
        <PropertyCondition
          fields={fields}
          key={condition.key}
          conditionKey={condition.key || ''}
          name={condition.propertyName || ''}
          operator={condition.propertyOperator || ''}
          value={condition.propertyValue || ''}
          onChange={this.changePropertyCondition}
          onRemove={this.removeCondition}
        />
      );
    }

    if (condition.type === 'property') {
      return (
        <PropertyCondition
          fields={fields}
          key={condition.key}
          conditionKey={condition.key || ''}
          name={condition.propertyName || ''}
          operator={condition.propertyOperator || ''}
          value={condition.propertyValue || ''}
          onChange={this.changePropertyCondition}
          onRemove={this.removeCondition}
        />
      );
    }

    return (
      <EventCondition
        events={events}
        key={condition.key}
        conditionKey={condition.key || ''}
        name={condition.eventName || ''}
        occurence={condition.eventOccurence || ''}
        occurenceValue={condition.eventOccurenceValue || 0}
        attributeFilters={condition.eventAttributeFilters || []}
        onChange={this.changeEventCondition}
        onRemove={this.removeCondition}
      />
    );
  }

  renderConditions() {
    const { conditions } = this.state;
    const { isModal } = this.props;

    if (conditions.length === 0 && !isModal) {
      return (
        <EmptyContent
          content={EMPTY_NEW_SEGMENT_CONTENT}
          maxItemWidth="200px"
        />
      );
    }

    return (
      <>
        <SegmentTitle>
          {__('Filters')} {this.renderParent()}
        </SegmentTitle>
        {conditions.map(condition => this.renderCondition(condition))}
      </>
    );
  }

  renderSubOf(formProps: IFormProps) {
    const onChange = (e: React.FormEvent) =>
      this.handleChange('subOf', (e.currentTarget as HTMLInputElement).value);

    return (
      <FormGroup>
        <ControlLabel>Sub segment of</ControlLabel>
        <FormControl
          {...formProps}
          name="subOf"
          componentClass="select"
          value={this.state.subOf || ''}
          onChange={onChange}
        >
          <option value="">{__('Not selected')}</option>
          {this.props.headSegments.map(segment => (
            <option value={segment._id} key={segment._id}>
              {segment.name}
            </option>
          ))}
        </FormControl>
      </FormGroup>
    );
  }

  renderFilters = () => {
    return (
      <FilterBox>
        {this.renderConditions()}
        <AddConditionButton
          isModal={this.props.isModal}
          contentType={this.props.contentType || ''}
          addCondition={this.addCondition}
        />
      </FilterBox>
    );
  };

  renderBoardFields = () => {
    const { contentType, boards = [] } = this.props;
    const { boardId, pipelineId } = this.state;

    if (!isBoardKind(contentType)) {
      return null;
    }

    return (
      <FlexContent>
        <FlexItem>
          <FormGroup>
            <ControlLabel>Board</ControlLabel>

            <Select
              value={boardId}
              options={boards.map(b => ({ value: b._id, label: b.name }))}
              onChange={this.onChangeBoardItem.bind(this, 'boardId')}
            />
          </FormGroup>
        </FlexItem>

        <FlexItem>
          <FormGroup>
            <ControlLabel>Pipelines</ControlLabel>

            <Select
              value={pipelineId}
              onChange={this.onChangeBoardItem.bind(this, 'pipelineId')}
              options={this.generatePipelineOptions()}
            />
          </FormGroup>
        </FlexItem>
      </FlexContent>
    );
  };

  renderSelect = () => {
    const onChange = e => {
      const selectedSegment =
        this.props.segments.find(s => s._id === e.value) || {};

      this.setState(selectedSegment);
    };

    if (!this.props.isAutomation) {
      return null;
    }

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Segment</ControlLabel>

          <Select
            placeholder={__('Choose segment')}
            options={this.props.segments.map(s => ({
              label: s.name,
              value: s._id
            }))}
            value={this.state._id}
            onChange={onChange}
            multi={false}
          />

          <p> Or crete new</p>
        </FormGroup>
      </>
    );
  };

  renderForm = (formProps: IFormProps) => {
    const {
      isModal,
      segment,
      contentType,
      renderButton,
      afterSave,
      previewCount,
      closeModal
    } = this.props;

    const { values, isSubmitted } = formProps;
    const {
      name,
      description,
      color,
      conditions,
      subOf,
      boardId,
      pipelineId
    } = this.state;

    const nameOnChange = (e: React.FormEvent) =>
      this.handleChange('name', (e.currentTarget as HTMLInputElement).value);

    const descOnChange = (e: React.FormEvent) =>
      this.handleChange(
        'description',
        (e.currentTarget as HTMLInputElement).value
      );

    const colorOnChange = e => this.handleChange('color', e.hex);

    const conjunctionOnChange = (e: React.FormEvent) =>
      this.handleChange(
        'conditionsConjunction',
        (e.currentTarget as HTMLInputElement).value
      );

    const onPreviewCount = () => {
      if (previewCount) {
        previewCount({ conditions, subOf, boardId, pipelineId });
      }
    };

    const popoverTop = (
      <Popover id="color-picker">
        <TwitterPicker triangle="hide" color={color} onChange={colorOnChange} />
      </Popover>
    );

    return (
      <>
        <FlexContent>
          <FlexItem count={5}>
            <FormGroup>
              <ControlLabel required={true}>Segment Name</ControlLabel>
              <FormControl
                {...formProps}
                name="name"
                value={name}
                onChange={nameOnChange}
                required={true}
                autoFocus={true}
              />
            </FormGroup>
          </FlexItem>
          <FlexItem count={3} hasSpace={true}>
            {this.renderSubOf({ ...formProps })}
          </FlexItem>
        </FlexContent>

        <FlexContent>
          <FlexItem count={7}>
            <FormGroup>
              <ControlLabel>Description</ControlLabel>
              <FormControl
                {...formProps}
                name="description"
                value={description}
                onChange={descOnChange}
              />
            </FormGroup>
          </FlexItem>
          <FlexItem count={3} hasSpace={true}>
            <FormGroup>
              <ControlLabel>Conjunction</ControlLabel>
              <FormControl
                {...formProps}
                name="conditionsConjunction"
                componentClass="select"
                value={this.state.conditionsConjunction || ''}
                onChange={conjunctionOnChange}
              >
                <option value="and">{__('And')}</option>
                <option value="or">{__('Or')}</option>
              </FormControl>
            </FormGroup>
          </FlexItem>
          <FlexItem hasSpace={true}>
            <FormGroup>
              <ControlLabel>Color</ControlLabel>
              <div id="segment-color">
                <OverlayTrigger
                  trigger="click"
                  rootClose={true}
                  placement="bottom"
                  overlay={popoverTop}
                >
                  <ColorPick>
                    <ColorPicker style={{ backgroundColor: color }} />
                  </ColorPick>
                </OverlayTrigger>
              </div>
            </FormGroup>
          </FlexItem>
        </FlexContent>

        {this.renderBoardFields()}
        {this.renderFilters()}

        <ModalFooter id="button-group">
          <Button.Group>
            {isModal ? (
              <Button
                btnStyle="simple"
                type="button"
                icon="times-circle"
                onClick={closeModal}
              >
                Cancel
              </Button>
            ) : (
              <>
                <Link to={`/segments/${contentType}`}>
                  <Button btnStyle="simple" icon="times-circle">
                    Cancel
                  </Button>
                </Link>

                {previewCount && (
                  <Button
                    id="segment-show-count"
                    icon="crosshairs"
                    onClick={onPreviewCount}
                  >
                    Show count
                  </Button>
                )}
              </>
            )}

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
        {this.renderSelect()}
        <CommonForm renderContent={this.renderForm} />
      </SegmentWrapper>
    );
  }
}

export default SegmentForm;
