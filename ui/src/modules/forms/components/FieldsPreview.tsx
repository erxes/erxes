import SortableList from 'modules/common/components/SortableList';
import { IField } from 'modules/settings/properties/types';
import React from 'react';
import xss from 'xss';
import { FieldsWrapper } from '../styles';
import FieldPreview from './FieldPreview';

type Props = {
  fields: IField[];
  formDesc?: string;
  onFieldClick?: (field: IField) => void;
  onChangeFieldsOrder?: (fields: IField[]) => void;
};

type State = {
  fields?: IField[];
};

class FieldsPreview extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      fields: [...props.fields]
    };
  }

  componentDidUpdate(prevProps: Props) {
    const { fields } = this.props;

    if (fields !== prevProps.fields) {
      this.setState({ fields });
    }
  }

  onChangeFields = (reOrderedFields: IField[]) => {
    const fields: IField[] = [];

    const { onChangeFieldsOrder } = this.props;

    reOrderedFields.forEach((field, index) => {
      fields.push({
        ...field,
        order: index
      });
    });

    this.setState({ fields }, () => {
      if (onChangeFieldsOrder) {
        onChangeFieldsOrder(this.state.fields || []);
      }
    });
  };

  renderFormDesc() {
    const { formDesc } = this.props;

    if (!formDesc) {
      return null;
    }

    const formatted = formDesc.replace(/\r?\n/g, '<br />');

    return <div dangerouslySetInnerHTML={{ __html: xss(formatted) }} />;
  }

  render() {
    const child = field => {
      return (
        <FieldPreview
          key={field._id}
          onClick={this.props.onFieldClick}
          field={field}
        />
      );
    };

    return (
      <>
        {this.renderFormDesc()}

        <FieldsWrapper>
          <SortableList
            child={child}
            fields={this.state.fields || []}
            onChangeFields={this.onChangeFields}
            droppableId="form"
          />
        </FieldsWrapper>
      </>
    );
  }
}

export default FieldsPreview;
