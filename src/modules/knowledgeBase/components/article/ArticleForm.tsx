import { EditorState } from 'draft-js';
import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import {
  createStateFromHTML,
  ErxesEditor,
  toHTML
} from 'modules/common/components/editor/Editor';
import { ModalFooter } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import React, { Component, Fragment } from 'react';
import { IArticle } from '../../types';

type Props = {
  article: IArticle;
  currentCategoryId: string;
  save: ({ doc }: { doc: any }, callback: () => void, IArticle) => void;
  closeModal: () => void;
};

type State = {
  status: string,
  editorState: any
}

class ArticleForm extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const article = props.article || { content: '' };

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
      () => this.props.closeModal(),
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
          title: (document.getElementById('knowledgebase-article-title') as HTMLInputElement).value,
          summary: (document.getElementById('knowledgebase-article-summary') as HTMLInputElement)
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
          <ErxesEditor bordered {...props} />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Status</ControlLabel>
          <FormControl
            id="knowledgebase-article-status"
            componentClass="select"
            placeholder={__('select')}
            onChange={e => {
              this.setState({ status: (e.target as HTMLInputElement).value });
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
    return (
      <form onSubmit={this.save}>
        {this.renderContent(this.props.article || {})}
        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={this.props.closeModal}
            icon="cancel-1"
          >
            Cancel
          </Button>

          <Button btnStyle="success" type="submit" icon="checked-1">
            Save
          </Button>
        </ModalFooter>
      </form>
    );
  }
}

export default ArticleForm;
