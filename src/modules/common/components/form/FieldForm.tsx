import { FlexItem } from 'modules/common/components/step/styles';
import { __ } from 'modules/common/utils';
import { FieldItem } from 'modules/forms/components/step/preview/styles';
import GenerateField from 'modules/settings/properties/components/GenerateField';
import { IField } from 'modules/settings/properties/types';
import React from 'react';
import Toggle from 'react-toggle';
import { ModalFooter } from '../../styles/main';
import Button from '../Button';
import Icon from '../Icon';
import FormControl from './Control';
import FormGroup from './Group';
import ControlLabel from './Label';
import {
  FlexRow,
  LeftSection,
  Preview,
  PreviewSection,
  ShowPreview
} from './styles';
import FieldPreview from 'modules/forms/components/step/preview/FieldPreview';

type Props = {
  closeModal?: () => void;
  afterSave?: () => void;
  onChange: (value: IField, callback: () => void) => void;
  onSubmit: (e: any) => void;
  type: { value: string; children: string };
};

type State = {
  editingField?: IField;
};

class FieldForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      editingField: undefined
    };
  }

  onFieldChange = (name: string, value: string | boolean | string[]) => {
    this.setFieldAttrChanges(name, value);
  };

  onSubmit = e => {
    e.preventDefault();

    const { editingField = {} as IField } = this.state;

    this.props.onChange(editingField, () => {
      this.props.onSubmit(e);
    });

    if (this.props.closeModal) {
      this.props.closeModal();
    }
  };

  setFieldAttrChanges(
    attributeName: string,
    value: string | boolean | string[]
  ) {
    const editingField =
      this.state.editingField || ({ type: this.props.type.value } as IField);

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

  renderOptions(type) {
    const { editingField = {} as IField } = this.state;

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

  renderButtons() {
    const { closeModal } = this.props;

    return (
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

        <Button
          size="small"
          onClick={this.onSubmit}
          btnStyle="success"
          icon="add"
        >
          Add
        </Button>
      </ModalFooter>
    );
  }

  renderLeftContent() {
    const { type } = this.props;
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

        {this.renderButtons()}
      </>
    );
  }

  render() {
    const {
      editingField = { type: this.props.type.value } as IField
    } = this.state;

    return (
      <FlexItem>
        <LeftSection>{this.renderLeftContent()}</LeftSection>

        <PreviewSection>
          <Preview>
            <FieldPreview field={editingField} />
            <ShowPreview>
              <Icon icon="eye" /> Haregerg sierughiseuhrg
            </ShowPreview>
          </Preview>
        </PreviewSection>
      </FlexItem>
    );
  }
}

export default FieldForm;
