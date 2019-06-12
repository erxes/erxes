import {
  Button,
  ControlLabel,
  EditorCK,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import { IArticle } from '../../types';

type Props = {
  article: IArticle;
  currentCategoryId: string;

  save: (
    params: {
      doc: {
        doc: {
          title: string;
          summary: string;
          content: string;
          status: string;
          categoryIds: string[];
        };
      };
    },
    callback: () => void,
    IArticle
  ) => void;

  closeModal: () => void;
};

type State = {
  status: string;
  content: string;
};

class ArticleForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const article = props.article || { content: '' };

    this.state = {
      status: this.getCurrentStatus(),
      content: article.content
    };
  }

  save = e => {
    e.preventDefault();

    this.props.save(
      this.generateDoc(),
      () => this.props.closeModal(),
      this.props.article
    );
  };

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
          title: (document.getElementById(
            'knowledgebase-article-title'
          ) as HTMLInputElement).value,
          summary: (document.getElementById(
            'knowledgebase-article-summary'
          ) as HTMLInputElement).value,
          content: this.state.content,
          status: this.state.status,
          categoryIds: [this.props.currentCategoryId]
        }
      }
    };
  }

  onChange = e => {
    this.setState({ content: e.editor.getData() });
  };

  renderContent(article) {
    const onChange = e => {
      this.setState({ status: (e.target as HTMLInputElement).value });
    };

    return (
      <React.Fragment>
        <FormGroup>
          <ControlLabel>Title</ControlLabel>
          <FormControl
            id="knowledgebase-article-title"
            type="text"
            defaultValue={article.title}
            required={true}
            autoFocus={true}
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
          <EditorCK
            content={this.state.content}
            onChange={this.onChange}
            height={300}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Status</ControlLabel>
          <FormControl
            id="knowledgebase-article-status"
            componentClass="select"
            placeholder={__('select')}
            onChange={onChange}
            value={this.state.status}
          >
            {[{ value: 'draft' }, { value: 'publish' }].map(op => (
              <option key={op.value} value={op.value}>
                {op.value}
              </option>
            ))}
          </FormControl>
        </FormGroup>
      </React.Fragment>
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
