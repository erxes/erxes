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
import { LogicIndicator, SelectInput } from '../styles';
import { IField } from '../types';
import Select from 'react-select-plus';
import { IOption } from 'erxes-ui/lib/types';

type Props = {
  field: IField;
  onValueChange?: (data: { _id: string; value: any }) => void;
  defaultValue?: any;
  hasLogic?: boolean;
};

type State = {
  value?: any;
  checkBoxValues: any[];
  errorCounter: number;
};

export default class GenerateField extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { errorCounter: 0, ...this.generateState(props) };
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
        multiple={false}
        single={true}
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

      case 'companyIsSubscribed':
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

      case 'companyDescription':
        return this.renderTextarea(attrs);

      case 'file': {
        return this.renderFile(attrs);
      }

      case 'avatar': {
        return this.renderFile(attrs);
      }

      case 'companyAvatar': {
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
