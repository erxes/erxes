import { FlexItem } from 'modules/common/components/step/styles';
import { __ } from 'modules/common/utils';
import { FieldItem } from 'modules/forms/components/step/preview/styles';
import { IField } from 'modules/settings/properties/types';
import React from 'react';
import Toggle from 'react-toggle';
import { ModalFooter } from '../../styles/main';
import Button from '../Button';
import FormControl from './Control';
import FieldPreview from './FieldPreview';
import FormGroup from './Group';
import ControlLabel from './Label';
import { FlexRow, LeftSection, Preview, PreviewSection } from './styles';

type Props = {
  closeModal?: () => void;
  afterSave?: () => void;
  onChange: (name: string, value: string | boolean | string[]) => void;
  onSubmit: (e: any) => void;
  type: { value: string; children: string };
  editingField?: IField;
};

type State = {
  chosenFieldType?: string;
};

class FieldForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      chosenFieldType: ''
    };
  }

  onFieldChange = (name: string, value: string | boolean | string[]) => {
    this.props.onChange(name, value);
  };

  renderValidation() {
    const { editingField = {} as IField } = this.props;

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

  renderOptions(type) {
    const { editingField = {} as IField } = this.props;

    const onChange = e =>
      this.onFieldChange(
        'options',
        (e.currentTarget as HTMLInputElement).value.split('\n')
      );

    if (
      !['select', 'check', 'radio'].includes(
        type.value || editingField.type || ''
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

  renderLeftContent() {
    const { type, onSubmit, closeModal } = this.props;
    const { editingField = {} as IField } = this.props;

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

          <Button size="small" onClick={onSubmit} btnStyle="success" icon="add">
            Add
          </Button>
        </ModalFooter>
      </>
    );
  }

  renderFieldPreview(editingField) {
    return (
      <Preview>
        <FieldItem>
          <FieldPreview type={this.props.type} editingField={editingField} />
        </FieldItem>
      </Preview>
    );
  }

  render() {
    const { editingField = {} as IField } = this.props;

    return (
      <FlexItem>
        <LeftSection>{this.renderLeftContent()}</LeftSection>

        <PreviewSection>{this.renderFieldPreview(editingField)}</PreviewSection>
      </FlexItem>
    );
  }
}

export default FieldForm;
