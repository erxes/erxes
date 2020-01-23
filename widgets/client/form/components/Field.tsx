import * as moment from "moment";
import * as React from "react";
import DatePicker from "react-datepicker";
import { FieldValue, IField, IFieldError } from "../types";

type Props = {
  field: IField;
  error?: IFieldError;
  onChange: (params: { fieldId: string; value: FieldValue }) => void;
};

type State = {
  dateValue: moment.Moment | null;
};

export default class Field extends React.Component<Props, State> {
  static renderSelect(options: string[] = [], attrs: any = {}) {
    return (
      <select {...attrs} className="form-control">
        <option />

        {options.map((option, index) => (
          <option key={index} value={option}>
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
    onChange: () => void
  ) {
    return (
      <div className="check-control">
        {options.map((option, index) => (
          <div key={index}>
            <label>
              {Field.renderInput({
                type: "checkbox",
                "data-option": option,
                name,
                onChange
              })}
              {option}
            </label>
          </div>
        ))}
      </div>
    );
  }

  static renderRadioButtons(
    name: string,
    options: string[],
    onChange: (e: React.FormEvent<HTMLInputElement>) => void
  ) {
    return (
      <div>
        {options.map((option, index) => (
          <div key={index}>
            {Field.renderInput({
              type: "radio",
              "data-option": option,
              name,
              onChange
            })}
            <span>{option}</span>
          </div>
        ))}
      </div>
    );
  }

  constructor(props: Props) {
    super(props);

    this.state = {
      dateValue: null
    };
  }

  onChange = (value: FieldValue) => {
    const { onChange, field } = this.props;

    onChange({ fieldId: field._id, value });
  };

  onInputChange = (e: React.FormEvent<HTMLInputElement>) => {
    this.onChange(e.currentTarget.value);
  };

  onDateChange = (momentObj: moment.Moment) => {
    this.setState({ dateValue: momentObj });
    this.onChange(momentObj.toDate());
  };

  onRadioButtonsChange = (e: React.FormEvent<HTMLInputElement>) => {
    this.onChange(e.currentTarget.getAttribute("data-option") || "");
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

    this.onChange(values.join(","));
  };

  onTextAreaChange = (e: React.FormEvent<HTMLTextAreaElement>) => {
    this.onChange(e.currentTarget.value);
  };

  onSelectChange = (e: React.FormEvent<HTMLSelectElement>) => {
    this.onChange(e.currentTarget.value);
  };

  renderDatepicker() {
    return (
      <DatePicker
        selected={this.state.dateValue}
        onChange={this.onDateChange}
        className="form-control"
        dateFormat="YYYY/MM/DD"
      />
    );
  }

  renderControl() {
    const { field } = this.props;
    const { options = [], validation = "text" } = field;
    const name = field._id;

    if (validation === "date") {
      return this.renderDatepicker();
    }

    switch (field.type) {
      case "select":
        return Field.renderSelect(options, { onChange: this.onSelectChange });

      case "check":
        return Field.renderCheckboxes(name, options, this.onCheckboxesChange);

      case "radio":
        return Field.renderRadioButtons(
          name,
          options,
          this.onRadioButtonsChange
        );

      case "textarea":
        return Field.renderTextarea({ onChange: this.onTextAreaChange });

      default:
        return Field.renderInput({
          onChange: this.onInputChange,
          type: validation
        });
    }
  }

  render() {
    const { field, error } = this.props;

    return (
      <div className="form-group">
        <label className="control-label" htmlFor={`field-${field._id}`}>
          {field.text}
          {field.isRequired ? <span className="required">*</span> : null}:
        </label>
        <span className="error">{error && error.text}</span>
        {field.description ? (
          <span className="description">{field.description}</span>
        ) : null}
        {this.renderControl()}
      </div>
    );
  }
}
