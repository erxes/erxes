import Button from 'modules/common/components/Button';
import EditorCK from 'modules/common/components/EditorCK';
import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import Uploader from 'modules/common/components/Uploader';
import { ModalFooter } from 'modules/common/styles/main';
import {
  IAttachment,
  IButtonMutateProps,
  IFormProps,
  IOption
} from 'modules/common/types';
import { extractAttachment, __ } from 'modules/common/utils';
import { articleReactions } from 'modules/knowledgeBase/icons.constant';
import { FlexContent, FlexItem } from 'modules/layout/styles';
import { FILE_MIME_TYPES } from 'modules/settings/general/constants';
import React from 'react';
import Select from 'react-select-plus';
import { IArticle, ITopic } from '../../types';
import { ReactionItem } from './styles';

type Props = {
  article: IArticle;
  currentCategoryId: string;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  topics: ITopic[];
};

type State = {
  content: string;
  reactionChoices: string[];
  topicId?: string;
  categoryId: string;
  attachments: IAttachment[];
};

class ArticleForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const article = props.article || { content: '' };
    const attachments =
      (article.attachments && extractAttachment(article.attachments)) || [];

    this.state = {
      content: article.content,
      reactionChoices: article.reactionChoices || [],
      topicId: article.topicId,
      categoryId: article.categoryId,
      attachments
    };
  }

  componentDidUpdate(prevProps) {
    const { topics, currentCategoryId } = this.props;

    if (!this.state.topicId && topics && topics.length > 0) {
      this.setState({ topicId: topics[0]._id, categoryId: currentCategoryId });
    }
  }

  getFirstAttachment = () => {
    const { attachments } = this.state;

    return attachments.length > 0 ? attachments[0] : ({} as IAttachment);
  };

  generateDoc = (values: {
    _id?: string;
    title: string;
    summary: string;
    status: string;
  }) => {
    const { article, currentCategoryId } = this.props;
    const {
      attachments,
      content,
      reactionChoices,
      topicId,
      categoryId
    } = this.state;

    const finalValues = values;

    if (article) {
      finalValues._id = article._id;
    }

    return {
      _id: finalValues._id,
      doc: {
        title: finalValues.title,
        summary: finalValues.summary,
        content,
        reactionChoices,
        status: finalValues.status,
        categoryIds: [currentCategoryId],
        topicId,
        attachments,
        categoryId
      }
    };
  };

  onChange = e => {
    this.setState({ content: e.editor.getData() });
  };

  onChangeReactions = (options: IOption[]) => {
    this.setState({ reactionChoices: options.map(option => option.value) });
  };

  onChangeAttachments = (attachments: IAttachment[]) =>
    this.setState({ attachments });

  onChangeAttachment = (key: string, value: string | number) => {
    this.setState({
      attachments: [
        {
          ...this.getFirstAttachment(),
          [key]: value
        }
      ]
    });
  };

  renderOption = option => {
    return (
      <ReactionItem>
        <img src={option.value} alt={option.label} />
        {option.label}
      </ReactionItem>
    );
  };

  generateOptions = options => {
    return options.map(option => ({
      value: option._id,
      label: option.title
    }));
  };

  renderTopics(formProps: IFormProps) {
    const self = this;
    const { topics } = this.props;

    const onChange = e => {
      e.preventDefault();

      const selectedTopicId = e.target.value;

      const topic = topics.find(t => t._id === selectedTopicId);
      const categories = topic ? topic.categories || [] : [];

      self.setState({
        topicId: selectedTopicId,
        categoryId: categories.length > 0 ? categories[0]._id : ''
      });
    };

    return (
      <FormGroup>
        <ControlLabel required={true}>Choose the knowledgebase</ControlLabel>
        <br />

        <FormControl
          {...formProps}
          name="topicId"
          componentClass="select"
          required={true}
          placeholder={__('Choose knowledgebase')}
          value={self.state.topicId}
          options={self.generateOptions(topics)}
          onChange={onChange}
        />
      </FormGroup>
    );
  }

  renderCategories(formProps: IFormProps) {
    const self = this;
    const topic = this.props.topics.find(t => t._id === self.state.topicId);
    const categories = topic ? topic.categories || [] : [];

    const onChange = e => {
      e.preventDefault();

      self.setState({ categoryId: e.target.value });
    };

    return (
      <FormGroup>
        <ControlLabel required={true}>Choose the category</ControlLabel>
        <br />

        <FormControl
          {...formProps}
          name="categoryId"
          componentClass="select"
          placeholder={__('Choose category')}
          value={self.state.categoryId}
          options={self.generateOptions(categories)}
          onChange={onChange}
          required={true}
        />
      </FormGroup>
    );
  }

  renderContent = (formProps: IFormProps) => {
    const { article, renderButton, closeModal } = this.props;
    const { attachments, reactionChoices, content } = this.state;
    const attachment = this.getFirstAttachment();

    const mimeTypeOptions = FILE_MIME_TYPES.map(item => ({
      value: item.value,
      label: `${item.label} (${item.extension})`
    }));

    const { isSubmitted, values } = formProps;

    const object = article || ({} as IArticle);

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>{__('Title')}</ControlLabel>
          <FormControl
            {...formProps}
            name="title"
            defaultValue={object.title}
            required={true}
            autoFocus={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>{__('Summary')}</ControlLabel>
          <FormControl
            {...formProps}
            name="summary"
            defaultValue={object.summary}
          />
        </FormGroup>

        <FlexContent>
          <FlexItem count={4}>
            <FormGroup>
              <ControlLabel required={true}>{__('Reactions')}</ControlLabel>
              <Select
                multi={true}
                value={reactionChoices}
                options={articleReactions}
                onChange={this.onChangeReactions}
                optionRenderer={this.renderOption}
                valueRenderer={this.renderOption}
                placeholder={__('Select')}
              />
            </FormGroup>
          </FlexItem>
          <FlexItem count={2} hasSpace={true}>
            <FormGroup>
              <ControlLabel required={true}>{__('Status')}</ControlLabel>
              <FormControl
                {...formProps}
                name="status"
                componentClass="select"
                placeholder={__('Select')}
                defaultValue={object.status || 'draft'}
                required={true}
              >
                {[{ value: 'draft' }, { value: 'publish' }].map(op => (
                  <option key={op.value} value={op.value}>
                    {op.value}
                  </option>
                ))}
              </FormControl>
            </FormGroup>
          </FlexItem>
        </FlexContent>

        <FlexContent>
          <FlexItem count={3}>{this.renderTopics(formProps)}</FlexItem>
          <FlexItem count={3} hasSpace={true}>
            {this.renderCategories(formProps)}
          </FlexItem>
        </FlexContent>

        <FormGroup>
          <Uploader
            defaultFileList={attachments}
            onChange={this.onChangeAttachments}
            single={true}
          />
        </FormGroup>

        <FlexContent>
          <FlexItem count={2} hasSpace={true}>
            <FormGroup>
              <ControlLabel>{__('File url')}</ControlLabel>
              <FormControl
                placeholder="Url"
                value={attachment.url || ''}
                onChange={(e: any) =>
                  this.onChangeAttachment('url', e.target.value)
                }
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__('File name')}</ControlLabel>
              <FormControl
                placeholder="Name"
                value={attachment.name || ''}
                onChange={(e: any) =>
                  this.onChangeAttachment('name', e.target.value)
                }
              />
            </FormGroup>
          </FlexItem>
          <FlexItem count={2} hasSpace={true}>
            <FormGroup>
              <ControlLabel>{__('File size (byte)')}</ControlLabel>
              <FormControl
                placeholder="Size (byte)"
                value={attachment.size || ''}
                type="number"
                onChange={(e: any) =>
                  this.onChangeAttachment('size', parseInt(e.target.value, 10))
                }
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__('File type')}</ControlLabel>
              <FormControl
                componentClass="select"
                value={attachment.type || ''}
                onChange={(e: any) =>
                  this.onChangeAttachment('type', e.target.value)
                }
                options={[
                  { value: '', label: 'Select type' },
                  ...mimeTypeOptions
                ]}
              />
            </FormGroup>
          </FlexItem>
        </FlexContent>

        <FormGroup>
          <ControlLabel required={true}>{__('Content')}</ControlLabel>
          <EditorCK
            content={content}
            onChange={this.onChange}
            isSubmitted={isSubmitted}
            height={300}
            name={`knowledgeBase_${article ? article._id : 'create'}`}
          />
        </FormGroup>

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={this.props.closeModal}
            icon="times-circle"
          >
            {__('Cancel')}
          </Button>

          {renderButton({
            name: 'article',
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: article
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default ArticleForm;
