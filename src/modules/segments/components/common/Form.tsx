import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { __, Alert, generateRandomColorCode } from 'modules/common/utils';
import { FlexContent, FlexItem } from 'modules/layout/styles';
import {
  ISegment,
  ISegmentCondition,
  ISegmentConditionDoc,
  ISegmentDoc,
  ISegmentField,
  ISegmentWithConditionDoc
} from 'modules/segments/types';
import * as React from 'react';
import { AddConditionButton, Conditions } from '..';
import { ConditionWrapper, SegmentTitle, SegmentWrapper } from '../styles';

type Props = {
  contentType?: string;
  fields: ISegmentField[];
  save: (params: { doc: ISegmentWithConditionDoc }) => void;
  edit?: (params: { _id: string; doc: ISegmentWithConditionDoc }) => void;
  segment?: ISegment;
  headSegments: ISegment[];
  count: (segment: ISegmentDoc) => void;
  renderForm?: (
    {
      renderContent,
      saveButton
    }: {
      renderContent: React.ReactNode;
      saveButton: React.ReactNode;
    }
  ) => JSX.Element;
  afterSave?: () => void;
};

type State = {
  name: string;
  description: string;
  subOf: string;
  color: string;
  conditions: ISegmentCondition[];
  connector: string;
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const segment: ISegment = props.segment || {
      name: '',
      description: '',
      subOf: '',
      color: generateRandomColorCode(),
      conditions: [],
      connector: 'any'
    };

    segment.conditions = segment.conditions.map(
      (cond: ISegmentConditionDoc) => ({
        _id: Math.random().toString(),
        ...cond
      })
    );

    this.state = segment;
  }

  componentDidMount() {
    this.updateCount();
  }

  addCondition = (condition: ISegmentCondition) => {
    this.setState({
      conditions: [...this.state.conditions, condition]
    });
  };

  updateCount = () => {
    const { contentType } = this.props;

    const {
      name,
      description,
      subOf,
      color,
      conditions,
      connector
    } = this.state;

    const segment = {
      name,
      contentType,
      description,
      subOf,
      color,
      conditions,
      connector
    };

    this.props.count(segment);
  };

  changeCondition = (condition: ISegmentCondition) => {
    this.setState(
      {
        conditions: this.state.conditions.map(c =>
          c._id === condition._id ? condition : c
        )
      },
      () => {
        const { operator } = condition;

        if (operator && operator !== '') {
          this.updateCount();
        }
      }
    );
  };

  removeCondition = (id: string) => {
    const conditions = this.state.conditions.filter(c => c._id !== id);

    this.setState({ conditions }, () => this.updateCount());
  };

  handleChange = <T extends keyof State>(name: T, value: State[T]) => {
    this.setState({ [name]: value } as Pick<State, keyof State>);
  };

  save = (e: React.FormEvent) => {
    e.preventDefault();

    const { segment, save, edit, afterSave } = this.props;

    const {
      name,
      description,
      subOf,
      color,
      connector,
      conditions
    } = this.state;

    const updatedConditions: ISegmentConditionDoc[] = [];

    if (!name) {
      return Alert.error('Please enter a name');
    }

    for (const condition of conditions) {
      if (!condition.operator) {
        return Alert.error('Please enter a operator');
      }

      if (!['is', 'ins'].includes(condition.operator) && !condition.value) {
        return Alert.error('Please enter a value for operator');
      }
    }

    conditions.forEach((cond: ISegmentCondition) => {
      if (cond.operator) {
        const { _id, ...rest } = cond;
        updatedConditions.push(rest);
      }
    });

    const doc = {
      name,
      description,
      color,
      connector,
      conditions: updatedConditions,
      subOf: ''
    };

    if (subOf) {
      doc.subOf = subOf;
    }

    if (segment) {
      return edit && edit({ _id: segment._id, doc });
    }

    save({ doc });

    if (afterSave) {
      afterSave();
    }
  };

  renderConditions() {
    const { contentType, fields } = this.props;
    const { conditions, connector, subOf } = this.state;

    const connectorOnChange = (e: React.FormEvent) =>
      this.handleChange(
        'connector',
        (e.currentTarget as HTMLInputElement).value
      );

    return (
      <React.Fragment>
        <ConditionWrapper>
          <FormGroup>
            {__('Users who match')}
            <FormControl
              componentClass="select"
              value={connector}
              onChange={connectorOnChange}
            >
              <option value="any">{__('any')}</option>
              <option value="all">{__('all')}</option>
            </FormControl>
            {__('of the below conditions')}
          </FormGroup>

          <Conditions
            contentType={contentType}
            fields={fields}
            parentSegmentId={subOf}
            conditions={conditions}
            changeCondition={this.changeCondition}
            removeCondition={this.removeCondition}
          />
        </ConditionWrapper>

        <AddConditionButton fields={fields} addCondition={this.addCondition} />
      </React.Fragment>
    );
  }

  renderSubOf() {
    const onChange = (e: React.FormEvent) =>
      this.handleChange('subOf', (e.currentTarget as HTMLInputElement).value);

    return (
      <FormGroup>
        <ControlLabel>Sub segment of</ControlLabel>
        <FormControl
          componentClass="select"
          value={this.state.subOf || ''}
          onChange={onChange}
        >
          <option value="">[not selected]</option>
          {this.props.headSegments.map(segment => (
            <option value={segment._id} key={segment._id}>
              {segment.name}
            </option>
          ))}
        </FormControl>
      </FormGroup>
    );
  }

  renderForm() {
    const { renderForm } = this.props;
    const { name, description, color } = this.state;

    const nameOnChange = (e: React.FormEvent) =>
      this.handleChange('name', (e.currentTarget as HTMLInputElement).value);

    const descOnChange = (e: React.FormEvent) =>
      this.handleChange(
        'description',
        (e.currentTarget as HTMLInputElement).value
      );

    const colorOnChange = (e: React.FormEvent) =>
      this.handleChange('color', (e.currentTarget as HTMLInputElement).value);

    return (
      <FlexContent>
        <FlexItem count={4}>
          <form onSubmit={this.save}>
            <FormGroup>
              <ControlLabel required={true}>Name</ControlLabel>
              <FormControl
                required={true}
                value={name}
                onChange={nameOnChange}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Description</ControlLabel>
              <FormControl value={description} onChange={descOnChange} />
            </FormGroup>
            {this.renderSubOf()}
            <FormGroup>
              <ControlLabel>Color</ControlLabel>
              <FormControl
                type="color"
                value={color}
                onChange={colorOnChange}
              />
            </FormGroup>
            {!renderForm && this.renderSaveButton()}
          </form>
        </FlexItem>
        <FlexItem count={2} />
      </FlexContent>
    );
  }

  renderContent = () => {
    return (
      <SegmentWrapper>
        <SegmentTitle>{__('Filters')}</SegmentTitle>
        {this.renderConditions()}
        <hr />
        {this.renderForm()}
      </SegmentWrapper>
    );
  };

  renderSaveButton = () => {
    return (
      <Button
        size="small"
        btnStyle="success"
        onClick={this.save}
        icon="checked-1"
      >
        Save
      </Button>
    );
  };

  render() {
    const { renderForm } = this.props;

    if (!renderForm) {
      return this.renderContent();
    }

    return renderForm({
      renderContent: this.renderContent(),
      saveButton: this.renderSaveButton()
    });
  }
}

export default Form;
