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

type Props = {
  fields: IField[];
  onDocChange?: (doc: IFormData) => void;
  saveForm: (params: IFormData) => void;
  isReadyToSave: boolean;
  type: string;
  form?: IForm;
  hideOptionalFields?: boolean;
};

type State = {
  fields: IField[];
  currentMode: 'create' | 'update' | undefined;
  currentField?: IField;
  title: string;
  desc: string;
  btnText: string;
};

class Form extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { form = {} as IForm } = props;

    this.state = {
      fields: props.fields || [],
      title: form.title || '',
      desc: form.description || '',
      btnText: form.buttonText || 'Send',
      currentMode: undefined,
      currentField: undefined
    };
  }

  componentWillReceiveProps(nextProps: Props) {
    const { saveForm, type, isReadyToSave } = this.props;
    const { title, btnText, desc, fields } = this.state;

    if (nextProps.isReadyToSave && isReadyToSave !== nextProps.isReadyToSave) {
      saveForm({
        title,
        desc,
        btnText,
        fields,
        type
      });
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
    const { currentMode, currentField } = this.state;

    if (currentField) {
      return (
        <FieldForm
          mode={currentMode || 'create'}
          field={currentField}
          onSubmit={this.onFieldSubmit}
          onDelete={this.onFieldDelete}
          onCancel={this.onFieldFormCancel}
        />
      );
    }

    return (
      <FlexContent>
        <LeftItem>
          {this.renderOptionalFields()}

          <Title>{__('New field')}</Title>

          <FieldChoices onChoiceClick={this.onChoiceClick} />
        </LeftItem>
      </FlexContent>
    );
  }
}

export default Form;
