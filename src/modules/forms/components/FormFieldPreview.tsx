import SortableList from 'modules/common/components/SortableList';
import { IField } from 'modules/settings/properties/types';
import React from 'react';
import { IForm } from '../types';
import FieldPreview from './FieldPreview';

type Props = {
  fields?: IField[];
  form?: IForm;
  onFieldEdit?: (field: IField, props) => void;
  onChange?: (name: string, fields: any) => void;
  onFieldChange?: (name: string, value: IField[]) => void;
  wrapper: ({ form, content }) => JSX.Element;
};

type State = {
  fields?: IField[];
};

class FormFieldPreview extends React.Component<Props, State> {
  static defaultProps = {
    wrapper: ({ content }) => content
  };

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
    const { form } = this.props;

    return <p>{form && form.description}</p>;
  }

  render() {
    const { form } = this.props;

    const child = field => {
      return (
        <FieldPreview
          key={field._id}
          onFieldEdit={this.props.onFieldEdit}
          field={field}
        />
      );
    };

    const content = (
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

    return this.props.wrapper({
      content,
      form
    });
  }
}

export default FormFieldPreview;
