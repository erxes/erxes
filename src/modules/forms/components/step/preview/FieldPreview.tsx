import { GenerateField } from "modules/settings/properties/components";
import React, { Component } from "react";
import { FieldItem } from "./styles";

type Props = {
  field: any;
  onEdit: (field) => void;
};

class FieldPreview extends Component<Props, {}> {
  constructor(props) {
    super(props);

    this.onEdit = this.onEdit.bind(this);
  }

  onEdit() {
    const { onEdit } = this.props;

    if (onEdit) {
      onEdit(this.props.field);
    }
  }

  render() {
    const { field } = this.props;

    return (
      <FieldItem onClick={this.onEdit} selectType={field.type === "select"}>
        <GenerateField field={field} />
      </FieldItem>
    );
  }
}

export default FieldPreview;
