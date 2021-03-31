import { IOption } from 'erxes-ui/lib/types';
import Button from 'modules/common/components/Button';
import CollapseContent from 'modules/common/components/CollapseContent';
import EditorCK from 'modules/common/components/EditorCK';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import Icon from 'modules/common/components/Icon';
import { FlexItem } from 'modules/common/components/step/styles';
import Toggle from 'modules/common/components/Toggle';
import { __ } from 'modules/common/utils';
import SelectProperty from 'modules/settings/properties/containers/SelectProperty';
import { IField, IFieldLogic } from 'modules/settings/properties/types';
import React from 'react';
import Modal from 'react-bootstrap/Modal';
import {
  FlexRow,
  LeftSection,
  Preview,
  PreviewSection,
  ShowPreview
} from '../styles';
import FieldLogics from './FieldLogics';
import FieldPreview from './FieldPreview';

type Props = {
  onSubmit: (field: IField) => void;
  onDelete: (field: IField) => void;
  onCancel: () => void;
  mode: 'create' | 'update';
  field: IField;
  fields: IField[];
};

type State = {
  field: IField;
  selectedOption?: IOption;
  group?: string;
};

class FieldForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { field } = props;
    const selectedOption = field.associatedField && {
      value: field.associatedField._id,
      label: field.associatedField.text
    };

    this.state = {
      field,
      selectedOption,
      group: ''
    };
  }

  onFieldChange = (
    name: string,
    value: string | boolean | number | string[] | IFieldLogic[]
  ) => {
    this.setFieldAttrChanges(name, value);
  };

  onEditorChange = e => {
    const { field } = this.state;
    const content = e.editor.getData();

    field.content = content;

    this.setState({ field });
  };

  onPropertyGroupChange = e => {
    this.setState({
      group: (e.currentTarget as HTMLInputElement).value
    });
  };

  onPropertyChange = (selectedField: IField) => {
    const { field, group } = this.state;

    field.associatedFieldId = selectedField._id;
    field.validation = selectedField.validation;
    field.options = selectedField.options;
    field.type = selectedField.type;
    field.isRequired = selectedField.isRequired;
    field.text = selectedField.text;
    field.description = selectedField.description;

    if (group === 'company') {
      switch (field.type) {
        case 'avatar':
          field.type = 'companyAvatar';
          break;
        case 'size':
          field.validation = 'number';
          break;

        default:
          break;
      }
    }

    this.setState({
      field,
      selectedOption: {
        value: selectedField._id,
        label: selectedField.text || ''
      }
    });
  };

  onSubmit = e => {
    e.persist();

    const { field } = this.state;

    this.props.onSubmit(field);
  };

  setFieldAttrChanges(
    attributeName: string,
    value: string | boolean | number | string[] | IFieldLogic[]
  ) {
    const { field } = this.state;

    field[attributeName] = value;

    this.setState({ field });
  }

  renderValidation() {
    const { field } = this.state;
    const type = field.type;

    if (type !== 'input' && type !== 'email' && type !== 'phone') {
      return null;
    }

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
          value={field.validation || ''}
          onChange={validation}
        >
          <option />
          <option value="email">{__('Email')}</option>
          <option value="number">{__('Number')}</option>
          <option value="datetime">{__('Date Time')}</option>
          <option value="date">{__('Date')}</option>
          <option value="phone">{__('Phone')}</option>
        </FormControl>
      </FormGroup>
    );
  }

  renderOptions() {
    const { field } = this.state;

    const onChange = e =>
      this.onFieldChange(
        'options',
        (e.currentTarget as HTMLInputElement).value.split('\n')
      );

    if (!['select', 'check', 'radio', 'multiSelect'].includes(field.type)) {
      return null;
    }

    return (
      <FormGroup>
        <ControlLabel htmlFor="type">Options:</ControlLabel>

        <FormControl
          id="options"
          componentClass="textarea"
          value={(field.options || []).join('\n')}
          onChange={onChange}
        />
      </FormGroup>
    );
  }

  renderExtraButton() {
    const { mode, field } = this.props;

    if (mode === 'create') {
      return null;
    }

    const onDelete = e => {
      e.preventDefault();
      this.props.onDelete(field);
    };

    return (
      <Button
        uppercase={false}
        btnStyle="danger"
        onClick={onDelete}
        icon="minus-circle-1"
      >
        Delete
      </Button>
    );
  }

  renderMultipleSelectCheckBox() {
    const { field } = this.state;

    const isSelect = ['select', 'multiSelect'].includes(field.type);

    if (!isSelect) {
      return;
    }

    const onChange = e => {
      field.type = e.target.checked ? 'multiSelect' : 'select';
      this.setState({ field });
    };

    return (
      <FormGroup>
        <FlexRow>
          <ControlLabel htmlFor="description">
            {__('Select multiple values')}
          </ControlLabel>
          <Toggle
            defaultChecked={field.type === 'multiSelect'}
            icons={{
              checked: <span>Yes</span>,
              unchecked: <span>No</span>
            }}
            onChange={onChange}
          />
        </FlexRow>
      </FormGroup>
    );
  }

  renderLeftContent() {
    const { fields, mode, onCancel } = this.props;
    const { field } = this.state;

    const text = e =>
      this.onFieldChange('text', (e.currentTarget as HTMLInputElement).value);

    const groupName = e =>
      this.onFieldChange(
        'groupName',
        (e.currentTarget as HTMLInputElement).value
      );

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
        <CollapseContent
          title={__('General settings')}
          compact={true}
          open={true}
        >
          <FormGroup>
            <ControlLabel htmlFor="text" required={true}>
              Field Label
            </ControlLabel>

            <FormControl
              id="FieldLabel"
              type="text"
              value={field.text || ''}
              onChange={text}
              autoFocus={true}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel htmlFor="description">Field description</ControlLabel>
            <FormControl
              id="FieldDescription"
              value={field.description || ''}
              onChange={desc}
            />
          </FormGroup>

          {this.renderValidation()}

          {this.renderOptions()}

          {this.renderMultipleSelectCheckBox()}

          <FormGroup>
            <FlexRow>
              <ControlLabel htmlFor="description">
                {__('Field is required')}
              </ControlLabel>
              <Toggle
                defaultChecked={field.isRequired || false}
                icons={{
                  checked: <span>Yes</span>,
                  unchecked: <span>No</span>
                }}
                onChange={toggle}
              />
            </FlexRow>
          </FormGroup>
          <FormGroup>
            <ControlLabel htmlFor="text" required={false}>
              Group Name
            </ControlLabel>
            <p>Use with logic and group multiple fields</p>
            <FormControl
              id="GroupName"
              type="text"
              value={field.groupName || ''}
              onChange={groupName}
              autoFocus={false}
            />
          </FormGroup>

          {this.renderColumn()}
          {this.renderHtml()}
          {this.renderCustomPropertyGroup()}
          {this.renderCustomProperty()}
        </CollapseContent>
        {fields.length > 0 && (
          <CollapseContent title={__('Logic')} compact={true}>
            <FieldLogics
              fields={fields}
              currentField={field}
              onFieldChange={this.onFieldChange}
            />
          </CollapseContent>
        )}

        <Modal.Footer>
          <Button
            btnStyle="simple"
            uppercase={false}
            type="button"
            icon="times-circle"
            onClick={onCancel}
          >
            Cancel
          </Button>

          {this.renderExtraButton()}

          <Button
            uppercase={false}
            onClick={this.onSubmit}
            btnStyle="success"
            icon={mode === 'update' ? 'check-circle' : 'plus-circle'}
          >
            {mode === 'update' ? 'Save' : 'Add to Form'}
          </Button>
        </Modal.Footer>
      </>
    );
  }

  renderContent() {
    const { field } = this.state;

    return (
      <FlexItem>
        <LeftSection>{this.renderLeftContent()}</LeftSection>

        <PreviewSection>
          <Preview>
            <FieldPreview field={field} />

            <ShowPreview>
              <Icon icon="eye" /> Field preview
            </ShowPreview>
          </Preview>
        </PreviewSection>
      </FlexItem>
    );
  }

  renderCustomPropertyGroup() {
    const { field, group } = this.state;

    if (
      [
        'email',
        'phone',
        'firstName',
        'lastName',
        'companyName',
        'companyEmail',
        'companyPhone',
        'html'
      ].includes(field.type)
    ) {
      return null;
    }

    return (
      <>
        <FormGroup>
          <ControlLabel>Property type:</ControlLabel>
          <FormControl
            id="propertyGroup"
            componentClass="select"
            value={group}
            onChange={this.onPropertyGroupChange}
          >
            <option value={''} />
            <option value={'customer'}>Customer</option>
            <option value={'company'}>Company</option>
          </FormControl>
        </FormGroup>
      </>
    );
  }

  renderColumn() {
    const { field } = this.state;

    if (field.type === 'html') {
      return;
    }

    const onChangeColumn = e =>
      this.onFieldChange(
        'column',
        parseInt((e.currentTarget as HTMLInputElement).value, 10)
      );

    return (
      <FormGroup>
        <ControlLabel htmlFor="validation">Field width:</ControlLabel>

        <FormControl
          id="validation"
          componentClass="select"
          value={field.column || ''}
          onChange={onChangeColumn}
        >
          <option value={1}>Full width</option>
          <option value={2}>Half width</option>
          <option value={3}>1/3 width</option>
          <option value={4}>1/4 width</option>
        </FormControl>
      </FormGroup>
    );
  }

  renderHtml() {
    const { field } = this.state;

    if (field.type !== 'html') {
      return;
    }

    return (
      <FormGroup>
        <ControlLabel htmlFor="html">HTML:</ControlLabel>
        <EditorCK
          content={field.content || ''}
          toolbar={[
            {
              name: 'basicstyles',
              items: [
                'Source',
                'Bold',
                'Italic',
                'NumberedList',
                'BulletedList',
                'Link',
                'Unlink',
                '-',
                'Image',
                'EmojiPanel'
              ]
            }
          ]}
          autoFocus={true}
          autoGrow={true}
          autoGrowMinHeight={160}
          onChange={this.onEditorChange}
          name={`html_${field._id}`}
        />
      </FormGroup>
    );
  }

  renderCustomProperty() {
    const { selectedOption, group } = this.state;

    if (group === '') {
      return;
    }

    return (
      <>
        <FormGroup>
          <SelectProperty
            queryParams={{ type: group }}
            defaultValue={selectedOption && selectedOption.value}
            description="Any data collected through this field will copy to:"
            onChange={this.onPropertyChange}
          />
        </FormGroup>
      </>
    );
  }

  render() {
    const { mode, field, onCancel } = this.props;

    return (
      <Modal
        show={true}
        size="xl"
        onHide={onCancel}
        animation={false}
        enforceFocus={false}
      >
        <Modal.Header closeButton={true}>
          <Modal.Title>
            {mode === 'create' ? 'Add' : 'Edit'} {field.type} field
          </Modal.Title>
        </Modal.Header>
        <Modal.Body id="ModalBody" className="md-padding">
          {this.renderContent()}
        </Modal.Body>
      </Modal>
    );
  }
}

export default FieldForm;
