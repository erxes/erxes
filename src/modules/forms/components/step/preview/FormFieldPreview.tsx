import { SortableList } from "modules/common/components";
import { IField } from "modules/settings/properties/types";
import * as React from "react";
import { FieldPreview } from "./";

type Props = {
  fields?: IField[];
  onFieldEdit?: (field: IField) => void;
  onChange: (name: string, fields: IField[]) => void;
};

type State = {
  fields?: IField[];
};

class FormFieldPreview extends React.Component<Props, State> {
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

  onChangeFields(reOrderedFields: IField[]) {
    const fields: IField[] = [];

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
