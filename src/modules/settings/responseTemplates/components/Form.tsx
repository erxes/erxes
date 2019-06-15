import {
  ControlLabel,
  EditorCK,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { SelectBrand } from 'modules/settings/integrations/containers';
import * as React from 'react';
import { Form as CommonForm } from '../../common/components';
import { ICommonFormProps } from '../../common/types';
import { IResponseTemplate } from '../types';

type Props = {
  object?: IResponseTemplate;
};

type State = {
  content: string;
};

class Form extends React.Component<Props & ICommonFormProps, State> {
  constructor(props) {
    super(props);

    const object = props.object || {};

    this.state = {
      content: object.content || ''
    };
  }

  onChange = e => {
    this.setState({ content: e.editor.getData() });
  };

  generateDoc = () => {
    return {
      doc: {
        brandId: (document.getElementById('selectBrand') as HTMLInputElement)
          .value,
        name: (document.getElementById('template-name') as HTMLInputElement)
          .value,
        content: this.state.content
      }
    };
  };

  renderContent = () => {
    const object = this.props.object || ({} as IResponseTemplate);

    return (
      <React.Fragment>
        <FormGroup>
          <SelectBrand isRequired={true} defaultValue={object.brandId} />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>
          <FormControl
            id="template-name"
            defaultValue={object.name}
            type="text"
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Content</ControlLabel>

          <EditorCK
            content={object.content}
            onChange={this.onChange}
            height={300}
          />
        </FormGroup>
      </React.Fragment>
    );
  };

  render() {
    return (
      <CommonForm
        {...this.props}
        renderContent={this.renderContent}
        generateDoc={this.generateDoc}
      />
    );
  }
}

export default Form;
