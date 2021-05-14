import Button from 'modules/common/components/Button';
import EditorCK from 'modules/common/components/EditorCK';
import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps, IOption } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import { articleReactions } from 'modules/knowledgeBase/icons.constant';
import { FlexContent, FlexItem } from 'modules/layout/styles';
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
};

class ArticleForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const article = props.article || { content: '' };

    this.state = {
      content: article.content,
      reactionChoices: article.reactionChoices || [],
      topicId: article.topicId,
      categoryId: article.categoryId
    };
  }

  generateDoc = (values: {
    _id?: string;
    title: string;
    summary: string;
    status: string;
  }) => {
    const { article, currentCategoryId } = this.props;
    const { content, reactionChoices, topicId, categoryId } = this.state;

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

  renderTopics() {
    const self = this;
    const { topics } = this.props;

    const onChange = selectedTopic => {
      self.setState({ topicId: selectedTopic.value, categoryId: '' });
    };

    return (
      <FormGroup>
        <ControlLabel>Choose the knowledgebase</ControlLabel>
        <br />

        <Select
          placeholder={__('Choose knowledgebase')}
          value={self.state.topicId}
          options={self.generateOptions(topics)}
          onChange={onChange}
        />
      </FormGroup>
    );
  }

  renderCategories() {
    const self = this;
    const topic = this.props.topics.find(t => t._id === self.state.topicId);
    const categories = topic ? topic.categories : [];

    const onChange = selectedCategory => {
      self.setState({ categoryId: selectedCategory.value });
    };

    return (
      <FormGroup>
        <ControlLabel>Choose the category</ControlLabel>
        <br />

        <Select
          placeholder={__('Choose category')}
          value={self.state.categoryId}
          options={self.generateOptions(categories)}
          onChange={onChange}
        />
      </FormGroup>
    );
  }

  renderContent = (formProps: IFormProps) => {
    const { article, renderButton, closeModal } = this.props;
    const { reactionChoices, content } = this.state;

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
          <FlexItem count={3}>{this.renderTopics()}</FlexItem>
          <FlexItem count={3} hasSpace={true}>
            {this.renderCategories()}
          </FlexItem>
        </FlexContent>

        <FormGroup>
          <ControlLabel required={true}>{__('Content')}</ControlLabel>
          <EditorCK
            content={content}
            onChange={this.onChange}
            isSubmitted={formProps.isSaved}
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
            uppercase={false}
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
