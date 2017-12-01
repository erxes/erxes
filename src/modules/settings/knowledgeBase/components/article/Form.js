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
} from 'modules/common/components/Editor';
import { Form as CommonForm } from '../../../common/components';
import { EditorWrapper } from 'modules/engage/styles';

class ArticleForm extends CommonForm {
  constructor(props) {
    super(props);

    const object = props.object || {};

    this.state = {
      status: this.getCurrentStatus(),
      editorState: createStateFromHTML(
        EditorState.createEmpty(),
        object.content || ''
      )
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
    return {
      doc: {
        doc: {
          title: document.getElementById('knowledgebase-article-title').value,
          summary: document.getElementById('knowledgebase-article-summary')
            .value,
          content: this.getContent(this.state.editorState),
          status: this.state.status
        }
      }
    };
  }

  getContent(editorState) {
    return toHTML(editorState);
  }

  onChange(editorState) {
    this.setState({ editorState });
  }

  renderContent(object) {
    const props = {
      editorState: this.state.editorState,
      onChange: this.onChange,
      defaultValue: object.content
    };

    return (
      <div>
        <FormGroup>
          <ControlLabel>Title</ControlLabel>
          <FormControl
            id="knowledgebase-article-title"
            type="text"
            defaultValue={object.title}
            required
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Summary</ControlLabel>
          <FormControl
            id="knowledgebase-article-summary"
            type="text"
            defaultValue={object.summary}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Content</ControlLabel>
          <EditorWrapper>
            <ErxesEditor {...props} />
          </EditorWrapper>
        </FormGroup>

        <FormGroup>
          <ControlLabel>Status</ControlLabel>
          <FormControl
            id="knowledgebase-article-status"
            componentClass="select"
            placeholder="select"
            onChange={e => {
              this.setState({ status: e.target.value });
            }}
            defaultValue={this.state.status}
            value={this.state.status}
          >
            {[{ value: 'draft' }, { value: 'publish' }].map(op => (
              <option key={op.value} value={op.value}>
                {op.value}
              </option>
            ))}
          </FormControl>
        </FormGroup>
      </div>
    );
  }
}

export default ArticleForm;
