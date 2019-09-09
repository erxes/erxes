import SortableList from 'modules/common/components/SortableList';
import { IField } from 'modules/settings/properties/types';
import React from 'react';
import FieldPreview from './FieldPreview';

type Props = {
  fields?: IField[];
  formDesc?: string;
  onFieldEdit?: (field: IField, props) => void;
  onChange?: (name: string, fields: any) => void;
  onFieldChange?: (name: string, value: IField[]) => void;
};

type State = {
  fields?: IField[];
};

class FormFieldPreview extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

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

  onChangeFields = (reOrderedFields: IField[]) => {
    const fields: IField[] = [];

    const { onFieldChange } = this.props;

    reOrderedFields.forEach((field, index) => {
      fields.push({
        ...field,
        order: index
      });
    });

    this.setState({ fields }, () => {
      if (onFieldChange) {
        onFieldChange('fields', this.state.fields || []);
      }
    });
  };

  renderFormDesc() {
    if (!this.props.formDesc) {
      return null;
    }

    return <p>{this.props.formDesc}</p>;
  }

  render() {
    const child = field => {
      return (
        <FieldPreview
          key={field._id}
          onFieldEdit={this.props.onFieldEdit}
          field={field}
        />
      );
    };

    return (
      <>
        {this.renderFormDesc()}
        <SortableList
          child={child}
          fields={this.state.fields || []}
          onChangeFields={this.onChangeFields}
          droppableId="form"
        />
      </>
    );
  }
}

export default FormFieldPreview;
