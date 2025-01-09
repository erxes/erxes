import { Alert, __, loadDynamicComponent } from '@erxes/ui/src/utils';
import { Dialog, Transition } from '@headlessui/react';
import {
  DialogContent,
  DialogWrapper,
  ModalFooter,
  ModalOverlay,
} from '@erxes/ui/src/styles/main';
import {
  FlexRow,
  LeftSection,
  Preview,
  PreviewSection,
  ShowPreview,
} from '../styles';
import { IField, IFieldLogic, IOption } from '@erxes/ui/src/types';

import Button from '@erxes/ui/src/components/Button';
import CollapseContent from '@erxes/ui/src/components/CollapseContent';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FieldLogics from './FieldLogics';
import FieldPreview from './FieldPreview';
import { FlexItem } from '@erxes/ui/src/components/step/styles';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import GroupedField from './GroupedField';
import { IProductCategory } from '@erxes/ui-products/src/types';
import Icon from '@erxes/ui/src/components/Icon';
import LocationOptions from './LocationOptions';
import ObjectListConfigs from './ObjectListConfigs';
import React from 'react';
import { RichTextEditor } from '@erxes/ui/src/components/richTextEditor/TEditor';
import Select from 'react-select';
import SelectProperty from '@erxes/ui-forms/src/settings/properties/containers/SelectProperty';
import Toggle from '@erxes/ui/src/components/Toggle';
import { isEnabled } from '@erxes/ui/src/utils/core';
import { stringToRegex } from '../../settings/properties/utils';
import SelectProductCategory from '@erxes/ui-products/src/containers/form/SelectProductCategory';

type Props = {
  onSubmit: (field: IField) => void;
  onDelete: (field: IField) => void;
  onCancel: () => void;
  mode: 'create' | 'update';
  field: IField;
  fields: IField[];
  numberOfPages: number;
  productCategories?: IProductCategory[];
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
      label: field.associatedField.text,
    };

    let group =
      (field.associatedField && field.associatedField.contentType) || '';

    if (field.type.includes('customerLinks')) {
      group = 'customer';
    }

    if (field.type.includes('companyLinks')) {
      group = 'company';
    }

    this.state = {
      field,
      selectedOption,
      group,
    };
  }

  onFieldChange = (
    name: string,
    value: string | boolean | number | string[] | number[] | IFieldLogic[]
  ) => {
    this.setFieldAttrChanges(name, value);
  };

  onEditorChange = (content: string) => {
    const field = { ...this.state.field };
    field.content = content;
    this.setState({ field });
  };

  onDescChange = (content: string) => {
    const { field } = this.state;
    this.setState({ field: { ...field, description: content } });
  };

  onPropertyGroupChange = (e) => {
    this.setState({
      group: (e.currentTarget as HTMLInputElement).value,
    });
  };

  onChangeLocation = (options) => {
    this.setFieldAttrChanges('locationOptions', options);
  };

  onChangeObjectListConfig = (objectListConfigs) => {
    this.setFieldAttrChanges('objectListConfigs', objectListConfigs);
  };

  onPropertyChange = (selectedField: IField) => {
    const { field, group } = this.state;

    field.associatedFieldId = selectedField._id;
    field.associatedField = {
      _id: selectedField._id,
      text: selectedField.text || '',
      contentType: group || '',
    };

    field.validation = selectedField.validation;
    field.options = selectedField.options;
    field.type = selectedField.type;
    field.text = selectedField.text;
    field.description = selectedField.description;

    if (group === 'core:company') {
      switch (field.type) {
        case 'avatar':
          field.type = 'company_avatar';
          break;
        case 'description':
          field.type = 'company_description';
          break;
        case 'isSubscribed':
          field.type = 'company_isSubscribed';
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
        label: selectedField.text || '',
      },
    });
  };

  onRegexChange = (e: any) => {
    if (e.target.value.length === 0) {
      this.setState({
        field: {
          ...this.state.field,
          regexValidation: '',
        },
      });
      return;
    }

    const regexPattern = stringToRegex(e.target.value);

    this.setState({
      field: {
        ...this.state.field,
        regexValidation: regexPattern,
      },
    });
  };

  onSubmit = (e) => {
    e.persist();

    const { field } = this.state;

    if (field.type !== 'html' && !field.text?.length) {
      return Alert.error(__('Label is required!'));
    }

    this.props.onSubmit(field);
  };

  setFieldAttrChanges(
    attributeName: string,
    value: string | boolean | number | string[] | number[] | IFieldLogic[]
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

    const validation = (e) => {
      const value = (e.currentTarget as HTMLInputElement).value;
      this.onFieldChange(
        'validation',
        (e.currentTarget as HTMLInputElement).value
      );
    };

    return (
      <FormGroup>
        <ControlLabel htmlFor='validation'>Validation:</ControlLabel>

        <FormControl
          id='validation'
          componentclass='select'
          value={field.validation || ''}
          onChange={validation}
        >
          <option />
          <option value='email'>{__('Email')}</option>
          <option value='number'>{__('Number')}</option>
          <option value='datetime'>{__('Date Time')}</option>
          <option value='date'>{__('Date')}</option>
          <option value='phone'>{__('Phone')}</option>
          <option value='regex'>{__('Regular Expression')}</option>
        </FormControl>

        {field.validation === 'regex' && (
          <>
            <FormControl
              id='regex'
              placeholder='Enter sample text here'
              componentclass='input'
              onChange={this.onRegexChange}
            />
            {field.regexValidation && (
              <p>RegexPattern: {field.regexValidation || ''}</p>
            )}
          </>
        )}
      </FormGroup>
    );
  }

  renderOptions() {
    const { field } = this.state;

    const onChange = (e) =>
      this.onFieldChange(
        'options',
        (e.currentTarget as HTMLInputElement).value.split('\n')
      );

    if (!['select', 'check', 'radio', 'multiSelect'].includes(field.type)) {
      return null;
    }

    return (
      <FormGroup>
        <ControlLabel htmlFor='type'>Options:</ControlLabel>

        <FormControl
          id='options'
          componentclass='textarea'
          value={(field.options || []).join('\n')}
          onChange={onChange}
        />
      </FormGroup>
    );
  }

  renderLocationOptions() {
    const { field } = this.state;

    if (field.type !== 'map') {
      return null;
    }

    return (
      <FormGroup>
        <ControlLabel htmlFor='locationOptions'>Options:</ControlLabel>
        <LocationOptions
          locationOptions={field.locationOptions || []}
          onChange={this.onChangeLocation}
        />
      </FormGroup>
    );
  }

  renderExtraButton() {
    const { mode, field } = this.props;

    if (mode === 'create') {
      return null;
    }

    const onDelete = (e) => {
      e.preventDefault();
      this.props.onDelete(field);
    };

    return (
      <Button btnStyle='danger' onClick={onDelete} icon='minus-circle-1'>
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

    const onChange = (e) => {
      field.type = e.target.checked ? 'multiSelect' : 'select';
      this.setState({ field });
    };

    return (
      <FormGroup>
        <FlexRow>
          <ControlLabel htmlFor='description'>
            {__('Select multiple values')}
          </ControlLabel>
          <Toggle
            defaultChecked={field.type === 'multiSelect'}
            icons={{
              checked: <span>Yes</span>,
              unchecked: <span>No</span>,
            }}
            onChange={onChange}
          />
        </FlexRow>
      </FormGroup>
    );
  }

  renderObjectListOptions() {
    const { field } = this.state;

    if (field.type !== 'objectList') {
      return null;
    }

    return (
      <FormGroup>
        <ControlLabel htmlFor='objectListConfigs'>
          Object List Configs:
        </ControlLabel>
        <ObjectListConfigs
          objectListConfigs={field.objectListConfigs || []}
          onChange={this.onChangeObjectListConfig}
        />
      </FormGroup>
    );
  }

  renderOptionsValue() {
    const { field } = this.state;
    const { optionsValues } = this.props.field;

    const handleChange = (e) => {
      const { value } = e.currentTarget as HTMLInputElement;

      this.onFieldChange('optionsValues', value);
    };

    if (['select', 'radio'].includes(field.type)) {
      return (
        <CollapseContent title={__('Field Value')}>
          <FormGroup>
            <ControlLabel>{__('Value')}</ControlLabel>
            <FormControl
              id='FieldValue'
              componentclass='textarea'
              defaultValue={optionsValues}
              onChange={handleChange}
            />
          </FormGroup>
        </CollapseContent>
      );
    }
  }

  renderPageSelect() {
    const { numberOfPages } = this.props;
    const { field } = this.state;

    if (numberOfPages === 1) {
      return null;
    }

    const options: Array<{ label: number; value: number }> = [];

    for (let i = 0; i < numberOfPages; i++) {
      options.push({ label: i + 1, value: i + 1 });
    }

    const onChange = (option) => {
      this.onFieldChange('pageNumber', option.value);
    };

    return (
      <FormGroup>
        <ControlLabel htmlFor='pageNumber'>Page number</ControlLabel>
        <Select
          required={true}
          value={options.find(
            (option) => option.value === (field.pageNumber || 1)
          )}
          onChange={onChange}
          options={options}
          isClearable={false}
        />
      </FormGroup>
    );
  }

  renderProductField() {
    const { field } = this.state;

    return (
      <SelectProductCategory field={field} onChange={this.onFieldChange} />
    );
  }

  renderGroupedField() {
    const { fields } = this.props;
    const { field } = this.state;

    const onChange = (value) => {
      this.setState({ field: value });
    };

    if (field.type !== 'parentField') {
      return null;
    }

    return <GroupedField field={field} fields={fields} onChange={onChange} />;
  }

  renderLeftContent() {
    const { fields } = this.props;
    const { field } = this.state;

    const text = (e) =>
      this.onFieldChange('text', (e.currentTarget as HTMLInputElement).value);

    const toggle = (e) =>
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
            <ControlLabel
              htmlFor='text'
              required={(field.type || '') !== 'html' ? true : false}
            >
              Field Label
            </ControlLabel>

            <FormControl
              id='FieldLabel'
              type='text'
              value={field.text || ''}
              onChange={text}
              autoFocus={true}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel htmlFor='description'>Field description</ControlLabel>
            <RichTextEditor
              content={field.description || ''}
              toolbar={[
                'source',
                'bold',
                'italic',
                'orderedList',
                'bulletList',
                'link',
                'unlink',
                '|',
                'image',
              ]}
              autoGrow={true}
              autoGrowMinHeight={120}
              onChange={this.onDescChange}
              name={`html_${field._id}`}
            />
          </FormGroup>

          {this.renderPageSelect()}

          {this.renderValidation()}

          <FormGroup>
            <FlexRow>
              <ControlLabel htmlFor='description'>
                {__('Field is required')}
              </ControlLabel>
              <Toggle
                defaultChecked={field.isRequired || false}
                icons={{
                  checked: <span>Yes</span>,
                  unchecked: <span>No</span>,
                }}
                onChange={toggle}
              />
            </FlexRow>
            {isEnabled('payment') && field.type === 'productCategory' && (
              <p>
                {__('If you need to enable payment, field must be required!')}
              </p>
            )}
          </FormGroup>

          {this.renderGroupedField()}

          {this.renderOptions()}

          {this.renderLocationOptions()}

          {this.renderMultipleSelectCheckBox()}

          {this.renderObjectListOptions()}

          {this.renderColumn()}
          {this.renderProductField()}
          {this.renderHtml()}
          {this.renderCustomPropertyGroup()}
          {this.renderCustomProperty()}
        </CollapseContent>
        {fields.length > 0 && (
          <CollapseContent title={__('Logic')} compact={true}>
            <FieldLogics
              fields={fields.filter(
                (f) => !(field.subFieldIds || []).includes(f._id)
              )}
              currentField={field}
              onFieldChange={this.onFieldChange}
            />
          </CollapseContent>
        )}
        {this.renderOptionsValue()}
      </>
    );
  }

  renderContent() {
    const { mode, onCancel } = this.props;
    const { field } = this.state;

    return (
      <FlexItem>
        <LeftSection>
          {this.renderLeftContent()}

          <ModalFooter>
            <Button
              btnStyle='simple'
              type='button'
              icon='times-circle'
              onClick={onCancel}
            >
              Cancel
            </Button>

            {this.renderExtraButton()}

            <Button
              onClick={this.onSubmit}
              btnStyle='success'
              icon={mode === 'update' ? 'check-circle' : 'plus-circle'}
            >
              {mode === 'update' ? 'Save' : 'Add to Form'}
            </Button>
          </ModalFooter>
        </LeftSection>

        <PreviewSection>
          <Preview>
            <FieldPreview field={field} otherFields={this.props.fields} />

            <ShowPreview>
              <Icon icon='eye' /> {__('Field preview')}
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
        'middleName',
        'companyName',
        'companyEmail',
        'companyPhone',
        'html',
        'productCategory',
        'parentField',
      ].includes(field.type)
    ) {
      return null;
    }

    return (
      <>
        <FormGroup>
          <ControlLabel>Property type:</ControlLabel>
          <FormControl
            id='propertyGroup'
            componentclass='select'
            defaultValue={group}
            onChange={this.onPropertyGroupChange}
          >
            <option value={''} />
            <option value={'core:customer'}>Customer</option>
            <option value={'core:company'}>Company</option>
          </FormControl>
        </FormGroup>
      </>
    );
  }

  renderProductCategory() {
    const { field } = this.state;
    const { productCategories = [] } = this.props;

    if (field.type !== 'productCategory') {
      return null;
    }

    const onCategoryChange = (e) => {
      this.onFieldChange(
        'productCategoryId',
        (e.currentTarget as HTMLInputElement).value
      );
    };

    return (
      <>
        <FormGroup>
          <ControlLabel>Categories:</ControlLabel>
          <FormControl
            id='productCategories'
            componentclass='select'
            defaultValue={field.productCategoryId || ''}
            onChange={onCategoryChange}
          >
            <option>-</option>
            {productCategories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </FormControl>
        </FormGroup>
      </>
    );
  }

  renderColumn() {
    const { field } = this.state;

    if (['html', 'parentField'].includes(field.type)) {
      return;
    }

    const onChangeColumn = (e) =>
      this.onFieldChange(
        'column',
        parseInt((e.currentTarget as HTMLInputElement).value, 10)
      );

    return (
      <FormGroup>
        <ControlLabel htmlFor='validation'>Field width:</ControlLabel>

        <FormControl
          id='validation'
          componentclass='select'
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
        <ControlLabel htmlFor='html'>HTML:</ControlLabel>
        <RichTextEditor
          content={field.content || ''}
          toolbar={[
            'source',
            'bold',
            'italic',
            'orderedList',
            'bulletList',
            'link',
            'unlink',
            '|',
            'image',
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

    const defaultValue =
      (selectedOption && selectedOption.value) ||
      this.props.field.associatedFieldId;

    return (
      <>
        <FormGroup>
          <SelectProperty
            queryParams={{ type: group }}
            defaultValue={defaultValue}
            description='Any data collected through this field will copy to:'
            onChange={this.onPropertyChange}
          />
        </FormGroup>
      </>
    );
  }

  render() {
    const { mode, field, onCancel } = this.props;

    return (
      <Transition appear show={true} as={React.Fragment}>
        <Dialog as='div' onClose={onCancel} className={` relative z-10`}>
          <Transition.Child
            as={React.Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <ModalOverlay />
          </Transition.Child>
          <DialogWrapper>
            <DialogContent>
              <Dialog.Panel className={` dialog-size-xl`}>
                <Dialog.Title as='h3'>
                  {mode === 'create' ? 'Add' : 'Edit'} {field.type} field
                  <Icon icon='times' size={24} onClick={onCancel} />
                </Dialog.Title>
                <Transition.Child>
                  <div className='dialog-description'>
                    {this.renderContent()}
                  </div>
                </Transition.Child>
              </Dialog.Panel>
            </DialogContent>
          </DialogWrapper>
        </Dialog>
      </Transition>
    );
  }
}

export default FieldForm;
