import { Preview } from 'modules/common/components/step/styles';
import Form from 'modules/forms/containers/Form';
import { IFormPreviewContent } from 'modules/forms/types';
import React from 'react';
import FormPreview from './preview/FormPreview';
import { FlexItem } from './style';

type Props = {
  type: string;
  color: string;
  theme: string;
};

class FormStep extends React.Component<Props> {
  render() {
    const content = (props: IFormPreviewContent) => {
      return (
        <Preview>
          <FormPreview {...this.props} {...props} />
        </Preview>
      );
    };

    return (
      <FlexItem>
        <Form previewContent={content} />
      </FlexItem>
    );
  }
}

export default FormStep;
