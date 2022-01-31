import FormControl from 'modules/common/components/form/Control';
import ControlLabel from 'modules/common/components/form/Label';
import { LeftItem } from 'modules/common/components/step/styles';
import { __ } from 'modules/common/utils';
import { FlexContent } from 'modules/layout/styles';
import { IField } from 'modules/settings/properties/types';
import { Description } from 'modules/settings/styles';
import React from 'react';
import FormGroup from '../../common/components/form/Group';
import { FormTop, Title } from '../styles';
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
  buttonText: string;
  numberOfPages?: number;
  currentPage: number;
};

class Form extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { form = {} as IForm } = props;

    this.state = {
      fields: (props.formData ? props.formData.fields : props.fields) || [],
      title: form.title || 'Form Title',
      desc: form.description || 'Form Description',
      buttonText: form.buttonText || 'Send',
      currentMode: undefined,
      currentField: undefined,
      type: props.type || '',
      numberOfPages: form.numberOfPages || 1,
      currentPage: 1
    };
  }

  componentWillReceiveProps(nextProps: Props) {
    const { saveForm, type, isReadyToSave, formData } = this.props;
    const { title, buttonText, desc, fields } = this.state;

    if (nextProps.formData && nextProps.formData !== formData) {
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
              description: desc,
              buttonText,
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
    const { title, buttonText, desc, numberOfPages } = this.state;

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
          <ControlLabel>{__('Number of pages')}</ControlLabel>
          <FormControl
            name="numberOfPages"
            value={numberOfPages}
            onChange={onChangeField}
            type={'number'}
            min={1}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>{__('Form button text')}</ControlLabel>
          <FormControl
            name="buttonText"
            value={buttonText}
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
        _id: `tempId${Math.random().toString()}`,
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

    const allFields = this.state.fields;

    for (const field of fields) {
      const index = allFields.map(e => e._id).indexOf(field._id);

      if (index !== -1) {
        allFields[index] = field;
      }
    }

    this.setState({ fields: allFields }, () => {
      if (onDocChange) {
        onDocChange(this.state);
      }
    });
  };

  render() {
    const { renderPreviewWrapper } = this.props;
    const {
      currentMode,
      currentField,
      fields,
      desc,
      numberOfPages
    } = this.state;

    const renderer = () => {
      return (
        <FieldsPreview
          formDesc={desc}
          fields={fields}
          onFieldClick={this.onFieldClick}
          onChangeFieldsOrder={this.onChangeFieldsOrder}
          currentPage={this.state.currentPage}
        />
      );
    };

    return (
      <FlexContent>
        <LeftItem>
          <FormTop>{this.renderOptionalFields()}</FormTop>
          <Title>{__('Add a new field')}</Title>
          <Description>
            {__('Choose a field type from the options below.')}
          </Description>
          <FieldChoices onChoiceClick={this.onChoiceClick} />
        </LeftItem>
        {currentField && (
          <FieldForm
            mode={currentMode || 'create'}
            field={currentField}
            fields={fields}
            numberOfPages={numberOfPages || 1}
            onSubmit={this.onFieldSubmit}
            onDelete={this.onFieldDelete}
            onCancel={this.onFieldFormCancel}
          />
        )}
        {renderPreviewWrapper && renderPreviewWrapper(renderer, fields)}
      </FlexContent>
    );
  }
}

export default Form;
