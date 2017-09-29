import React from 'react';
import { EditorState } from 'draft-js';
import { FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import { ErxesEditor, toHTML, createStateFromHTML } from '/imports/react-ui/common/Editor';
import { Form as CommonForm } from '/imports/react-ui/settings/common/components';

class ArticleForm extends CommonForm {
  constructor(props) {
    super(props);

    const object = props.object || {};

    this.state = {
      status: this.getCurrentStatus(),
      editorState: createStateFromHTML(EditorState.createEmpty(), object.content || ''),
    };

    this.onChange = this.onChange.bind(this);
    this.getContent = this.getContent.bind(this);
  }

  getCurrentStatus() {
    const { object } = this.props;
    if (object == null) {
      return 'draft';
    }
    return object.status;
  }

  generateDoc() {
    const { object } = this.props;

    return {
      ...object,
      doc: {
        // TODO: check if some variables can be ignored
        title: document.getElementById('knowledgebase-article-title').value,
        summary: document.getElementById('knowledgebase-article-summary').value,
        content: this.getContent(this.state.editorState),
        status: this.state.status,
      },
    };
  }

  getContent(editorState) {
    return toHTML(editorState);
  }

  onChange(editorState) {
    this.setState({ editorState });
  }

  renderContent(object) {
    const status = this.state.status;
    const props = {
      editorState: this.state.editorState,
      onChange: this.onChange,
      defaultValue: object.content,
    };

    return (
      <div>
        <FormGroup controlId="knowledgebase-article-title">
          <ControlLabel>Title</ControlLabel>
          <FormControl type="text" defaultValue={object.title} required />
        </FormGroup>

        <FormGroup controlId="knowledgebase-article-summary">
          <ControlLabel>Summary</ControlLabel>
          <FormControl type="text" defaultValue={object.summary} />
        </FormGroup>

        <FormGroup controlId="knowledgebase-article-content">
          <ControlLabel>Content</ControlLabel>
          <div className="editor-bordered">
            <ErxesEditor {...props} />
          </div>
        </FormGroup>

        <FormGroup controlId="knowledgebase-article-status">
          <ControlLabel>Status</ControlLabel>
          <FormControl
            componentClass="select"
            placeholder="select"
            onChange={e => {
              this.setState({ status: e.target.value });
            }}
            value={status}
          >
            <option value="draft">Draft</option>
            <option value="publish">Publish</option>
          </FormControl>
        </FormGroup>
      </div>
    );
  }
}

export default ArticleForm;
