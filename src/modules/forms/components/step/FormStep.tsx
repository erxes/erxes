import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { LeftItem, Preview } from 'modules/common/components/step/styles';
import { __ } from 'modules/common/utils';
import ActionBar from 'modules/layout/components/ActionBar';
import { IField } from 'modules/settings/properties/types';
import React from 'react';
import FormPreview from './preview/FormPreview';
import { FlexColumn, FlexItem } from './style';

type Props = {
  type: string;
  formTitle?: string;
  formBtnText?: string;
  formDesc?: string;
  color: string;
  theme: string;
  onChange: (
    name: 'fields' | 'formTitle' | 'formDesc' | 'formBtnText' | 'type',
    fields: IField[] | string
  ) => void;
  fields?: IField[];
};

type State = {
  fields?: IField[];
  chosenFieldType?: string;
  editingField?: IField;
};

class FormStep extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      fields: props.fields,
      chosenFieldType: '',
      editingField: undefined
    };
  }

  componentWillReceiveProps(nextProps: Props) {
    this.setState({ fields: nextProps.fields });
  }

  onChangeType = (e: React.FormEvent<HTMLElement>) => {
    this.setState({
      chosenFieldType: (e.currentTarget as HTMLInputElement).value
    });
    this.setFieldAttrChanges(
      'type',
      (e.currentTarget as HTMLInputElement).value
    );
  };

  onFieldEdit = (field: IField) => {
    this.setState({ editingField: field });
  };

  onFieldAttrChange = (name: string, value: string | boolean | string[]) => {
    this.setFieldAttrChanges(name, value);
  };

  onChangeState = (name: any, value: string) => {
    this.setState({ [name]: value });
    this.props.onChange(name, value);
  };

  onSubmit = e => {
    e.preventDefault();

    const editingField = this.state.editingField || ({} as IField);

    const doc = {
      contentType: 'form',
      type: editingField.type,
      validation: editingField.validation,
      text: editingField.text,
      description: editingField.description,
      options: editingField.options,
      order: 0,
      isRequired: editingField.isRequired
    };

    // newly created field to fields state
    (this.state.fields || []).push({
      _id: Math.random().toString(),
      ...doc
    });

    this.setState({ fields: this.state.fields, editingField: undefined });

    this.props.onChange('fields', this.state.fields || []);
  };

  setFieldAttrChanges(
    attributeName: string,
    value: string | boolean | string[]
  ) {
    const { fields = [] } = this.state;

    const editingField = this.state.editingField || ({} as IField);

    editingField[attributeName] = value;

    this.setState({ editingField });

    this.props.onChange('fields', fields);
  }

  renderButtons() {
    const { editingField } = this.state;

    if (editingField && editingField._id) {
      const _id = editingField._id;

      // reset editing field state
      const reset = () => {
        this.setState({ editingField: undefined });
      };

      const onDelete = e => {
        e.preventDefault();

        // remove field from state
        const fields = (this.state.fields || []).filter(
          field => field._id !== _id
        );

        this.setState({ fields });

        reset();

        this.props.onChange('fields', fields);
      };

      return (
        <Button.Group>
          <Button
            size="small"
            btnStyle="danger"
            onClick={onDelete}
            icon="cancel-1"
          >
            Delete
          </Button>
          <Button size="small" btnStyle="primary" onClick={reset} icon="add">
            New
          </Button>
        </Button.Group>
      );
    }

    return (
      <Button
        size="small"
        onClick={this.onSubmit}
        btnStyle="primary"
        icon="add"
      >
        Add
      </Button>
    );
  }

  footerActions = () => {
    const editingField = this.state.editingField || ({} as IField);

    const onChange = e =>
      this.onFieldAttrChange(
        'isRequired',
        (e.currentTarget as HTMLInputElement).checked
      );

    return (
      <ActionBar
        right={
          <React.Fragment>
            <FormControl
              checked={editingField.isRequired || false}
              id="isRequired"
              componentClass="checkbox"
              onChange={onChange}
            >
              {__('This item is required')}
            </FormControl>
            &emsp; {this.renderButtons()}
          </React.Fragment>
        }
      />
    );
  };

  renderOptionsTextArea() {
    const { chosenFieldType = '' } = this.state;
    const editingField = this.state.editingField || ({} as IField);

    const onChange = e =>
      this.onFieldAttrChange(
        'options',
        (e.currentTarget as HTMLInputElement).value.split('\n')
      );

    if (
      !['select', 'check', 'radio'].includes(
        chosenFieldType || editingField.type || ''
      )
    ) {
      return null;
    }

    return (
      <FormGroup>
        <ControlLabel htmlFor="type">Options:</ControlLabel>

        <FormControl
          id="options"
          componentClass="textarea"
          value={(editingField.options || []).join('\n')}
          onChange={onChange}
        />
      </FormGroup>
    );
  }

  renderOptions() {
    const editingField = this.state.editingField || ({} as IField);

    const formTitle = e =>
      this.onChangeState(
        'formTitle',
        (e.currentTarget as HTMLInputElement).value
      );

    const formDesc = e =>
      this.onChangeState(
        'formDesc',
        (e.currentTarget as HTMLInputElement).value
      );

    const validation = e =>
      this.onFieldAttrChange(
        'validation',
        (e.currentTarget as HTMLInputElement).value
      );

    const text = e =>
      this.onFieldAttrChange(
        'text',
        (e.currentTarget as HTMLInputElement).value
      );

    const desc = e =>
      this.onFieldAttrChange(
        'description',
        (e.currentTarget as HTMLInputElement).value
      );

    const formBtnText = e =>
      this.onChangeState(
        'formBtnText',
        (e.currentTarget as HTMLInputElement).value
      );

    return (
      <React.Fragment>
        <FormGroup>
          <ControlLabel>{__('Form title')}</ControlLabel>
          <FormControl
            id="form-btn-text"
            value={this.props.formTitle}
            onChange={formTitle}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>{__('Form description')}</ControlLabel>
          <FormControl
            id="form-btn-text"
            componentClass="textarea"
            value={this.props.formDesc}
            onChange={formDesc}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel htmlFor="type">Type:</ControlLabel>

          <FormControl
            id="type"
            componentClass="select"
            value={editingField.type || ''}
            onChange={this.onChangeType}
          >
            <option />
            <option value="input">{__('Input')}</option>
            <option value="textarea">{__('Text area')}</option>
            <option value="select">{__('Select')}</option>
            <option value="check">{__('Checkbox')}</option>
            <option value="radio">{__('Radio button')}</option>
            <option value="phone">{__('Phone')}</option>
            <option value="email">{__('Email')}</option>
            <option value="firstName">{__('First name')}</option>
            <option value="lastName">{__('Last name')}</option>
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel htmlFor="validation">Validation:</ControlLabel>

          <FormControl
            id="validation"
            componentClass="select"
            value={editingField.validation || ''}
            onChange={validation}
          >
            <option />
            <option value="email">{__('Email')}</option>
            <option value="number">{__('Number')}</option>
            <option value="date">{__('Date')}</option>
            <option value="phone">{__('Phone')}</option>
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel htmlFor="text">Text:</ControlLabel>
          <FormControl
            id="text"
            type="text"
            value={editingField.text || ''}
            onChange={text}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel htmlFor="description">Description:</ControlLabel>
          <FormControl
            id="description"
            componentClass="textarea"
            value={editingField.description || ''}
            onChange={desc}
          />
        </FormGroup>

        {this.renderOptionsTextArea()}

        <FormGroup>
          <ControlLabel>{__('Form button text')}</ControlLabel>
          <FormControl
            id="form-btn-text"
            value={this.props.formBtnText}
            onChange={formBtnText}
          />
        </FormGroup>
      </React.Fragment>
    );
  }

  render() {
    return (
      <FlexItem>
        <FlexColumn>
          <LeftItem>{this.renderOptions()}</LeftItem>
          {this.footerActions()}
        </FlexColumn>

        <Preview>
          <FormPreview
            {...this.props}
            fields={this.state.fields}
            onFieldEdit={this.onFieldEdit}
          />
        </Preview>
      </FlexItem>
    );
  }
}

export default FormStep;
