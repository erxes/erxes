import FormControl from 'modules/common/components/form/Control';
import Fields from 'modules/common/components/form/Fields';
import FormField from 'modules/common/components/form/FormField';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { LeftItem, Preview } from 'modules/common/components/step/styles';
import { __ } from 'modules/common/utils';
import { IField } from 'modules/settings/properties/types';
import React from 'react';
import FormPreview from './preview/FormPreview';
import { FlexItem, Title } from './style';

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

  onFieldChange = (value: IField, callback: () => void) => {
    this.setState({ editingField: value }, () => callback());
  };

  onChangeState = (name: any, value: string) => {
    this.setState({ [name]: value });
    this.props.onChange(name, value);
  };

  onFieldEdit = (field: IField, props) => {
    return (
      <FormField
        {...props}
        field={field}
        fields={this.state.fields}
        onSubmit={this.onSubmit}
        onDelete={this.onDelete}
        onChange={this.props.onChange}
      />
    );
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

  onDelete = fieldId => {
    // remove field from state
    const fields = (this.state.fields || []).filter(
      field => field._id !== fieldId
    );

    this.setState({ fields });

    this.props.onChange('fields', fields);
  };

  renderLeftSidebar = () => {
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

    const formBtnText = e =>
      this.onChangeState(
        'formBtnText',
        (e.currentTarget as HTMLInputElement).value
      );

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>{__('Form title')}</ControlLabel>
          <FormControl
            id="form-btn-text"
            value={this.props.formTitle}
            onChange={formTitle}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>{__('Form description')}</ControlLabel>
          <FormControl
            id="form-btn-text"
            componentClass="textarea"
            value={this.props.formDesc}
            onChange={formDesc}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>{__('Form button text')}</ControlLabel>
          <FormControl
            id="form-btn-text"
            value={this.props.formBtnText}
            onChange={formBtnText}
          />
        </FormGroup>

        <Title>New field</Title>
        <Fields
          onSubmit={this.onSubmit}
          onChange={this.onFieldChange}
          editingField={this.state.editingField}
        >
          <option value="input">{__('Input')}</option>
          <option value="textarea">{__('Text area')}</option>
          <option value="select">{__('Select')}</option>
          <option value="check">{__('Checkbox')}</option>
          <option value="radio">{__('Radio button')}</option>
          <option value="phone">{__('Phone')}</option>
          <option value="email">{__('Email')}</option>
          <option value="firstName">{__('First name')}</option>
          <option value="lastName">{__('Last name')}</option>
        </Fields>
      </>
    );
  };

  render() {
    return (
      <FlexItem>
        <LeftItem>{this.renderLeftSidebar()}</LeftItem>

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
