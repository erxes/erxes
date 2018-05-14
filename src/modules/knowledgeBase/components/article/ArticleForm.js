import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { EditorState } from 'draft-js';
import {
  Form,
  FormGroup,
  ControlLabel,
  FormControl,
  Button
} from 'modules/common/components';
import {
  ErxesEditor,
  toHTML,
  createStateFromHTML
} from 'modules/common/components/editor/Editor';
import { ModalFooter } from 'modules/common/styles/main';

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
    this.save = this.save.bind(this);
  }

  save(doc) {
    this.props.save(
      this.generateDoc(doc),
      () => {
        this.context.closeModal();
      },
      this.props.article
    );
  }

  generateDoc(doc) {
    return {
      doc: {
        doc: {
          title: doc.title,
          summary: doc.summary,
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

  getCurrentStatus() {
    const { article } = this.props;
    if (article == null) {
      return 'draft';
    }
    return article.status;
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
      <Fragment>
        <FormGroup>
          <ControlLabel>Title</ControlLabel>
          <FormControl
            name="title"
            type="text"
            value={article.title}
            validations="isValue"
            validationError="Please enter a title"
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Summary</ControlLabel>
          <FormControl
            name="summary"
            type="text"
            value={article.summary}
            validations="isValue"
            validationError="Please enter a summary"
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Content</ControlLabel>
          <ErxesEditor bordered {...props} />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Status</ControlLabel>
          <FormControl
            componentClass="select"
            name="status"
            validations="isValue"
            validationError="Please select a brand"
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
      </Fragment>
    );
  }

  render() {
    const onClick = () => {
      this.context.closeModal();
    };

    return (
      <Form onSubmit={this.save}>
        {this.renderContent(this.props.article || {})}
        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={onClick}
            icon="cancel-1"
          >
            Cancel
          </Button>

          <Button btnStyle="success" type="submit" icon="checked-1">
            Save
          </Button>
        </ModalFooter>
      </Form>
    );
  }
}

ArticleForm.propTypes = propTypes;
ArticleForm.contextTypes = contextTypes;

export default ArticleForm;
