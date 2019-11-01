import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import ModifiableList from 'modules/common/components/ModifiableList';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { Row } from 'modules/settings/integrations/styles';
import React from 'react';
import PropertyGroupForm from '../containers/PropertyGroupForm';
import { IField, IFieldGroup } from '../types';

type Props = {
  queryParams: any;
  field?: IField;
  groups: IFieldGroup[];
  type: string;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  options: any[];
  type: string;
  hasOptions: boolean;
  add: boolean;
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
      add: false
    };
  }

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
      ...finalValues,
      type: this.state.type,
      options: this.state.options,
      contentType: type
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
    const { groups, closeModal, renderButton, field } = this.props;

    const object = field || ({} as IField);

    const { values, isSubmitted } = formProps;
    const { type } = this.state;

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Name:</ControlLabel>
          <FormControl
            {...formProps}
            name="text"
            defaultValue={object.text || ''}
            required={true}
            autoFocus={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description:</ControlLabel>
          <FormControl
            {...formProps}
            name="description"
            componentClass="textarea"
            defaultValue={object.description || ''}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Group:</ControlLabel>
          <Row>
            <FormControl
              {...formProps}
              name="groupId"
              componentClass="select"
              defaultValue={object.groupId || ''}
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
            defaultValue={object.validation || ''}
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

          {renderButton({
            name: 'property',
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: field
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default PropertyForm;
