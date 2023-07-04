import { IAttachment, IField, IOption, Label } from "../../types";

import { ControlLabel } from "../../common/form";
import FormControl from "../../common/form/Control";
import FormGroup from "../../common/form/Group";
import ModifiableList from "../../common/form/ModifiableList";
import React from "react";
import Select from "react-select-plus";
import SelectData from "./SelectData";
import { SelectInput } from "../../styles/cards";
import Uploader from "../../common/Uploader";
import { __ } from "../../../utils";

type Props = {
  field: IField;
  defaultValue?: any;
  isEditing?: boolean;
  departments?: string[];
  branches?: string[];
  products?: string[];
  labels: Label[];
  onValueChange?: (data: { _id: string; value: any }) => void;
};

type State = {
  value?: any;
  checkBoxValues: any[];
};

export default class GenerateField extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      ...this.generateState(props)
    };
  }

  generateState = props => {
    const { field, defaultValue } = props;

    const state = { value: defaultValue, checkBoxValues: [] };

    if (defaultValue && field.type === "check") {
      state.checkBoxValues = defaultValue;
    }

    return state;
  };

  onChange = (e, optionValue) => {
    const { field, onValueChange } = this.props;
    const { validation, type } = field;

    if (!e.target && !optionValue) {
      return;
    }

    let value = optionValue || e.target.value;

    if (validation === "number") {
      value = Number(value);
    }

    if (type === "check") {
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

  renderInput(attrs, hasError?: boolean) {
    const { value } = this.state;
    const checkBoxValues = this.state.checkBoxValues || [];
    const { type } = this.props.field;

    attrs.type = "text";

    attrs.onChange = e => {
      this.setState({ value: e.target.value });
      this.onChange(e, attrs.option);
    };

    if (type === "radio") {
      attrs.type = "radio";
      attrs.componentClass = "radio";
      attrs.checked = String(value) === attrs.option;
    }

    if (type === "check") {
      attrs.type = "checkbox";
      attrs.componentClass = "checkbox";
      attrs.checked = checkBoxValues.includes(attrs.option);
    }

    return <FormControl {...attrs} />;
  }

  renderTextarea(attrs) {
    return <FormControl componentClass="textarea" {...attrs} />;
  }

  renderSelect(options: string[] = [], attrs = {}) {
    return (
      <FormControl componentClass="select" {...attrs}>
        <option key={""} value="">
          Choose option
        </option>
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

  renderList(attrs) {
    let options = [];
    if (attrs.value && attrs.value.length > 0) {
      options = attrs.value.split(",") || [];
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
        addButtonLabel={__("Add a value")}
        showAddButton={true}
      />
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
        showUploader={true}
        multiple={true}
        single={false}
      />
    );
  }

  renderProduct({ id, value }) {
    const { onValueChange, products } = this.props;
    const onSelect = e => {
      if (onValueChange) {
        this.setState({ value: e });

        onValueChange({ _id: id, value: e });
      }
    };

    return (
      <SelectData
        label={"Add a Product"}
        products={products}
        value={value}
        onSelect={onSelect}
      />
    );
  }

  renderBranch({ id, value }) {
    const { onValueChange, branches } = this.props;
    const onSelect = e => {
      if (onValueChange) {
        this.setState({ value: e });
        onValueChange({ _id: id, value: e });
      }
    };
    return (
      <SelectData
        label={"Add a Branch"}
        branches={branches}
        value={value}
        onSelect={onSelect}
      />
    );
  }

  renderLabels(attrs) {
    const { onValueChange, labels } = this.props;
    const onSelect = e => {
      onValueChange({ _id: attrs.id, value: [e.currentTarget.value] });
    };

    return (
      <FormControl componentClass="select" {...attrs} onChange={onSelect}>
        <option key={""} value="">
          Choose option
        </option>
        {labels.map(label => (
          <option key={label._id} value={label._id}>
            {label.name}
          </option>
        ))}
      </FormControl>
    );
  }

  renderDepartment({ id, value }) {
    const { onValueChange, departments } = this.props;
    const onSelect = e => {
      if (onValueChange) {
        this.setState({ value: e });

        onValueChange({ _id: id, value: e });
      }
    };

    return (
      <SelectData
        label={"Add a Department"}
        departments={departments}
        value={value}
        onSelect={onSelect}
      />
    );
  }

  renderControl() {
    const { field } = this.props;
    const { type } = field;
    const options = field.options || [];

    const attrs = {
      id: field._id,
      value: this.state.value,
      onChange: this.onChange,
      name: ""
    };

    if (field.field === "labelIds") {
      return this.renderLabels(attrs);
    }

    switch (type) {
      case "select":
        return this.renderSelect(options, attrs);

      case "multiSelect":
        return this.renderMultiSelect(options, attrs);

      case "textarea":
        return this.renderTextarea(attrs);

      case "check":
        try {
          return this.renderRadioOrCheckInputs(options, attrs);
        } catch {
          return this.renderRadioOrCheckInputs(options, attrs, true);
        }

      case "radio":
        attrs.name = Math.random().toString();
        try {
          return this.renderRadioOrCheckInputs(options, attrs);
        } catch {
          return this.renderRadioOrCheckInputs(options, attrs, true);
        }

      case "list": {
        return this.renderList(attrs);
      }

      case "file": {
        return this.renderFile(attrs);
      }

      case "product": {
        return this.renderProduct(attrs);
      }

      case "branch": {
        return this.renderBranch(attrs);
      }

      case "department": {
        return this.renderDepartment(attrs);
      }

      default:
        return this.renderInput(attrs, true);
    }
  }

  render() {
    const { field } = this.props;

    return (
      <FormGroup>
        <ControlLabel ignoreTrans={true} required={field.isRequired}>
          {field.text}
        </ControlLabel>

        {field.description ? (
          <div
            className="customFieldDescription"
            dangerouslySetInnerHTML={{ __html: field.description }}
          />
        ) : null}

        {this.renderControl()}
      </FormGroup>
    );
  }
}
