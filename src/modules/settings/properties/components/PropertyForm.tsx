import {
  Button,
  ButtonMutate,
  ControlLabel,
  Form,
  FormControl,
  FormGroup,
  ModalTrigger,
  ModifiableList
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import { __, Alert } from 'modules/common/utils';
import { Row } from 'modules/settings/integrations/styles';
import * as React from 'react';
import { IFormProps } from '../../../common/types';
import { PropertyGroupForm } from '../containers';
import { mutations } from '../graphql';
import { IField, IFieldGroup } from '../types';

type Props = {
  queryParams: any;
  field?: IField;
  groups: IFieldGroup[];
  refetchQueries: any;
  type: string;
  closeModal: () => void;
};

type State = {
  options: any[];
  type: string;
  hasOptions: boolean;
  add: boolean;
  isSubmitted: boolean;
};

class PropertyForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    let doc = {
      options: [],
      type: '',
      hasOptions: false
    };

    if (props.field) {
      doc = {
        ...doc,
        type: props.field.type
      };

      if (
        props.field.type === 'select' ||
        props.field.type === 'radio' ||
        props.field.type === 'check'
      ) {
        doc = {
          type: props.field.type,
          hasOptions: true,
          options: Object.assign([], props.field.options || [])
        };
      }
    }

    this.state = {
      ...doc,
      add: false,
      isSubmitted: false
    };
  }

  onSubmit = () => {
    this.setState({ isSubmitted: true });
  };

  generateDoc = (values: {
    _id?: string;
    groupId: string;
    validation: string;
    text: string;
    description: string;
  }) => {
    const { field, type } = this.props;

    const finalValues = values;

    if (field) {
      finalValues._id = field._id;
    }

    return {
      type: this.state.type,
      options: this.state.options,
      contentType: type,
      _id: finalValues._id,
      text: finalValues.text,
      description: finalValues.description,
      groupId: finalValues.groupId,
      validation: finalValues.validation
    };
  };

  onChangeOption = options => {
    this.setState({ options });
  };

  onRemoveOption = options => {
    this.setState({ options });
  };

  onTypeChange = e => {
    const value = e.target.value;

    let doc = { hasOptions: false, options: [] };

    if (value === 'select' || value === 'check' || value === 'radio') {
      doc = { hasOptions: true, options: [] };
    }

    this.setState({ type: value, ...doc });
  };

  getMutation = () => {
    if (this.props.field) {
      return mutations.fieldsEdit;
    }

    return mutations.fieldsAdd;
  };

  renderOptions = () => {
    if (!this.state.hasOptions) {
      return null;
    }

    return (
      <ModifiableList
        options={this.state.options}
        onChangeOption={this.onChangeOption}
      />
    );
  };

  renderAddGroup = () => {
    const { queryParams } = this.props;

    const trigger = <Button>Create group</Button>;
    const content = props => (
      <PropertyGroupForm {...props} queryParams={queryParams} />
    );

    return (
      <ModalTrigger title="Create group" trigger={trigger} content={content} />
    );
  };

  renderContent = (formProps: IFormProps) => {
    const {
      groups,
      refetchQueries,
      closeModal,
      field = {} as IField
    } = this.props;
    const { type } = this.state;

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Name:</ControlLabel>
          <FormControl
            {...formProps}
            name="text"
            defaultValue={field.text || ''}
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description:</ControlLabel>
          <FormControl
            {...formProps}
            name="description"
            componentClass="textarea"
            defaultValue={field.description || ''}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Group:</ControlLabel>
          <Row>
            <FormControl
              {...formProps}
              name="groupId"
              componentClass="select"
              defaultValue={field.groupId || ''}
              required={true}
            >
              {groups.map(group => {
                return (
                  <option key={group._id} value={group._id}>
                    {group.name}
                  </option>
                );
              })}
            </FormControl>
            {this.renderAddGroup()}
          </Row>
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Type:</ControlLabel>

          <FormControl
            {...formProps}
            name="type"
            componentClass="select"
            value={type}
            onChange={this.onTypeChange}
            required={true}
          >
            <option />
            <option value="input">Input</option>
            <option value="textarea">Text area</option>
            <option value="select">Select</option>
            <option value="check">Checkbox</option>
            <option value="radio">Radio button</option>
          </FormControl>
        </FormGroup>
        {this.renderOptions()}

        <FormGroup>
          <ControlLabel>Validation:</ControlLabel>

          <FormControl
            {...formProps}
            componentClass="select"
            name="validation"
            defaultValue={field.validation || ''}
          >
            <option />
            <option value="email">Email</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
          </FormControl>
        </FormGroup>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            Close
          </Button>

          <ButtonMutate
            mutation={this.getMutation()}
            variables={this.generateDoc(formProps.values)}
            callback={closeModal}
            refetchQueries={refetchQueries}
            isSubmitted={this.state.isSubmitted}
            type="submit"
            icon="checked-1"
            successMessage={`You successfully ${
              field ? 'updated' : 'added'
            } a property field.`}
          >
            {__('Save')}
          </ButtonMutate>
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} onSubmit={this.onSubmit} />;
  }
}

export default PropertyForm;
