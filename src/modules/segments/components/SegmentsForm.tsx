import {
  Button,
  ButtonMutate,
  ControlLabel,
  Form,
  FormControl,
  FormGroup,
  Icon,
  Spinner
} from 'modules/common/components';
import { IFormProps } from 'modules/common/types';
import { __, generateRandomColorCode } from 'modules/common/utils';
import { Sidebar, Wrapper } from 'modules/layout/components';
import { FlexContent, FlexItem } from 'modules/layout/styles';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { mutations } from '../graphql';
import {
  ISegment,
  ISegmentCondition,
  ISegmentConditionDoc,
  ISegmentDoc,
  ISegmentField
} from '../types';
import { AddConditionButton, Conditions } from './';
import {
  ConditionWrapper,
  ResultCount,
  SegmentResult,
  SegmentTitle,
  SegmentWrapper
} from './styles';

type SegmentDoc = {
  name: string;
  description: string;
  subOf: string;
  color: string;
  connector: string;
  conditions: ISegmentConditionDoc[];
};

type Props = {
  contentType: string;
  fields: ISegmentField[];
  create: (params: { doc: SegmentDoc }) => void;
  edit: (params: { _id: string; doc: SegmentDoc }) => void;
  segment: ISegment;
  headSegments: ISegment[];
  count: (segment: ISegmentDoc) => void;
  counterLoading: boolean;
  refetchQueries: any;
  total: {
    byFakeSegment: number;
  };
};

type State = {
  name: string;
  description: string;
  subOf: string;
  color: string;
  conditions: ISegmentCondition[];
  connector: string;
  isSubmitted?: boolean;
};

class SegmentsForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const segment: ISegment = props.segment || {
      name: '',
      description: '',
      subOf: '',
      color: generateRandomColorCode(),
      conditions: [],
      connector: 'any',
      brandId: ''
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

  save = () => {
    this.setState({ isSubmitted: true });
  };

  generateDoc = (values: {
    _id?: string;
    name: string;
    description: string;
    subOf: string;
    color: string;
  }) => {
    const { segment } = this.props;
    const finalValues = values;

    if (segment) {
      finalValues._id = segment._id;
    }

    return {
      _id: finalValues._id,
      name: finalValues.name,
      description: finalValues.description,
      subOf: finalValues.subOf,
      color: finalValues.color
    };
  };

  getMutation = () => {
    if (this.props.segment) {
      return mutations.segmentsEdit;
    }

    return mutations.segmentsAdd;
  };

  a = (e: React.FormEvent) => {
    e.preventDefault();

    const { segment, create, edit } = this.props;

    const {
      name,
      description,
      subOf,
      color,
      connector,
      conditions
    } = this.state;

    const updatedConditions: ISegmentConditionDoc[] = [];

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
      return edit({ _id: segment._id, doc });
    }

    return create({ doc });
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
            {__('Users who match')}{' '}
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

  renderSubOf(formProps: IFormProps, subOf: string) {
    return (
      <FormGroup>
        <ControlLabel>Sub segment of</ControlLabel>
        <FormControl
          {...formProps}
          name="subOf"
          componentClass="select"
          defaultValue={subOf}
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
    const { segment } = this.props;
    const object = segment || ({} as ISegment);

    return (
      <FlexContent>
        <FlexItem count={4}>
          <FormGroup>
            <ControlLabel required={true}>Name</ControlLabel>
            <FormControl
              {...formProps}
              name="name"
              defaultValue={object.name}
              required={true}
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
          {this.renderSubOf({ ...formProps }, object.subOf)}
          <FormGroup>
            <ControlLabel>Color</ControlLabel>
            <FormControl
              {...formProps}
              name="color"
              type="color"
              defaultValue={object.color}
            />
          </FormGroup>
        </FlexItem>
        <FlexItem count={2} />
      </FlexContent>
    );
  }

  renderContent(formProps: IFormProps) {
    return (
      <SegmentWrapper>
        <SegmentTitle>{__('Filters')}</SegmentTitle>

        {this.renderConditions()}
        <hr />
        {this.renderForm({ ...formProps })}
      </SegmentWrapper>
    );
  }

  renderSidebar() {
    const { total, counterLoading } = this.props;

    return (
      <Sidebar full={true} wide={true}>
        <FlexContent>
          <SegmentResult>
            <ResultCount>
              <Icon icon="users" />{' '}
              {counterLoading ? (
                <Spinner objective={true} />
              ) : (
                total.byFakeSegment
              )}
            </ResultCount>
            {__('User(s) will recieve this message')}
          </SegmentResult>
        </FlexContent>
      </Sidebar>
    );
  }

  renderFooter(formProps: IFormProps) {
    const { contentType, segment, refetchQueries } = this.props;

    return (
      <Wrapper.ActionBar
        right={
          <Button.Group>
            <Link to={`/segments/${contentType}`}>
              <Button size="small" btnStyle="simple" icon="cancel-1">
                Cancel
              </Button>
            </Link>
            <ButtonMutate
              mutation={this.getMutation()}
              variables={this.generateDoc(formProps.values)}
              refetchQueries={refetchQueries}
              isSubmitted={this.state.isSubmitted}
              type="submit"
              icon="checked-1"
              successMessage={`You successfully ${
                segment ? 'updated' : 'added'
              } a segment.`}
            >
              {__('Save')}
            </ButtonMutate>
          </Button.Group>
        }
      />
    );
  }

  renderFormContent = (formProps: IFormProps) => {
    const { contentType, segment } = this.props;

    const title = segment ? __('Edit segment') : __('New segment');

    const breadcrumb = [
      { title: __('Segments'), link: `/segments/${contentType}` },
      { title }
    ];

    return (
      <Wrapper
        header={<Wrapper.Header title={title} breadcrumb={breadcrumb} />}
        content={this.renderContent({ ...formProps })}
        footer={this.renderFooter({ ...formProps })}
        rightSidebar={this.renderSidebar()}
      />
    );
  };

  render() {
    return <Form renderContent={this.renderFormContent} onSubmit={this.save} />;
  }
}

export default SegmentsForm;
