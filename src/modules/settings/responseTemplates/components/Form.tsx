import { EditorState } from 'draft-js';
import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import {
  createStateFromHTML,
  ErxesEditor,
  toHTML
} from 'modules/common/components/editor/Editor';
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
  editorState: EditorState;
};

class Form extends React.Component<Props & ICommonFormProps, State> {
  constructor(props) {
    super(props);

    const object = props.object || {};

    this.state = {
      editorState: createStateFromHTML(
        EditorState.createEmpty(),
        object.content || ''
      )
    };
  }

  getContent = editorState => {
    return toHTML(editorState);
  };

  onChange = editorState => {
    this.setState({ editorState });
  };

  generateDoc = () => {
    return {
      doc: {
        brandId: (document.getElementById('selectBrand') as HTMLInputElement)
          .value,
        name: (document.getElementById('template-name') as HTMLInputElement)
          .value,
        content: this.getContent(this.state.editorState)
      }
    };
  };

  renderContent = () => {
    const object = this.props.object || ({} as IResponseTemplate);

    const props = {
      editorState: this.state.editorState,
      onChange: this.onChange,
      defaultValue: object.content
    };

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
          <ErxesEditor bordered={true} {...props} />
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
