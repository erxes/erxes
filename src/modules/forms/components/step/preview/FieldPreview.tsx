import { GenerateField } from "modules/settings/properties/components";
import React, { Component } from "react";
import { IFormField } from "../../../types";
import { FieldItem } from "./styles";

type Props = {
  field: any;
  onEdit: (field: IFormField) => void;
};

class FieldPreview extends Component<Props, {}> {
  constructor(props: Props) {
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
