import {
  ControlLabel,
  Form as CommonForm,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __, Alert, generateRandomColorCode } from 'modules/common/utils';
import { FlexContent, FlexItem } from 'modules/layout/styles';
import {
  ISegment,
  ISegmentCondition,
  ISegmentConditionDoc,
  ISegmentDoc,
  ISegmentField
} from 'modules/segments/types';
import * as React from 'react';
import { AddConditionButton, Conditions } from '..';
import { ConditionWrapper, SegmentTitle, SegmentWrapper } from '../styles';

type Props = {
  contentType?: string;
  fields: ISegmentField[];
  segment?: ISegment;
  headSegments: ISegment[];
  count: (segment: ISegmentDoc) => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
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

  generateDoc = (values: {
    _id?: string;
    name: string;
    description: string;
    subOf: string;
    color: string;
  }) => {
    const { segment, contentType } = this.props;
    const { conditions, connector } = this.state;
    const finalValues = values;

    const updatedConditions: ISegmentConditionDoc[] = [];

    for (const condition of conditions) {
      if (!condition.operator) {
        return Alert.error('Please enter a operator');
      }

      if (!['is', 'ins'].includes(condition.operator) && !condition.value) {
        return Alert.error('Please enter a value for operator');
      }
    }

    if (segment) {
      finalValues._id = segment._id;
    }

    conditions.forEach((cond: ISegmentCondition) => {
      if (cond.operator) {
        const { _id, ...rest } = cond;
        updatedConditions.push(rest);
      }
    });

    return {
      _id: finalValues._id,
      name: finalValues.name,
      description: finalValues.description,
      color: finalValues.color,
      subOf: finalValues.subOf,
      connector,
      contentType,
      conditions: updatedConditions
    };
  };

  renderConditions(formProps: IFormProps) {
    const { contentType, fields, segment } = this.props;
    const object = segment || ({} as ISegment);
    const { conditions, subOf } = this.state;

    return (
      <React.Fragment>
        <ConditionWrapper>
          <FormGroup>
            {__('Users who match')}
            <FormControl
              {...formProps}
              name="connector"
              componentClass="select"
              value={object.connector || 'any'}
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

  renderSubOf(subOf: string, formProps: IFormProps) {
    const onChange = (e: React.FormEvent) =>
      this.handleChange('subOf', (e.currentTarget as HTMLInputElement).value);

    return (
      <FormGroup>
        <ControlLabel>Sub segment of</ControlLabel>
        <FormControl
          {...formProps}
          name="subOf"
          componentClass="select"
          defaultValue={subOf}
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

  renderForm(formProps: IFormProps) {
    const { renderForm, segment } = this.props;
    const object = segment || ({} as ISegment);

    return (
      <FlexContent>
        <FlexItem count={4}>
          <FormGroup>
            <ControlLabel required={true}>Name</ControlLabel>
            <FormControl
              {...formProps}
              name="name"
              required={true}
              defaultValue={object.name}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Description</ControlLabel>
            <FormControl
              {...formProps}
              name="description"
              defaultValue={object.description}
            />
          </FormGroup>
          {this.renderSubOf(object.subOf, { ...formProps })}
          <FormGroup>
            <ControlLabel>Color</ControlLabel>
            <FormControl
              {...formProps}
              name="color"
              type="color"
              defaultValue={object.color}
            />
          </FormGroup>
          {!renderForm && this.renderSaveButton({ ...formProps })}
        </FlexItem>
        <FlexItem count={2} />
      </FlexContent>
    );
  }

  renderContent = (formProps: IFormProps) => {
    return (
      <SegmentWrapper>
        <SegmentTitle>{__('Filters')}</SegmentTitle>
        {this.renderConditions({ ...formProps })}
        <hr />
        {this.renderForm({ ...formProps })}
      </SegmentWrapper>
    );
  };

  renderSaveButton = (formProps: IFormProps) => {
    const { renderButton, segment, afterSave } = this.props;
    const { values, isSubmitted } = formProps;

    return renderButton({
      name: 'segment',
      size: 'small',
      values: this.generateDoc(values),
      isSubmitted,
      object: segment,
      callback: afterSave
    });
  };

  renderFormContent = (formProps: IFormProps) => {
    const { renderForm } = this.props;

    if (!renderForm) {
      return this.renderContent({ ...formProps });
    }

    return renderForm({
      renderContent: this.renderContent({ ...formProps }),
      saveButton: this.renderSaveButton({ ...formProps })
    });
  };

  render() {
    return <CommonForm renderContent={this.renderFormContent} />;
  }
}

export default Form;
