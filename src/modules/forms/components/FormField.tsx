import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import Icon from 'modules/common/components/Icon';
import { FlexItem } from 'modules/common/components/step/styles';
import { ModalFooter } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import { IField } from 'modules/settings/properties/types';
import React from 'react';
import Toggle from 'react-toggle';
import {
  FlexRow,
  LeftSection,
  Preview,
  PreviewSection,
  ShowPreview
} from '../styles';
import FieldPreview from './FieldPreview';

type Props = {
  closeModal?: () => void;
  afterSave?: () => void;
  onChange: (value: IField, callback: () => void) => void;
  onSubmit: (e: any) => void;
  onDelete: (fieldId: string) => void;
  field?: IField;
  editingField?: IField;
  type?: string;
};

type State = {
  editingField?: IField;
};

class FormField extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      editingField: props.field || undefined
    };
  }

  onFieldChange = (name: string, value: string | boolean | string[]) => {
    this.setFieldAttrChanges(name, value);
  };

  onSubmit = e => {
    e.persist();

    const { editingField = {} as IField } = this.state;
    const { onChange, onSubmit, closeModal } = this.props;

    onChange(editingField, () => {
      onSubmit(e);
    });

    if (closeModal) {
      closeModal();
    }
  };

  setFieldAttrChanges(
    attributeName: string,
    value: string | boolean | string[]
  ) {
    const { type } = this.props;

    const editingField = this.state.editingField || ({ type } as IField);

    editingField[attributeName] = value;

    this.setState({ editingField });
  }

  renderValidation() {
    const { editingField = {} as IField } = this.state;

    const validation = e =>
      this.onFieldChange(
        'validation',
        (e.currentTarget as HTMLInputElement).value
      );

    return (
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
    );
  }

  renderOptions(type = '') {
    const { editingField = {} as IField } = this.state;

    const onChange = e =>
      this.onFieldChange(
        'options',
        (e.currentTarget as HTMLInputElement).value.split('\n')
      );

    if (!['select', 'check', 'radio'].includes(editingField.type || type)) {
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

  renderExtraButton() {
    const { field, closeModal } = this.props;

    if (!field) {
      return null;
    }

    const onDelete = e => {
      e.preventDefault();

      this.props.onDelete(field._id);

      if (closeModal) {
        closeModal();
      }
    };

    return (
      <Button size="small" btnStyle="danger" onClick={onDelete} icon="cancel-1">
        Delete
      </Button>
    );
  }

  renderLeftContent() {
    const { type, field, closeModal } = this.props;
    const { editingField = {} as IField } = this.state;

    const text = e =>
      this.onFieldChange('text', (e.currentTarget as HTMLInputElement).value);

    const desc = e =>
      this.onFieldChange(
        'description',
        (e.currentTarget as HTMLInputElement).value
      );

    const toggle = e =>
      this.onFieldChange(
        'isRequired',
        (e.currentTarget as HTMLInputElement).checked
      );

    return (
      <>
        {this.renderValidation()}

        <FormGroup>
          <ControlLabel htmlFor="text" required={true}>
            Field Label
          </ControlLabel>
          <FormControl
            type="text"
            value={editingField.text || ''}
            onChange={text}
            autoFocus={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel htmlFor="description">Field description</ControlLabel>
          <FormControl
            componentClass="textarea"
            value={editingField.description || ''}
            onChange={desc}
          />
        </FormGroup>

        {this.renderOptions(type)}

        <FlexRow>
          <label>This field is required</label>
          <Toggle
            defaultChecked={editingField.isRequired || false}
            icons={{
              checked: <span>Yes</span>,
              unchecked: <span>No</span>
            }}
            onChange={toggle}
          />
        </FlexRow>

        <ModalFooter>
          <Button
            btnStyle="simple"
            size="small"
            type="button"
            icon="cancel-1"
            onClick={closeModal}
          >
            Cancel
          </Button>

          {this.renderExtraButton()}

          <Button
            size="small"
            onClick={this.onSubmit}
            btnStyle="success"
            icon={field ? 'checked-1' : 'add'}
          >
            {field ? 'Save' : 'Add'}
          </Button>
        </ModalFooter>
      </>
    );
  }

  render() {
    const { type } = this.props;

    const { editingField = { type } as IField } = this.state;

    return (
      <FlexItem>
        <LeftSection>{this.renderLeftContent()}</LeftSection>

        <PreviewSection>
          <Preview>
            <FieldPreview field={editingField} type="onEdit" />
            <ShowPreview>
              <Icon icon="eye" /> Field preview
            </ShowPreview>
          </Preview>
        </PreviewSection>
      </FlexItem>
    );
  }
}

export default FormField;
