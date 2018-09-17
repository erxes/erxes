import { SortableList } from "modules/common/components";
import React, { Component } from "react";
import { FieldPreview } from "./";

type Props = {
  fields: any;
  onFieldEdit: (field) => void;
  onChange: (string, fields) => void;
};

type State = {
  fields: any;
};

class FormFieldPreview extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.onChangeFields = this.onChangeFields.bind(this);

    this.state = {
      fields: props.fields
    };
  }

  componentWillUpdate(nextProps: Props) {
    if (this.state.fields.length !== nextProps.fields.length) {
      this.setState({
        fields: nextProps.fields
      });
    }
  }

  onChangeFields(reOrderedFields) {
    const fields = [];

    reOrderedFields.forEach((field, index) => {
      fields.push({
        ...field,
        order: index
      });
    });

    this.setState({ fields });

    this.props.onChange("fields", this.state.fields);
  }

  render() {
    const child = field => {
      return (
        <FieldPreview
          key={field._id}
          onEdit={this.props.onFieldEdit}
          field={field}
        />
      );
    };

    return (
      <SortableList
        child={child}
        fields={this.state.fields}
        onChangeFields={this.onChangeFields}
      />
    );
  }
}

export default FormFieldPreview;
