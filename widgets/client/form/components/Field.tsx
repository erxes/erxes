import Datetime from "@nateradebaugh/react-datetime";
import * as React from "react";
import uploadHandler from "../../uploadHandler";
import {
  COMPANY_BUSINESS_TYPES,
  DEFAULT_COMPANY_INDUSTRY_TYPES,
  COUNTRIES,
} from "../constants";
import { FieldValue, IField, IFieldError } from "../types";
import MSFmultiSelect from "../multipleSelectScript";

type Props = {
  field: IField;
  error?: IFieldError;
  onChange: (params: {
    fieldId: string;
    value: FieldValue;
    associatedFieldId?: string;
    groupId?: string;
  }) => void;
};

type State = {
  dateValue?: Date | string;
  dateTimeValue: Date | string;
  isAttachingFile?: boolean;
  multipleSelectValues?: string[];
};

export default class Field extends React.Component<Props, State> {
  static renderSelect(options: string[] = [], attrs: any = {}) {
    return (
      <select
        {...attrs}
        className="form-control"
        id={attrs.multiple ? attrs.id : ""}
      >
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
    id: string,
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
                id,
                onChange,
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
    id: string,
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
              id,
              onChange,
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
      dateValue: "",
      dateTimeValue: "",
      multipleSelectValues: [],
    };
  }

  componentDidMount() {
    if (this.props.field.type === "multiSelect") {
      let multiSelects: any[] = [];

      try {
        multiSelects = Array.from(
          document.querySelectorAll(`#${this.props.field._id}`)
        );
      } catch (_e) {
        multiSelects = [];
      }

      multiSelects.map(
        (query) =>
          new MSFmultiSelect(query, {
            theme: "theme2",
            selectAll: true,
            searchBox: true,
          })
      );
    }
  }

  onChange = (value: FieldValue) => {
    const { onChange, field } = this.props;

    onChange({
      fieldId: field._id,
      value,
      associatedFieldId: field.associatedFieldId,
      groupId: field.groupId,
    });
  };

  onInputChange = (e: React.FormEvent<HTMLInputElement>) => {
    this.onChange(e.currentTarget.value);
  };

  handleFileInput = (e: React.FormEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    const self = this;

    if (files && files.length > 0) {
      uploadHandler({
        file: files[0],

        beforeUpload() {
          self.setState({ isAttachingFile: true });
        },

        // upload to server
        afterUpload({ response, fileInfo }: any) {
          const attachment = { url: response, ...fileInfo };

          self.setState({ isAttachingFile: false });

          self.onChange([attachment]);
        },

        onError: (message) => {
          alert(message);
          self.setState({ isAttachingFile: false });
        },
      });
    }
  };

  onDateChange = (date?: Date | string) => {
    this.setState({ dateValue: date || "" });
    this.onChange(date || "");
  };

  onDateTimeChange = (date?: Date | string) => {
    this.setState({ dateTimeValue: date || "" });
    this.onChange(date || "");
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

  renderDatepicker(id: string) {
    return (
      <Datetime
        inputProps={{ id }}
        value={this.state.dateValue}
        viewDate={new Date()}
        defaultValue={new Date()}
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
    return (
      <Datetime
        inputProps={{ id }}
        value={this.state.dateTimeValue}
        viewDate={new Date()}
        defaultValue={new Date()}
        onChange={this.onDateTimeChange}
        timeFormat="HH:mm"
        dateFormat="YYYY/MM/DD"
      />
    );
  }

  renderControl() {
    const { field } = this.props;
    const { options = [], validation = "text" } = field;
    const name = field._id;

    if (validation === "date") {
      return this.renderDatepicker(field._id);
    }

    if (validation === "datetime") {
      return this.renderDateTimepicker(field._id);
    }

    switch (field.type) {
      case "select":
        return Field.renderSelect(options, {
          onChange: this.onSelectChange,
          id: field._id,
        });

      case "multiSelect":
        return Field.renderSelect(options, {
          value: this.state.multipleSelectValues,
          onChange: this.onMultpleSelectChange,
          id: field._id,
          multiple: true,
        });

      case "pronoun":
        return Field.renderSelect(["Male", "Female", "Not applicable"], {
          onChange: this.onSelectChange,
          id: field._id,
        });

      case "businessType":
        return Field.renderSelect(COMPANY_BUSINESS_TYPES, {
          onChange: this.onSelectChange,
          id: field._id,
        });

      case "location":
        return Field.renderSelect(COUNTRIES, {
          onChange: this.onSelectChange,
          id: field._id,
        });

      case "industry":
        return Field.renderSelect(DEFAULT_COMPANY_INDUSTRY_TYPES, {
          value: this.state.multipleSelectValues,
          onChange: this.onMultpleSelectChange,
          id: field._id,
          multiple: true,
        });

      case "check":
        return Field.renderCheckboxes(
          name,
          options,
          field._id,
          this.onCheckboxesChange
        );

      case "radio":
        return Field.renderRadioButtons(
          name,
          options,
          field._id,
          this.onRadioButtonsChange
        );

      case "doNotDisturb":
        return Field.renderRadioButtons(
          name,
          ["Yes", "No"],
          field._id,
          this.onRadioButtonsChange
        );

      case "companyDoNotDisturb":
        return Field.renderRadioButtons(
          name,
          ["Yes", "No"],
          field._id,
          this.onRadioButtonsChange
        );

      case "hasAuthority":
        return Field.renderRadioButtons(
          name,
          ["Yes", "No"],
          field._id,
          this.onRadioButtonsChange
        );

      case "file":
        return Field.renderInput({
          onChange: this.handleFileInput,
          type: "file",
          id: field._id,
        });

      case "avatar":
        return Field.renderInput({
          onChange: this.handleFileInput,
          type: "file",
          id: field._id,
        });

      case "companyAvatar":
        return Field.renderInput({
          onChange: this.handleFileInput,
          type: "file",
          id: field._id,
        });

      case "textarea":
        return Field.renderTextarea({
          onChange: this.onTextAreaChange,
          id: field._id,
        });

      case "description":
        return Field.renderTextarea({
          onChange: this.onTextAreaChange,
          id: field._id,
        });

      case "companyDescription":
        return Field.renderTextarea({
          onChange: this.onTextAreaChange,
          id: field._id,
        });

      case "birthDate":
        return this.renderDatepicker(field._id);

      case "html":
        return this.renderHtml(field.content || "", field._id);

      default:
        return Field.renderInput({
          onChange: this.onInputChange,
          type: validation,
          id: field._id,
        });
    }
  }

  render() {
    const { field, error } = this.props;
    const { isAttachingFile } = this.state;

    const fieldStyle = () => {
      if (field.column) {
        return {
          width: `${100 / field.column}%`,
          display: "inline-block",
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
          <span className="description">{field.description}</span>
        ) : null}

        {this.renderControl()}

        {isAttachingFile ? <div className="loader" /> : null}
      </div>
    );
  }
}
