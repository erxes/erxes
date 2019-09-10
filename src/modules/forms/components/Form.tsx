import FormControl from 'modules/common/components/form/Control';
import ControlLabel from 'modules/common/components/form/Label';
import { LeftItem } from 'modules/common/components/step/styles';
import { __ } from 'modules/common/utils';
import { FlexContent } from 'modules/layout/styles';
import { IField } from 'modules/settings/properties/types';
import React from 'react';
import FormGroup from '../../common/components/form/Group';
import { Title } from '../styles';
import { IForm, IFormData, IFormPreviewContent } from '../types';
import Fields from './Fields';
import FormField from './FormField';

type Props = {
  fields: IField[];
  renderPreview: (props: IFormPreviewContent) => void;
  onDocChange?: (doc: IFormData) => void;
  saveForm: (params: IFormData) => void;
  isSaving: boolean;
  type: string;
  form?: IForm;
  hideOptionalFields?: boolean;
};

type State = {
  fields: IField[];
  editingField?: IField;
  formTitle: string;
  formDesc: string;
  isSaving: boolean;
  formBtnText: string;
};

class Form extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { form = {} as IForm } = props;

    this.state = {
      fields: props.fields || [],
      formTitle: form.title || '',
      formDesc: form.description || '',
      formBtnText: form.buttonText || 'Send',
      isSaving: props.isSaving,
      editingField: undefined
    };
  }

  componentWillReceiveProps(nextProps: Props) {
    const { saveForm, type, isSaving } = this.props;
    const { formTitle, formBtnText, formDesc, fields } = this.state;

    if (nextProps.isSaving && isSaving !== nextProps.isSaving) {
      saveForm({
        title: formTitle,
        description: formDesc,
        buttonText: formBtnText,
        fields,
        type
      });
    }
  }

  onChange = <T extends keyof State>(key: T, value: State[T]) => {
    this.setState(
      { [key]: value } as Pick<State, keyof State>,
      () => this.props.onDocChange && this.props.onDocChange(this.state)
    );
  };

  onFieldChange = (value: IField, callback: () => void) => {
    this.setState({ editingField: value }, () => callback());
  };

  onSubmit = e => {
    e.preventDefault();

    const editingField = this.state.editingField || ({} as IField);

    const doc = {
      _id: Math.random().toString(),
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
    (this.state.fields || []).push(doc);

    this.setState({ fields: this.state.fields });
  };

  onDelete = fieldId => {
    // remove field from state
    const fields = (this.state.fields || []).filter(
      field => field._id !== fieldId
    );

    this.setState({ fields });

    this.onChange('fields', fields);
  };

  onFieldEdit = (field: IField, props) => {
    return (
      <FormField
        {...props}
        field={field}
        fields={this.state.fields}
        onSubmit={this.onSubmit}
        onDelete={this.onDelete}
        onChange={this.onChange}
      />
    );
  };

  renderOptionalFields = () => {
    if (this.props.hideOptionalFields) {
      return null;
    }

    const { formTitle, formBtnText, formDesc } = this.state;

    const onChangeField = e =>
      this.onChange(e.target.name, (e.currentTarget as HTMLInputElement).value);

    return (
      <>
        <FormGroup>
          <ControlLabel>{__('Form title')}</ControlLabel>
          <FormControl
            name="formTitle"
            value={formTitle}
            onChange={onChangeField}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>{__('Form description')}</ControlLabel>
          <FormControl
            componentClass="textarea"
            name="formDesc"
            value={formDesc}
            onChange={onChangeField}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>{__('Form button text')}</ControlLabel>
          <FormControl
            name="formBtnText"
            value={formBtnText}
            onChange={onChangeField}
          />
        </FormGroup>
      </>
    );
  };

  render() {
    const { renderPreview } = this.props;
    const {
      formTitle,
      formBtnText,
      formDesc,
      fields,
      editingField
    } = this.state;

    return (
      <FlexContent>
        <LeftItem>
          {this.renderOptionalFields()}

          <Title>{__('New field')}</Title>
          <Fields
            onSubmit={this.onSubmit}
            onChange={this.onFieldChange}
            editingField={editingField}
          />
        </LeftItem>

        {renderPreview({
          formTitle,
          formBtnText,
          formDesc,
          fields,
          onFieldEdit: this.onFieldEdit,
          onFieldChange: this.onChange
        })}
      </FlexContent>
    );
  }
}

export default Form;
