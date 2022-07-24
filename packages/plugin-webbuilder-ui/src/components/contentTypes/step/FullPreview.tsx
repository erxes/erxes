import { __ } from '@erxes/ui/src/utils/core';
import FieldForm from '../FieldForm';
import FieldsPreview from '@erxes/ui-forms/src/forms/components/FieldsPreview';
import React from 'react';
import FormPreview from '@erxes/ui/src/components/step/preview/FormPreview';
import {
  DesktopPreview,
  FlexItem,
  FullPreview
} from '@erxes/ui/src/components/step/style';
import { Alert } from '@erxes/ui/src/utils';

type Props = {
  type: string;
  color: string;
  theme: string;
  onChange: (key: string, value: any) => void;
  fields: any[];
};

type State = {
  currentMode: 'create' | 'update' | undefined;
  currentField?: any;
};

class FullPreviewStep extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      currentMode: undefined,
      currentField: undefined
    };
  }

  onFieldClick = (field: any) => {
    this.setState({ currentMode: 'update', currentField: field });
  };

  onFieldSubmit = (field: any) => {
    const { onChange, fields } = this.props;

    let duplicated: boolean = false;

    fields.forEach(fld => {
      if (fld._id !== field._id && fld.code === field.code) {
        duplicated = true;
      }
    });

    if (duplicated) {
      return Alert.error('Sorry field code duplicated!');
    }

    onChange('fields', fields);

    this.setState({ currentField: undefined });
  };

  onFieldDelete = (field: any) => {
    const { onChange } = this.props;

    // remove field from state
    const fields = this.props.fields.filter(f => f._id !== field._id);

    this.setState({
      currentField: undefined
    });

    onChange('fields', fields);
  };

  onFieldFormCancel = () => {
    this.setState({ currentField: undefined });
  };

  renderPreview() {
    const { currentMode, currentField } = this.state;
    const { fields } = this.props;

    const previewRenderer = () => (
      <>
        <FieldsPreview
          fields={fields || []}
          onFieldClick={this.onFieldClick}
          currentPage={1}
        />
      </>
    );

    return (
      <>
        <FormPreview
          {...this.props}
          formData={{}}
          title={'Entry'}
          btnText={'Add entry'}
          previewRenderer={previewRenderer}
          currentPage={1}
        />
        {currentField && (
          <FieldForm
            mode={currentMode || 'create'}
            field={currentField}
            onSubmit={this.onFieldSubmit}
            onDelete={this.onFieldDelete}
            onCancel={this.onFieldFormCancel}
          />
        )}
      </>
    );
  }

  renderResolutionPreview() {
    return <DesktopPreview>{this.renderPreview()}</DesktopPreview>;
  }

  render() {
    return (
      <FlexItem>
        <FullPreview>{this.renderResolutionPreview()}</FullPreview>
      </FlexItem>
    );
  }
}

export default FullPreviewStep;
