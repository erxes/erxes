import { SortableList } from "modules/common/components";
import React, { Component } from "react";
import { IFormField } from "../../../types";
import { FieldPreview } from "./";

type Props = {
  fields?: IFormField[];
  onFieldEdit?: (field: IFormField) => void;
  onChange: (name: string, fields: IFormField[]) => void;
};

type State = {
  fields?: IFormField[];
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
    if ((this.state.fields || []).length !== (nextProps.fields || []).length) {
      this.setState({
        fields: nextProps.fields
      });
    }
  }

  onChangeFields(reOrderedFields: IFormField[]) {
    const fields: IFormField[] = [];

    reOrderedFields.forEach((field, index) => {
      fields.push({
        ...field,
        order: index
      });
    });

    this.setState({ fields });

    this.props.onChange("fields", (this.state.fields || []));
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
        fields={(this.state.fields || [])}
        onChangeFields={this.onChangeFields}
      />
    );
  }
}

export default FormFieldPreview;
