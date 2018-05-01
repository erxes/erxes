import React from 'react';
import { EditorState } from 'draft-js';
import {
  FormGroup,
  ControlLabel,
  FormControl
} from 'modules/common/components';
import {
  ErxesEditor,
  toHTML,
  createStateFromHTML
} from 'modules/common/components/editor/Editor';
import { Form as CommonForm } from '../../common/components';

class Form extends CommonForm {
  constructor(props) {
    super(props);

    const object = props.object || {};

    this.state = {
      editorState: createStateFromHTML(
        EditorState.createEmpty(),
        object.content || ''
      )
    };

    this.onChange = this.onChange.bind(this);
    this.getContent = this.getContent.bind(this);
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
        brandId: document.getElementById('template-brand-id').value,
        name: document.getElementById('template-name').value,
        content: this.getContent(this.state.editorState)
      }
    };
  }

  renderContent(resTemplate) {
    const { __ } = this.context;
    const { brands } = this.props;
    const props = {
      editorState: this.state.editorState,
      onChange: this.onChange,
      defaultValue: resTemplate.content
    };

    return (
      <div>
        <FormGroup>
          <ControlLabel>Brand</ControlLabel>

          <FormControl
            componentClass="select"
            placeholder={__('Select Brand')}
            defaultValue={resTemplate.brandId}
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
            defaultValue={resTemplate.name}
            type="text"
            required
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Content</ControlLabel>
          <ErxesEditor bordered {...props} />
        </FormGroup>
      </div>
    );
  }
}

export default Form;
