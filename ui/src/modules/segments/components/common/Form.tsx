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
import { EMPTY_NEW_SEGMENT_CONTENT } from 'modules/settings/constants';
import { ColorPick, ColorPicker, ExpandWrapper } from 'modules/settings/styles';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import TwitterPicker from 'react-color/lib/Twitter';
import { Link } from 'react-router-dom';
import { FilterBox, SegmentTitle, SegmentWrapper } from '../styles';
import AddConditionButton from './AddConditionButton';
import EventCondition from './EventCondition';
import PropertyCondition from './PropertyCondition';

type Props = {
  contentType?: string;
  fields: IField[];
  events: IEvent[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  edit?: (params: { _id: string; doc: ISegmentWithConditionDoc }) => void;
  segment?: ISegment;
  headSegments: ISegment[];
  isForm?: boolean;
  afterSave?: () => void;
  previewCount?: (conditions: ISegmentCondition[], subOf?: string) => void;
};

type State = {
  name: string;
  description: string;
  subOf: string;
  color: string;
  conditions: ISegmentCondition[];
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const segment: ISegment = props.segment || {
      name: '',
      description: '',
      subOf: '',
      color: generateRandomColorCode(),
      conditions: []
    };

    segment.conditions = segment.conditions.map((cond: ISegmentCondition) => ({
      key: Math.random().toString(),
      ...cond
    }));

    this.state = segment;
  }

  componentDidMount() {
    const { previewCount } = this.props;
    const { conditions, subOf } = this.state;
    
    if (previewCount) {
      previewCount(conditions, subOf);
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

  generateDoc = (values: {
    _id?: string;
    name: string;
    subOf: string;
    color: string;
  }) => {
    const { segment, contentType } = this.props;
    const { color, conditions } = this.state;
    const finalValues = values;

    const updatedConditions: ISegmentCondition[] = [];

    if (segment) {
      finalValues._id = segment._id;
    }

    conditions.forEach((cond: ISegmentCondition) => {
      const { key, ...rest } = cond;
      updatedConditions.push(rest);
    });

    return {
      ...finalValues,
      color,
      contentType,
      conditions: updatedConditions
    };
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

    if (conditions.length === 0) {
      return (
        <EmptyContent content={EMPTY_NEW_SEGMENT_CONTENT} />
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
        <AddConditionButton addCondition={this.addCondition} />
      </FilterBox>
    );
  };

  renderForm = (formProps: IFormProps) => {
    const {
      isForm,
      segment,
      contentType,
      renderButton,
      afterSave,
      previewCount
    } = this.props;

    const { values, isSubmitted } = formProps;
    const { name, description, color, conditions, subOf } = this.state;

    const nameOnChange = (e: React.FormEvent) =>
      this.handleChange('name', (e.currentTarget as HTMLInputElement).value);

    const descOnChange = (e: React.FormEvent) =>
      this.handleChange(
        'description',
        (e.currentTarget as HTMLInputElement).value
      );

    const colorOnChange = e => this.handleChange('color', e.hex);

    const onPreviewCount = () => {
      if (previewCount) {
        previewCount(conditions, subOf);
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
          <ExpandWrapper>
            <FormGroup>
              <ControlLabel>Description</ControlLabel>
              <FormControl
                {...formProps}
                name="description"
                value={description}
                onChange={descOnChange}
              />
            </FormGroup>
          </ExpandWrapper>

          <FormGroup>
            <ControlLabel>Color</ControlLabel>
            <div>
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
        </FlexContent>

        {this.renderFilters()}

        <ModalFooter>
          <Button.Group>
            {isForm && (
              <Link to={`/segments/${contentType}`}>
                <Button uppercase={false} btnStyle="simple" icon="times-circle">
                  Cancel
                </Button>
              </Link>
            )}

            {previewCount && (
              <Button
                uppercase={false}
                icon="crosshairs"
                onClick={onPreviewCount}
              >
                Show count
              </Button>
            )}

            {renderButton({
              name: 'segment',
              values: this.generateDoc(values),
              callback: afterSave,
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

export default Form;
