import React from 'react';
import { FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import { Form as CommonForm } from '/imports/react-ui/settings/common/components';

class ArticleForm extends CommonForm {
  constructor(props) {
    super(props);
    this.state = {
      status: this.getCurrentStatus(),
    };
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
        content: document.getElementById('knowledgebase-article-content').value,
        status: this.state.status,
      },
    };
  }

  renderContent(object) {
    const status = this.state.status;

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
          <FormControl type="text" defaultValue={object.content} />
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
