import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { EditorState } from 'draft-js';
import {
  FormGroup,
  ControlLabel,
  FormControl,
  Button
} from 'modules/common/components';
import {
  ErxesEditor,
  toHTML,
  createStateFromHTML
} from 'modules/common/components/Editor';
import { EditorWrapper } from 'modules/engage/styles';
import { ModalFooter } from 'modules/common/styles/styles';

const propTypes = {
  article: PropTypes.object,
  currentCategoryId: PropTypes.string,
  save: PropTypes.func
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired,
  __: PropTypes.func
};

class ArticleForm extends Component {
  constructor(props) {
    super(props);

    const article = props.article || {};

    this.state = {
      status: this.getCurrentStatus(),
      editorState: createStateFromHTML(
        EditorState.createEmpty(),
        article.content || ''
      )
    };

    this.onChange = this.onChange.bind(this);
    this.getContent = this.getContent.bind(this);
    this.save = this.save.bind(this);
  }

  save(e) {
    e.preventDefault();

    this.props.save(
      this.generateDoc(),
      () => {
        this.context.closeModal();
      },
      this.props.article
    );
  }

  getCurrentStatus() {
    const { article } = this.props;
    if (article == null) {
      return 'draft';
    }
    return article.status;
  }

  generateDoc() {
    return {
      doc: {
        doc: {
          title: document.getElementById('knowledgebase-article-title').value,
          summary: document.getElementById('knowledgebase-article-summary')
            .value,
          content: this.getContent(this.state.editorState),
          status: this.state.status,
          categoryIds: [this.props.currentCategoryId]
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

  renderContent(article) {
    const { __ } = this.context;
    const props = {
      editorState: this.state.editorState,
      onChange: this.onChange,
      defaultValue: article.content
    };

    return (
      <div>
        <FormGroup>
          <ControlLabel>Title</ControlLabel>
          <FormControl
            id="knowledgebase-article-title"
            type="text"
            defaultValue={article.title}
            required
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Summary</ControlLabel>
          <FormControl
            id="knowledgebase-article-summary"
            type="text"
            defaultValue={article.summary}
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
            placeholder={__('select')}
            onChange={e => {
              this.setState({ status: e.target.value });
            }}
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

  render() {
    const onClick = () => {
      this.context.closeModal();
    };

    return (
      <form onSubmit={this.save}>
        {this.renderContent(this.props.article || {})}
        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={onClick}
            icon="close"
          >
            Cancel
          </Button>

          <Button btnStyle="success" type="submit" icon="checkmark">
            Save
          </Button>
        </ModalFooter>
      </form>
    );
  }
}

ArticleForm.propTypes = propTypes;
ArticleForm.contextTypes = contextTypes;

export default ArticleForm;
