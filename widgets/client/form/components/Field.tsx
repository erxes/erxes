import * as React from 'react';

import {
  COMPANY_BUSINESS_TYPES,
  COUNTRIES,
  DEFAULT_COMPANY_INDUSTRY_TYPES,
} from '../constants';
import {
  FieldValue,
  IField,
  IFieldError,
  ILocationOption,
  IObjectListConfig,
  IProduct,
} from '../types';

import Datetime from '@nateradebaugh/react-datetime';
import MSFmultiSelect from '../multipleSelectScript';
import Map from './Map';
import Marker from './Marker';
import ObjectList from './ObjectList';
import { __ } from '../../utils';
import { connection } from '../connection';
import uploadHandler from '../../uploadHandler';
import Product from './Product';

type Props = {
  field: IField;
  error?: IFieldError;
  value?: FieldValue;
  currentLocation?: ILocationOption;
  color?: string;
  mapScriptLoaded?: boolean;
  onChange: (params: {
    fieldId: string;
    value: FieldValue;
    groupId?: string;
  }) => void;
  onQtyChange?: (qty: number) => void;
};

type State = {
  dateValue?: Date | string;
  dateTimeValue: Date | string;
  isAttachingFile?: boolean;
  multipleSelectValues?: string[];
  isMapDraggable: boolean;
  currentLocation: ILocationOption;
  value?: any;
  objectListConfigs: IObjectListConfig[];
  editing: boolean;
  qty?: number;
};

export default class Field extends React.Component<Props, State> {
  static renderSelect(options: string[] = [], attrs: any = {}) {
    return (
      <select
        {...attrs}
        className="form-control"
        id={attrs.multiple ? `_id${attrs.id}` : ''}
      >
        {options.map((option, index) => (
          <option key={index} value={option} selected={true}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  static renderInput(attrs: any) {
    return <input {...attrs} className="form-control" />;
  }

  static renderTextarea(attrs: any) {
    return <textarea {...attrs} className="form-control" />;
  }

  static renderCheckboxes(
    name: string,
    options: string[],
    id: string,
    onChange: () => void,
    value?: string
  ) {
    let values: string[] = [];
    if (value) {
      values = value.split(',,');
    }

    return (
      <div className="check-control">
        {options.map((option, index) => {
          const checked = values.indexOf(option) > -1 ? true : false;

          return (
            <div key={index}>
              <label>
                {Field.renderInput({
                  type: 'checkbox',
                  'data-option': option,
                  name,
                  id,
                  onChange,
                  checked,
                })}
                {option}
              </label>
            </div>
          );
        })}
      </div>
    );
  }

  static renderRadioButtons(
    name: string,
    options: string[],
    id: string,
    onChange: (e: React.FormEvent<HTMLInputElement>) => void,
    value?: string
  ) {
    const selectedIndex = options.indexOf(value || '');

    return (
      <div>
        {options.map((option, index) => (
          <div key={index}>
            {Field.renderInput({
              type: 'radio',
              'data-option': option,
              name,
              id,
              onChange,
              checked: index === selectedIndex,
            })}
            <span>{option}</span>
          </div>
        ))}
      </div>
    );
  }

  constructor(props: Props) {
    super(props);

    let isMapDraggable = true;

    const locationOptions = props.field.locationOptions || [];

    if (locationOptions.length > 0) {
      isMapDraggable = false;
    }

    this.state = {
      editing: false,
      dateValue: '',
      dateTimeValue: '',
      multipleSelectValues: [],
      isMapDraggable,
      currentLocation: props.currentLocation || {
        lat: 0.0,
        lng: 0.0,
      },
      objectListConfigs: [],
    };
  }

  componentDidMount() {
    const { field } = this.props;

    if (field.type === 'multiSelect' || field.type === 'industry') {
      const multiSelects = Array.from(
        document.querySelectorAll(`#_id${field._id}`)
      );

      const onChange = (checked: boolean, value: string) => {
        let multipleSelectValues = this.state.multipleSelectValues || [];

        if (multipleSelectValues) {
          if (checked) {
            multipleSelectValues.push(value);
          } else {
            multipleSelectValues = multipleSelectValues.filter(
              (e) => e === value
            );
          }
          this.onChange(multipleSelectValues.toString());
        }

        this.setState({ multipleSelectValues });
      };

      const afterSelectAll = (_checked: boolean, values: string[]) => {
        this.setState({ multipleSelectValues: values });
      };

      multiSelects.map((query) => {
        const select = new MSFmultiSelect(query, {
          theme: 'theme2',
          selectAll: true,
          searchBox: true,
          onChange,
          afterSelectAll,
        });

        const options =
          field.type === 'industry'
            ? DEFAULT_COMPANY_INDUSTRY_TYPES
            : field.options || [];

        const selectedValues: any = this.props.value || [];

        select.loadSource(
          options.map((e) => {
            const selected = selectedValues.indexOf(e) > -1 ? true : false;

            return { caption: e, value: e, selected };
          })
        );

        return select;
      });
    }
  }

  onChange = (value: FieldValue) => {
    const { onChange, field } = this.props;

    this.setState({ value });

    onChange({
      fieldId: field._id,
      value,
      groupId: field.groupId,
    });
  };

  onInputChange = (e: React.FormEvent<HTMLInputElement>) => {
    this.onChange(e.currentTarget.value);
  };

  handleFileInput = (e: React.FormEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;

    const self = this;
    const attachments: any[] = [];
    if (files && files.length > 0) {
      for (const file of Array.from(files)) {
        uploadHandler({
          file,

          beforeUpload() {
            self.setState({ isAttachingFile: true });
          },

          // upload to server
          afterUpload({ response, fileInfo }: any) {
            const attachment = { url: response, ...fileInfo };
            attachments.push(attachment);
            self.setState({ isAttachingFile: false });
          },

          onError: (message) => {
            alert(message);
            self.setState({ isAttachingFile: false });
          },
        });
      }
    }

    self.onChange(attachments);
  };

  onDateChange = (date?: Date | string) => {
    this.setState({ dateValue: date || '' });
    this.onChange(date || '');
  };

  onDateTimeChange = (date?: Date | string) => {
    this.setState({ dateTimeValue: date || '' });
    this.onChange(date || '');
  };

  onRadioButtonsChange = (e: React.FormEvent<HTMLInputElement>) => {
    this.onChange(e.currentTarget.getAttribute('data-option') || '');
  };

  onCheckboxesChange = () => {
    const values: string[] = [];
    const { field } = this.props;

    const elements = document.getElementsByName(field._id);

    // tslint:disable-next-line
    for (let i = 0; i < elements.length; i++) {
      const checkbox: any = elements[i];

      if (checkbox.checked) {
        values.push(checkbox.dataset.option);
      }
    }

    this.onChange(values.join(',,'));
  };

  onTextAreaChange = (e: React.FormEvent<HTMLTextAreaElement>) => {
    this.onChange(e.currentTarget.value);
  };

  onSelectChange = (e: React.FormEvent<HTMLSelectElement>) => {
    this.onChange(e.currentTarget.value);
  };

  onMultpleSelectChange = (e: React.FormEvent<HTMLSelectElement>) => {
    const selectedValue = e.currentTarget.value;
    const { multipleSelectValues } = this.state;
    if (multipleSelectValues) {
      if (
        multipleSelectValues.filter((value) => value === selectedValue)
          .length === 0
      ) {
        multipleSelectValues.push(selectedValue);
      }
      this.onChange(multipleSelectValues);
    }

    this.setState({ multipleSelectValues });
  };

  onLocationChange = (option: ILocationOption) => {
    this.onChange(option || '');
  };

  renderDatepicker(id: string) {
    let defaultValue = new Date();

    if (this.props.value) {
      defaultValue = new Date(String(this.props.value));
    }

    return (
      <Datetime
        inputProps={{ id }}
        value={this.state.dateValue}
        viewDate={new Date()}
        defaultValue={defaultValue}
        onChange={this.onDateChange}
        dateFormat="YYYY/MM/DD"
        timeFormat={false}
      />
    );
  }

  renderHtml(content: string, id: string) {
    return (
      <div
        id={id}
        dangerouslySetInnerHTML={{
          __html: content,
        }}
      />
    );
  }

  renderDateTimepicker(id: string) {
    let defaultValue = new Date();

    if (this.props.value) {
      defaultValue = new Date(String(this.props.value));
    }

    return (
      <Datetime
        inputProps={{ id }}
        value={this.state.dateTimeValue}
        viewDate={new Date()}
        defaultValue={defaultValue}
        onChange={this.onDateTimeChange}
        timeFormat="HH:mm"
        dateFormat="YYYY/MM/DD"
      />
    );
  }

  renderMap(field: IField, selectedValue?: FieldValue) {
    const locationOptions: ILocationOption[] = field.locationOptions || [];
    let { currentLocation } = this.state;

    let selectedOption: ILocationOption = { lat: 0, lng: 0 };

    if (selectedValue) {
      selectedOption = selectedValue as ILocationOption;
      currentLocation = {
        lat: selectedOption.lat,
        lng: selectedOption.lng,
      };
    }

    return (
      <div style={{ height: '250px', width: '100%' }}>
        {this.props.mapScriptLoaded && (
          <Map
            center={
              new google.maps.LatLng(currentLocation.lat, currentLocation.lng)
            }
            controlSize={25}
            streetViewControl={false}
            zoom={4}
            style={{ width: '100%', height: '250px' }}
          >
            {locationOptions.length > 0 ? (
              locationOptions.map((option, index) => (
                <Marker
                  color={
                    option.lat === selectedOption.lat &&
                    option.lng === selectedOption.lng
                      ? 'red'
                      : this.props.color
                  }
                  key={index}
                  position={new google.maps.LatLng(option.lat, option.lng)}
                  content={option.description}
                  draggable={false}
                  onChange={this.onLocationChange}
                />
              ))
            ) : (
              <Marker
                color={this.props.color}
                position={
                  new google.maps.LatLng(
                    currentLocation.lat,
                    currentLocation.lng
                  )
                }
                content={__('Select your location')}
                draggable={true}
                onChange={this.onLocationChange}
              />
            )}
          </Map>
        )}
      </div>
    );
  }

  renderProduct(field: IField) {
    const { products = [] } = field;

    const onChangeProduct = (quantity: number, product?: IProduct) => {
      if (!product) {
        return;
      }

      this.onChange({product, quantity});
    };

    return <Product products={products as any} onChange={onChangeProduct as any} />;
  }

  renderObjectList(objectListConfigs: any, attrs: any) {
    let { value = [] } = attrs;

    if (typeof value === 'string' && value.length > 0) {
      try {
        value = JSON.parse(value);
      } catch {
        value = [];
      }
    }

    const onChange = (values: any[]) => {
      this.setState({ value });
      this.onChange(values);
    };

    return (
      <>
        <ObjectList
          objectListConfigs={objectListConfigs}
          value={value}
          onChange={onChange}
          isEditing={this.state.editing}
        />
      </>
    );
  }

  renderControl() {
    const { field, value } = this.props;
    const { options = [], validation = 'text' } = field;
    const name = field._id;

    const attrs = {
      id: field._id,
      value: this.state.objectListConfigs,
      onChange: this.onChange,
      name: '',
    };

    if (validation === 'date') {
      return (
        <div className="date-input">{this.renderDatepicker(field._id)} </div>
      );
    }

    if (validation === 'datetime') {
      return (
        <div className="date-input">
          {this.renderDateTimepicker(field._id)}{' '}
        </div>
      );
    }

    switch (field.type) {
      case 'select':
        return Field.renderSelect(options, {
          onChange: this.onSelectChange,
          id: field._id,
          value: String(value),
        });

      case 'multiSelect':
        return Field.renderSelect(options, {
          value: this.state.multipleSelectValues,
          onChange: this.onMultpleSelectChange,
          id: field._id,
          multiple: true,
        });

      case 'pronoun':
        return Field.renderSelect(['Male', 'Female', 'Not applicable'], {
          onChange: this.onSelectChange,
          id: field._id,
          value: String(value),
        });

      case 'businessType':
        return Field.renderSelect(COMPANY_BUSINESS_TYPES, {
          onChange: this.onSelectChange,
          id: field._id,
          value: String(value),
        });

      case 'location':
        return Field.renderSelect(COUNTRIES, {
          onChange: this.onSelectChange,
          id: field._id,
          value: String(value),
        });

      case 'industry':
        return Field.renderSelect(DEFAULT_COMPANY_INDUSTRY_TYPES, {
          value: this.state.multipleSelectValues,
          onChange: this.onMultpleSelectChange,
          id: field._id,
          multiple: true,
        });

      case 'check':
        const values: any = value;

        return Field.renderCheckboxes(
          name,
          options,
          field._id,
          this.onCheckboxesChange,
          values
        );

      case 'radio':
        return Field.renderRadioButtons(
          name,
          options,
          field._id,
          this.onRadioButtonsChange,
          String(value)
        );

      case 'isSubscribed':
        return Field.renderRadioButtons(
          name,
          ['Yes', 'No'],
          field._id,
          this.onRadioButtonsChange,
          String(value)
        );

      case 'company_isSubscribed':
        return Field.renderRadioButtons(
          name,
          ['Yes', 'No'],
          field._id,
          this.onRadioButtonsChange,
          String(value)
        );

      case 'hasAuthority':
        return Field.renderRadioButtons(
          name,
          ['Yes', 'No'],
          field._id,
          this.onRadioButtonsChange,
          String(value)
        );

      case 'file':
        return Field.renderInput({
          onChange: this.handleFileInput,
          type: 'file',
          id: field._id,
          multiple: true,
        });

      case 'avatar':
        return Field.renderInput({
          onChange: this.handleFileInput,
          type: 'file',
          id: field._id,
        });

      case 'company_avatar':
        return Field.renderInput({
          onChange: this.handleFileInput,
          type: 'file',
          id: field._id,
        });

      case 'textarea':
        return Field.renderTextarea({
          onChange: this.onTextAreaChange,
          id: field._id,
          value,
        });

      case 'description':
        return Field.renderTextarea({
          onChange: this.onTextAreaChange,
          id: field._id,
          value,
        });

      case 'company_description':
        return Field.renderTextarea({
          onChange: this.onTextAreaChange,
          id: field._id,
          value,
        });

      case 'birthDate':
        return this.renderDatepicker(field._id);

      case 'html':
        return this.renderHtml(field.content || '', field._id);

      case 'map':
        return this.renderMap(field, value);

      case 'productCategory':
        if (!connection.enabledServices.products) {
          return null;
        }

        return this.renderProduct(field);

      case 'objectList':
        return this.renderObjectList(field.objectListConfigs, attrs);

      default:
        return Field.renderInput({
          onChange: this.onInputChange,
          type: validation,
          id: field._id,
          value,
        });
    }
  }

  renderAddButton() {
    const { field } = this.props;
    const { objectListConfigs = [] } = field;

    if (field.type !== 'objectList' || !field.objectListConfigs) {
      return null;
    }

    const onClick = () => {
      const object = objectListConfigs.reduce(
        (previousValue: any, currentValue: any) => {
          previousValue[`${currentValue.key}`] = '';

          return previousValue;
        },
        {}
      );

      const objectListValue = this.state.objectListConfigs || [];
      this.setState({
        objectListConfigs: [object, ...objectListValue],
      });
    };

    return (
      <button onClick={onClick} type="button">
        add value
      </button>
    );
  }

  render() {
    const { field, error } = this.props;
    const { isAttachingFile } = this.state;

    const fieldStyle = () => {
      if (field.column) {
        return {
          width: `${100 / field.column}%`,
          display: 'inline-block',
        };
      }
    };

    return (
      <div className="form-group" style={fieldStyle()}>
        <label className="control-label" htmlFor={`field-${field._id}`}>
          {field.text}
          {field.isRequired ? <span className="required">*</span> : null}
        </label>

        <span className="error">{error && error.text}</span>

        {field.description ? (
          <div
            className="description"
            dangerouslySetInnerHTML={{ __html: field.description }}
          />
        ) : null}

        {this.renderAddButton()}

        {this.renderControl()}

        {isAttachingFile ? <div className="loader" /> : null}
      </div>
    );
  }
}
