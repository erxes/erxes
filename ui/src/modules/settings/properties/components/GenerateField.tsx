import Datetime from '@nateradebaugh/react-datetime';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import Uploader from 'modules/common/components/Uploader';
import SelectCustomers from '../../../customers/containers/common/SelectCustomers';
import { IAttachment } from 'modules/common/types';
import {
  COMPANY_BUSINESS_TYPES,
  COMPANY_INDUSTRY_TYPES,
  COUNTRIES
} from 'modules/companies/constants';
import React from 'react';
import { LogicIndicator, SelectInput, ObjectList } from '../styles';
import { IField, ILocationOption } from '../types';
import Select from 'react-select-plus';
import { IOption } from 'erxes-ui/lib/types';
import ModifiableList from 'modules/common/components/ModifiableList';
import { __ } from 'erxes-ui/lib/utils/core';
import { FieldStyle, SidebarCounter, SidebarList } from 'modules/layout/styles';
import { MapContainer, Marker, CircleMarker, Popup } from 'react-leaflet';
import ReactLeafletGoogleLayer from 'react-leaflet-google-layer';
import { FullscreenControl } from 'react-leaflet-fullscreen';
import 'react-leaflet-fullscreen/dist/styles.css';
import { IConfig } from 'modules/settings/general/types';
import { Alert } from 'erxes-ui';

type Props = {
  field: IField;
  configs: IConfig[];
  onValueChange?: (data: { _id: string; value: any }) => void;
  defaultValue?: any;
  hasLogic?: boolean;
};

type State = {
  value?: any;
  checkBoxValues: any[];
  errorCounter: number;
  currentLocation?: ILocationOption;
  googleMapApiKey: string;
};

export default class GenerateField extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const config = props.configs.find(e => e.code === 'GOOGLE_MAP_API_KEY');

    this.state = {
      errorCounter: 0,
      ...this.generateState(props),
      googleMapApiKey: config ? config.value : ''
    };
  }

  componentDidMount() {
    const onSuccess = (position: { coords: any }) => {
      const coordinates = position.coords;

      this.setState({
        currentLocation: {
          lat: coordinates.latitude,
          lng: coordinates.longitude
        }
      });
    };

    const onError = (err: { code: any; message: any }) => {
      return Alert.error(`${err.code}): ${err.message}`);
    };

    if (navigator.geolocation) {
      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        if (result.state === 'granted') {
          navigator.geolocation.getCurrentPosition(onSuccess);
        } else if (result.state === 'prompt') {
          navigator.geolocation.getCurrentPosition(onSuccess, onError, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          });
        }
      });
    }
  }

  generateState = props => {
    const { field, defaultValue } = props;

    const state = { value: defaultValue, checkBoxValues: [] };

    if (defaultValue && field.type === 'check') {
      state.checkBoxValues = defaultValue;
    }

    return state;
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.defaultValue !== this.props.defaultValue) {
      this.setState(this.generateState(nextProps));
    }
  }

  renderSelect(options: string[] = [], attrs = {}) {
    return (
      <FormControl componentClass="select" {...attrs}>
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </FormControl>
    );
  }

  renderMultiSelect(options: string[] = [], attrs) {
    const onChange = (ops: IOption[]) => {
      const { field, onValueChange } = this.props;

      if (onValueChange) {
        const value = ops.map(e => e.value).toString();
        this.setState({ value });

        onValueChange({ _id: field._id, value });
      }
    };
    return (
      <Select
        value={attrs.value}
        options={options.map(e => ({ value: e, label: e }))}
        onChange={onChange}
        multi={true}
      />
    );
  }

  renderInput(attrs, hasError?: boolean) {
    let { value, errorCounter } = this.state;
    let checkBoxValues = this.state.checkBoxValues || [];
    const { type } = this.props.field;
    let { validation } = this.props.field;

    if (hasError) {
      value = '';
      checkBoxValues = [];
      this.setState({ value, checkBoxValues });
    }

    attrs.type = 'text';

    attrs.onChange = e => {
      this.setState({ value: e.target.value });
      this.onChange(e, attrs.option);
    };

    if (type === 'radio') {
      attrs.type = 'radio';
      attrs.componentClass = 'radio';
      attrs.checked = String(value) === attrs.option;
    }

    if (type === 'hasAuthority') {
      attrs.type = 'radio';
      attrs.componentClass = 'radio';
      attrs.checked = String(value) === attrs.option;
    }

    if (type && type.includes('isSubscribed')) {
      attrs.type = 'radio';
      attrs.componentClass = 'radio';
      attrs.checked = String(value) === attrs.option;
    }

    if (type === 'check') {
      attrs.type = 'checkbox';
      attrs.componentClass = 'checkbox';
      attrs.checked = checkBoxValues.includes(attrs.option);
    }

    if (type === 'birthDate') {
      validation = 'date';
    }

    if (validation === 'datetime') {
      attrs.max = '9999-12-31';

      // redefine onChange since date chooser returns the value, not event
      attrs.onChange = val => {
        this.setState({ value: val });
        this.onChange(val, val);
      };

      return (
        <Datetime
          {...attrs}
          value={value}
          dateFormat="YYYY/MM/DD"
          timeFormat="HH:mm"
          closeOnSelect={true}
        />
      );
    }

    if (validation === 'date') {
      attrs.max = '9999-12-31';

      // redefine onChange since date chooser returns the value, not event
      attrs.onChange = val => {
        this.setState({ value: val });
        this.onChange(val, val);
      };

      return (
        <Datetime
          {...attrs}
          value={value}
          dateFormat="YYYY/MM/DD"
          timeFormat={false}
          closeOnSelect={true}
        />
      );
    }

    if (validation === 'number') {
      attrs.type = 'number';
    }

    if (hasError && errorCounter < 10) {
      errorCounter = errorCounter + 1;

      this.setState({ errorCounter });
    }

    return <FormControl {...attrs} />;
  }

  renderTextarea(attrs) {
    return <FormControl componentClass="textarea" {...attrs} />;
  }

  renderRadioOrCheckInputs(options, attrs, hasError?: boolean) {
    return (
      <div>
        {options.map((option, index) => (
          <SelectInput key={index}>
            {this.renderInput({ ...attrs, option }, hasError)}
            <span>{option}</span>
          </SelectInput>
        ))}
      </div>
    );
  }

  renderFile({ id, value }) {
    const onChangeFile = (attachments: IAttachment[]) => {
      const { onValueChange } = this.props;

      if (onValueChange) {
        this.setState({ value: attachments });

        onValueChange({ _id: id, value: attachments });
      }
    };

    return (
      <Uploader
        defaultFileList={value || []}
        onChange={onChangeFile}
        multiple={true}
        single={false}
      />
    );
  }

  renderCustomer({ id, value }) {
    const onSelect = e => {
      const { onValueChange } = this.props;

      if (onValueChange) {
        this.setState({ value: e });

        onValueChange({ _id: id, value: e });
      }
    };

    return (
      <SelectCustomers
        label="Filter by customers"
        name="customerIds"
        multi={false}
        initialValue={value}
        onSelect={onSelect}
      />
    );
  }

  renderHtml() {
    const { content } = this.props.field;
    return (
      <div
        dangerouslySetInnerHTML={{
          __html: content || ''
        }}
      />
    );
  }

  renderList(attrs) {
    let options = [];
    if (attrs.value && attrs.value.length > 0) {
      options = attrs.value.split(',') || [];
    }

    const onChange = ops => {
      const { field, onValueChange } = this.props;

      if (onValueChange) {
        const value = ops.toString();

        this.setState({ value });

        onValueChange({ _id: field._id, value });
      }
    };

    return (
      <ModifiableList
        options={options}
        onChangeOption={onChange}
        addButtonLabel={__('Add a value')}
        showAddButton={true}
      />
    );
  }

  renderObject(object: any, index: number) {
    const entries = Object.entries(object);

    return (
      <SidebarList className="no-hover" key={index}>
        {entries.map(e => {
          const key = e[0];
          const value: any = e[1] || '';

          return (
            <li key={key}>
              <FieldStyle>{key}:</FieldStyle>
              <SidebarCounter>{value}</SidebarCounter>
            </li>
          );
        })}
      </SidebarList>
    );
  }

  renderObjectList(attrs) {
    let { value = [] } = attrs;

    if (typeof value === 'string' && value.length > 0) {
      try {
        value = JSON.parse(value);
      } catch {
        value = [];
      }
    }

    return (
      <ObjectList>
        {(value || []).map((object, index) => this.renderObject(object, index))}
      </ObjectList>
    );
  }

  renderMap(attrs) {
    const { field, onValueChange } = this.props;

    const { currentLocation, googleMapApiKey } = this.state;

    const { locationOptions = [] } = field;

    const dragend = e => {
      const location = e.target.getLatLng();
      if (onValueChange) {
        onValueChange({ _id: field._id, value: location });
      }
    };

    const { value } = attrs;
    let centerCoordinates: [number, number] = [0, 0];

    if (currentLocation) {
      centerCoordinates = [currentLocation.lat, currentLocation.lng];
    }

    if (value && value.length !== 0) {
      centerCoordinates = value;
    }

    let zoom = 10;

    if (centerCoordinates[0] === 0 && centerCoordinates[1] === 0) {
      zoom = 2;
    }

    return (
      <MapContainer
        style={{ width: '100%', aspectRatio: '1/1' }}
        zoom={zoom}
        center={centerCoordinates}
      >
        <ReactLeafletGoogleLayer
          apiKey={googleMapApiKey}
          useGoogMapsLoader={true}
        />
        <FullscreenControl />

        {locationOptions.map((option, index) => (
          <div key={index}>
            <CircleMarker key={index} center={[option.lat, option.lng]}>
              <Popup>{option.description}</Popup>
            </CircleMarker>
          </div>
        ))}

        <Marker
          draggable={true}
          position={centerCoordinates}
          eventHandlers={{ dragend }}
        />
      </MapContainer>
    );
  }

  /**
   * Handle all types of fields changes
   * @param {Object} e - Event object
   * @param {String} optionValue - per radio button or checkbox value
   */
  onChange = (e, optionValue) => {
    const { field, onValueChange } = this.props;
    const { validation, type } = field;

    if (!e.target && !optionValue) {
      return;
    }

    let value = optionValue || e.target.value;

    if (validation === 'number') {
      value = Number(value);
    }

    if (type === 'check') {
      let checkBoxValues = this.state.checkBoxValues;
      const isChecked = e.target.checked;
      // if selected value is not already in list then add it
      if (isChecked && !checkBoxValues.includes(optionValue)) {
        checkBoxValues.push(optionValue);
      }

      // remove option from checked list
      if (!isChecked) {
        checkBoxValues = checkBoxValues.filter(v => v !== optionValue);
      }

      this.setState({ checkBoxValues });

      value = checkBoxValues;
    }

    if (onValueChange) {
      this.setState({ value });

      onValueChange({ _id: field._id, value });
    }
  };

  renderControl() {
    const { field } = this.props;
    const { type } = field;
    const options = field.options || [];

    const attrs = {
      id: field._id,
      value: this.state.value,
      onChange: this.onChange,
      name: ''
    };

    const boolOptions = ['Yes', 'No'];

    switch (type) {
      case 'select':
        return this.renderSelect(options, attrs);

      case 'multiSelect':
        return this.renderMultiSelect(options, attrs);

      case 'pronoun':
        return this.renderSelect(['Male', 'Female', 'Not applicable'], attrs);

      case 'check':
        try {
          return this.renderRadioOrCheckInputs(options, attrs);
        } catch {
          return this.renderRadioOrCheckInputs(options, attrs, true);
        }

      case 'radio':
        attrs.name = Math.random().toString();
        try {
          return this.renderRadioOrCheckInputs(options, attrs);
        } catch {
          return this.renderRadioOrCheckInputs(options, attrs, true);
        }

      case 'hasAuthority':
        attrs.name = Math.random().toString();
        try {
          return this.renderRadioOrCheckInputs(boolOptions, attrs);
        } catch {
          return this.renderRadioOrCheckInputs(boolOptions, attrs, true);
        }

      case 'isSubscribed':
        attrs.name = Math.random().toString();
        try {
          return this.renderRadioOrCheckInputs(boolOptions, attrs);
        } catch {
          return this.renderRadioOrCheckInputs(boolOptions, attrs, true);
        }

      case 'company_isSubscribed':
        attrs.name = Math.random().toString();
        try {
          return this.renderRadioOrCheckInputs(boolOptions, attrs);
        } catch {
          return this.renderRadioOrCheckInputs(boolOptions, attrs, true);
        }

      case 'textarea':
        return this.renderTextarea(attrs);

      case 'description':
        return this.renderTextarea(attrs);

      case 'company_description':
        return this.renderTextarea(attrs);

      case 'file': {
        return this.renderFile(attrs);
      }

      case 'avatar': {
        return this.renderFile(attrs);
      }

      case 'company_avatar': {
        return this.renderFile(attrs);
      }

      case 'industry': {
        return this.renderSelect(COMPANY_INDUSTRY_TYPES(), attrs);
      }

      case 'location': {
        return this.renderSelect(COUNTRIES, attrs);
      }

      case 'businessType': {
        return this.renderSelect(COMPANY_BUSINESS_TYPES, attrs);
      }

      case 'html': {
        return this.renderHtml();
      }

      case 'customer': {
        return this.renderCustomer(attrs);
      }

      case 'list': {
        return this.renderList(attrs);
      }

      case 'objectList': {
        return this.renderObjectList(attrs);
      }

      case 'map': {
        return this.renderMap(attrs);
      }

      default:
        try {
          return this.renderInput(attrs);
        } catch {
          return this.renderInput(attrs, true);
        }
    }
  }

  render() {
    const { field, hasLogic } = this.props;

    return (
      <FormGroup>
        <ControlLabel ignoreTrans={true} required={field.isRequired}>
          {field.text}
        </ControlLabel>
        {hasLogic && <LogicIndicator>Logic</LogicIndicator>}
        {field.description ? <p>{field.description}</p> : null}

        {this.renderControl()}
      </FormGroup>
    );
  }
}
