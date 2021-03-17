import FormControl from 'modules/common/components/form/Control';
import ControlLabel from 'modules/common/components/form/Label';
import { LeftItem } from 'modules/common/components/step/styles';
import { __ } from 'modules/common/utils';
import { FlexContent } from 'modules/layout/styles';
import { IField } from 'modules/settings/properties/types';
import React from 'react';
import FormGroup from '../../common/components/form/Group';
import { Title } from '../styles';
import { IForm, IFormData } from '../types';
import FieldChoices from './FieldChoices';
import FieldForm from './FieldForm';
import FieldsPreview from './FieldsPreview';

type Props = {
  fields: IField[];
  renderPreviewWrapper?: (previewRenderer, fields: IField[]) => void;
  onDocChange?: (doc: IFormData) => void;
  saveForm: (params: IFormData) => void;
  formData?: IFormData;
  isReadyToSave: boolean;
  type: string;
  form?: IForm;
  hideOptionalFields?: boolean;
  currentMode?: 'create' | 'update' | undefined;
  currentField?: IField;
};

type State = {
  fields: IField[];
  currentMode: 'create' | 'update' | undefined;
  currentField?: IField;
  title: string;
  desc: string;
  type?: string;
  btnText: string;
};

class Form extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { form = {} as IForm } = props;

    this.state = {
      fields: (props.formData ? props.formData.fields : props.fields) || [],
      title: form.title || '',
      desc: form.description || '',
      btnText: form.buttonText || 'Send',
      currentMode: undefined,
      currentField: undefined,
      type: props.type || ''
    };
  }

  componentWillReceiveProps(nextProps: Props) {
    const { saveForm, type, isReadyToSave } = this.props;
    const { title, btnText, desc, fields, currentMode } = this.state;

    if (nextProps.formData && currentMode !== 'create') {
      this.setState({
        fields: nextProps.formData.fields || []
      });
    }

    if (nextProps.isReadyToSave && isReadyToSave !== nextProps.isReadyToSave) {
      saveForm(
        nextProps.formData
          ? { ...nextProps.formData }
          : {
              title,
              desc,
              btnText,
              fields,
              type
            }
      );
    }
  }

  renderOptionalFields = () => {
    if (this.props.hideOptionalFields) {
      return null;
    }

    const { onDocChange } = this.props;
    const { title, btnText, desc } = this.state;

    const onChangeField = e => {
      const name: keyof State = e.target.name;
      const value = (e.currentTarget as HTMLInputElement).value;

      this.setState({ [name]: value } as any, () => {
        if (onDocChange) {
          onDocChange(this.state);
        }
      });
    };

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>{__('Form title')}</ControlLabel>
          <FormControl
            required={true}
            name="title"
            value={title}
            onChange={onChangeField}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>{__('Form description')}</ControlLabel>
          <FormControl
            componentClass="textarea"
            name="desc"
            value={desc}
            onChange={onChangeField}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>{__('Form button text')}</ControlLabel>
          <FormControl
            name="btnText"
            value={btnText}
            onChange={onChangeField}
          />
        </FormGroup>
      </>
    );
  };

  onChoiceClick = (choice: string) => {
    this.setState({
      currentMode: 'create',
      currentField: {
        _id: Math.random().toString(),
        contentType: 'form',
        type: choice
      }
    });
  };

  onFieldClick = (field: IField) => {
    this.setState({ currentMode: 'update', currentField: field });
  };

  onFieldSubmit = (field: IField) => {
    const { onDocChange } = this.props;
    const { fields, currentMode } = this.state;

    let selector = { fields, currentField: undefined };

    if (currentMode === 'create') {
      selector = {
        fields: [...fields, field],
        currentField: undefined
      };
    }

    this.setState(selector, () => {
      if (onDocChange) {
        onDocChange(this.state);
      }
    });
  };

  onFieldDelete = (field: IField) => {
    // remove field from state
    const fields = this.state.fields.filter(f => f._id !== field._id);

    this.setState({ fields, currentField: undefined });
  };

  onFieldFormCancel = () => {
    this.setState({ currentField: undefined });
  };

  onChangeFieldsOrder = fields => {
    const { onDocChange } = this.props;

    this.setState({ fields }, () => {
      if (onDocChange) {
        onDocChange(this.state);
      }
    });
  };

  render() {
    const { renderPreviewWrapper } = this.props;
    const { currentMode, currentField, fields, desc } = this.state;

    if (currentField) {
      return (
        <FieldForm
          type="customer"
          mode={currentMode || 'create'}
          field={currentField}
          onSubmit={this.onFieldSubmit}
          onDelete={this.onFieldDelete}
          onCancel={this.onFieldFormCancel}
        />
      );
    }

    const renderer = () => {
      return (
        <FieldsPreview
          formDesc={desc}
          fields={fields}
          onFieldClick={this.onFieldClick}
          onChangeFieldsOrder={this.onChangeFieldsOrder}
        />
      );
    };

    return (
      <FlexContent>
        <LeftItem>
          {this.renderOptionalFields()}

          <Title>{__('Add a new field')}</Title>
          <p>{__('Choose a field type from the options below.')}</p>
          <FieldChoices onChoiceClick={this.onChoiceClick} />
        </LeftItem>
        {renderPreviewWrapper && renderPreviewWrapper(renderer, fields)}
      </FlexContent>
    );
  }
}

export default Form;
