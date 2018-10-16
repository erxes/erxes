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
import * as React from 'react';
import { IBrand } from '../../brands/types';
import { Form as CommonForm } from '../../common/components';
import { ICommonFormProps } from '../../common/types';
import { IResponseTemplate } from '../types';

type Props = {
  object?: IResponseTemplate;
  brands: IBrand[];
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

    this.renderContent = this.renderContent.bind(this);
    this.onChange = this.onChange.bind(this);
    this.getContent = this.getContent.bind(this);
    this.generateDoc = this.generateDoc.bind(this);
  }

  getContent(editorState) {
    return toHTML(editorState);
  }

  onChange(editorState) {
    this.setState({ editorState });
  }

  generateDoc() {
    return {
      doc: {
        brandId: (document.getElementById(
          'template-brand-id'
        ) as HTMLInputElement).value,
        name: (document.getElementById('template-name') as HTMLInputElement)
          .value,
        content: this.getContent(this.state.editorState)
      }
    };
  }

  renderContent() {
    const { brands } = this.props;
    const object = this.props.object || ({} as IResponseTemplate);

    const props = {
      editorState: this.state.editorState,
      onChange: this.onChange,
      defaultValue: object.content
    };

    return (
      <React.Fragment>
        <FormGroup>
          <ControlLabel>Brand</ControlLabel>

          <FormControl
            componentClass="select"
            placeholder={__('Select Brand')}
            defaultValue={object.brandId}
            id="template-brand-id"
          >
            {brands.map(brand => (
              <option key={brand._id} value={brand._id}>
                {brand.name}
              </option>
            ))}
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel>Name</ControlLabel>
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
  }

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
