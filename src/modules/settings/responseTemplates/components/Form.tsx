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
import React, { Fragment } from 'react';
import { Form as CommonForm } from '../../common/components';

type State = {
  editorState: (createStateFromHTML : { editorState: () => void, html: string }) => void
}

class Form extends CommonForm<{}, State> {
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
      <Fragment>
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
      </Fragment>
    );
  }
}

export default Form;
