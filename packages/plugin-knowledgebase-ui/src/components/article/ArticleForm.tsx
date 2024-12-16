import {
  IArticle,
  IErxesForm,
  ITopic,
} from '@erxes/ui-knowledgeBase/src/types';
import { FILE_MIME_TYPES } from '@erxes/ui-settings/src/general/constants';
import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Icon from '@erxes/ui/src/components/Icon';
import { RichTextEditor } from '@erxes/ui/src/components/richTextEditor/TEditor';
import Uploader from '@erxes/ui/src/components/Uploader';
import { FlexContent, FlexItem } from '@erxes/ui/src/layout/styles';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import {
  IAttachment,
  IButtonMutateProps,
  IFormProps,
  IOption,
  IPdfAttachment,
} from '@erxes/ui/src/types';
import dayjs from 'dayjs';
import { __, extractAttachment } from 'coreui/utils';
import React from 'react';
import Select, { OnChangeValue } from 'react-select';
import { articleReactions } from '../../icons.constant';

import { FlexRow, Forms, ReactionItem } from './styles';
import PdfUploader from '@erxes/ui/src/components/PdfUploader';

type Props = {
  article: IArticle;
  currentCategoryId: string;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  topics: ITopic[];
  topicId?: string;
};

type State = {
  content: string;
  reactionChoices: string[];
  topicId?: string;
  categoryId: string;
  scheduledDate?: Date;
  attachments: IAttachment[];
  pdfAttachment?: IPdfAttachment | undefined;
  image: IAttachment | null;
  erxesForms: IErxesForm[];
  isPrivate: boolean;
  isScheduled: boolean;
};

class ArticleForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const article = props.article || ({ content: '' } as IArticle);
    const attachments =
      (article.attachments && extractAttachment(article.attachments)) || [];
    const image = article.image ? extractAttachment([article.image])[0] : null;

    this.state = {
      content: article.content,
      reactionChoices: article.reactionChoices || [],
      topicId: article.topicId,
      categoryId: article.categoryId,
      erxesForms: article.forms || [],
      image,
      attachments,
      isPrivate: article.isPrivate || false,
      isScheduled: article.status === 'scheduled' || false,
      scheduledDate:
        article.status === 'scheduled' ? article.scheduledDate : undefined,
      pdfAttachment: article.pdfAttachment || undefined,
    };
  }

  componentDidUpdate(prevProps) {
    const { topics, currentCategoryId } = this.props;
    const self = this;

    if (!this.state.topicId && topics && topics.length > 0) {
      this.setState({
        topicId: self.props.topicId,
        categoryId: currentCategoryId,
      });
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
    code?: string;
  }) => {
    const { article, currentCategoryId } = this.props;
    const {
      attachments,
      content,
      reactionChoices,
      topicId,
      categoryId,
      image,
      erxesForms,
      isPrivate,
      scheduledDate,
    } = this.state;

    const finalValues = values;

    if (article) {
      finalValues._id = article._id;
    }

    const pdfAttachment: any = { ...this.state.pdfAttachment };

    if (pdfAttachment && pdfAttachment.__typename) {
      delete pdfAttachment.__typename;
    }

    if (pdfAttachment.pdf && pdfAttachment.pdf.__typename) {
      delete pdfAttachment.pdf.__typename;
    }

    pdfAttachment.pages = pdfAttachment.pages?.map((p) => {
      const page = { ...p };
      if (page && page.__typename) {
        delete page.__typename;
      }
      return page;
    });

    return {
      _id: finalValues._id,
      doc: {
        title: finalValues.title,
        code: finalValues.code,
        summary: finalValues.summary,
        content,
        reactionChoices,
        status: finalValues.status,
        isPrivate,
        categoryIds: [currentCategoryId],
        topicId,
        forms: erxesForms.map((f) => ({
          formId: f.formId,
          brandId: f.brandId,
        })),
        attachments,
        categoryId,
        image,
        scheduledDate,
        pdfAttachment,
      },
    };
  };

  onChange = (content: string) => {
    this.setState({ content });
  };

  onChangeReactions = (options: OnChangeValue<IOption, true>) => {
    this.setState({ reactionChoices: options.map((option) => option.value) });
  };

  onChangeAttachments = (attachments: IAttachment[]) =>
    this.setState({ attachments });

  onChangeImage = (images: IAttachment[]) => {
    if (images && images.length > 0) {
      this.setState({ image: images[0] });
    } else {
      this.setState({ image: null });
    }
  };

  onChangeIsCheckDate = (e) => {
    const isChecked = (e.currentTarget as HTMLInputElement).checked;
    this.setState({ isPrivate: isChecked });
  };

  onChangeAttachment = (key: string, value: string | number) => {
    this.setState({
      attachments: [
        {
          ...this.getFirstAttachment(),
          [key]: value,
        },
      ],
    });
  };

  onChangeForm = (formId: string, key: string, value: string | number) => {
    const erxesForms = this.state.erxesForms;

    // find current editing one
    const erxesForm = erxesForms.find((form) => form.formId === formId) || [];

    // set new value
    erxesForm[key] = value;

    this.setState({ erxesForms });
  };

  formatDate = (date: Date) => {
    let day = dayjs(date || new Date());

    return day.format('YYYY-MM-DD HH:mm');
  };

  addErxesForm = () => {
    const erxesForms = this.state.erxesForms.slice();

    erxesForms.push({
      brandId: '',
      formId: '',
    });

    this.setState({ erxesForms });
  };

  removeForm = (formId) => {
    let erxesForms = this.state.erxesForms;

    erxesForms = erxesForms.filter((form) => form.formId !== formId);

    this.setState({ erxesForms });
  };

  renderOption = (option) => {
    return (
      <ReactionItem>
        <img src={option.value} alt={option.label} />
        {option.label}
      </ReactionItem>
    );
  };

  generateOptions = (options) => {
    return options.map((option) => ({
      value: option._id,
      label: option.title,
    }));
  };

  renderTopics(formProps: IFormProps) {
    const self = this;
    const { topics } = this.props;

    const onChange = (e) => {
      e.preventDefault();

      const selectedTopicId = e.target.value;

      const topic = topics.find((t) => t._id === selectedTopicId);
      const categories = topic ? topic.categories || [] : [];

      self.setState({
        topicId: selectedTopicId,
        categoryId: categories.length > 0 ? categories[0]._id : '',
      });
    };

    return (
      <FormGroup>
        <ControlLabel required={true}>Choose the knowledgebase</ControlLabel>
        <br />

        <FormControl
          {...formProps}
          name='topicId'
          componentclass='select'
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
    const topic = this.props.topics.find((t) => t._id === self.state.topicId);
    const categories = topic ? topic.categories || [] : [];

    const onChange = (e) => {
      e.preventDefault();

      self.setState({ categoryId: e.target.value });
    };

    return (
      <FormGroup>
        <ControlLabel required={true}>Choose the category</ControlLabel>
        <br />

        <FormControl
          {...formProps}
          name='categoryId'
          componentclass='select'
          placeholder={__('Choose category')}
          value={self.state.categoryId}
          options={self.generateOptions(categories)}
          onChange={onChange}
          required={true}
        />
      </FormGroup>
    );
  }

  renderErxesForm = (form: IErxesForm, formProps: IFormProps) => {
    const remove = () => {
      this.removeForm(form.formId);
    };

    return (
      <FlexRow key={form.formId}>
        <FormGroup>
          <ControlLabel required={true}>{__('Brand id')}</ControlLabel>
          <FormControl
            {...formProps}
            name='brandId'
            required={true}
            defaultValue={form.brandId}
            onChange={(e: any) =>
              this.onChangeForm(form.formId, 'brandId', e.target.value)
            }
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>{__('Form id')}</ControlLabel>
          <FormControl
            {...formProps}
            name='formId'
            required={true}
            defaultValue={form.formId}
            onChange={(e: any) =>
              this.onChangeForm(form.formId, 'formId', e.target.value)
            }
          />
        </FormGroup>

        <Button size='small' btnStyle='danger' onClick={remove}>
          <Icon icon='cancel-1' />
        </Button>
      </FlexRow>
    );
  };

  renderContent = (formProps: IFormProps) => {
    const { article, renderButton, closeModal } = this.props;
    const { attachments, reactionChoices, content, image, isPrivate } =
      this.state;
    const attachment = this.getFirstAttachment();

    const mimeTypeOptions = FILE_MIME_TYPES.map((item) => ({
      value: item.value,
      label: `${item.label} (${item.extension})`,
    }));

    const { isSubmitted, values } = formProps;

    const object = article || ({} as IArticle);

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>{__('Title')}</ControlLabel>
          <FormControl
            {...formProps}
            name='title'
            defaultValue={object.title}
            required={true}
            autoFocus={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>{__('Code')}</ControlLabel>
          <FormControl
            {...formProps}
            name='code'
            defaultValue={object.code}
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>{__('Summary')}</ControlLabel>
          <FormControl
            {...formProps}
            name='summary'
            defaultValue={object.summary}
          />
        </FormGroup>

        <FlexContent>
          <FlexItem count={3}>
            <FormGroup>
              <ControlLabel required={true}>{__('Reactions')}</ControlLabel>
              <Select
                isMulti={true}
                value={articleReactions.filter((o) =>
                  reactionChoices.includes(o.value)
                )}
                options={articleReactions}
                onChange={this.onChangeReactions}
                placeholder={__('Select')}
              />
            </FormGroup>
          </FlexItem>
          <FlexItem count={3} hasSpace={true}>
            <FormGroup>
              <ControlLabel required={true}>{__('is private')}</ControlLabel>
              <FormControl
                componentclass='checkbox'
                checked={isPrivate}
                onChange={this.onChangeIsCheckDate}
              />
            </FormGroup>
          </FlexItem>
        </FlexContent>

        <FlexContent>
          <FlexItem count={3}>{this.renderTopics(formProps)}</FlexItem>
          <FlexItem count={3} hasSpace={true}>
            {this.renderCategories(formProps)}
          </FlexItem>
        </FlexContent>

        <FlexContent>
          <FlexItem count={3}>
            <FormGroup>
              <ControlLabel required={true}>{__('Status')}</ControlLabel>
              <FormControl
                {...formProps}
                name='status'
                componentclass='select'
                placeholder={__('Select')}
                defaultValue={object.status || 'draft'}
                required={true}
                onChange={(e: any) => {
                  if (e.target.value === 'scheduled') {
                    this.setState({
                      isScheduled: true,
                      scheduledDate: new Date(Date.now() + 1000 * 60 * 60),
                    });
                  } else {
                    this.setState({
                      isScheduled: false,
                      scheduledDate: undefined,
                    });
                  }

                  return e.target.value;
                }}
              >
                {[
                  { value: 'draft' },
                  { value: 'scheduled' },
                  { value: 'publish' },
                ].map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.value}
                  </option>
                ))}
              </FormControl>
            </FormGroup>
          </FlexItem>
          {this.state.isScheduled && (
            <FlexItem count={3} hasSpace={true}>
              <FormGroup>
                <ControlLabel required={true}>
                  {__('Publish date')}
                </ControlLabel>
                <FormControl
                  name='scheduledDate'
                  type='datetime-local'
                  defaultValue={this.formatDate(
                    this.state.scheduledDate || new Date()
                  )}
                  onChange={(e: any) => {
                    this.setState({ scheduledDate: new Date(e.target.value) });
                  }}
                />
              </FormGroup>
            </FlexItem>
          )}
        </FlexContent>

        <FormGroup>
          <ControlLabel>{__('Image')}</ControlLabel>
          <Uploader
            defaultFileList={image ? [image] : []}
            onChange={this.onChangeImage}
            single={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>{__('Attachment')}</ControlLabel>
          <Uploader
            defaultFileList={attachments}
            onChange={this.onChangeAttachments}
            single={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>PDF</ControlLabel>
          <PdfUploader
            attachment={this.state.pdfAttachment}
            onChange={(attachment?: IPdfAttachment) => {
              return this.setState({ pdfAttachment: attachment });
            }}
          />
        </FormGroup>

        <FlexContent>
          <FlexItem count={2} hasSpace={true}>
            <FormGroup>
              <ControlLabel>{__('File url')}</ControlLabel>
              <FormControl
                placeholder='Url'
                value={attachment.url || ''}
                onChange={(e: any) =>
                  this.onChangeAttachment('url', e.target.value)
                }
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__('File name')}</ControlLabel>
              <FormControl
                placeholder='Name'
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
                placeholder='Size (byte)'
                value={attachment.size || ''}
                type='number'
                onChange={(e: any) =>
                  this.onChangeAttachment('size', parseInt(e.target.value, 10))
                }
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__('File type')}</ControlLabel>
              <FormControl
                componentclass='select'
                value={attachment.type || ''}
                onChange={(e: any) =>
                  this.onChangeAttachment('type', e.target.value)
                }
                options={[
                  { value: '', label: __('Select type') },
                  ...mimeTypeOptions,
                ]}
              />
            </FormGroup>
          </FlexItem>
          <FlexItem count={2} hasSpace={true}>
            <FormGroup>
              <ControlLabel>{__('File duration (sec)')}</ControlLabel>
              <FormControl
                placeholder='Duration'
                value={attachment.duration || 0}
                onChange={(e: any) =>
                  this.onChangeAttachment(
                    'duration',
                    parseInt(e.target.value, 10)
                  )
                }
              />
            </FormGroup>
          </FlexItem>
        </FlexContent>

        <FormGroup>
          <ControlLabel>{__('erxes forms')}</ControlLabel>
          <Forms>
            {this.state.erxesForms.map((form) =>
              this.renderErxesForm(form, formProps)
            )}
          </Forms>

          <Button
            btnStyle='simple'
            size='small'
            onClick={this.addErxesForm}
            icon='add'
          >
            Add another form
          </Button>
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>{__('Content')}</ControlLabel>
          <RichTextEditor
            content={content}
            onChange={this.onChange}
            isSubmitted={isSubmitted}
            height={300}
            name={`knowledgeBase_${article ? article._id : 'create'}`}
          />
        </FormGroup>

        <ModalFooter>
          <Button
            btnStyle='simple'
            type='button'
            onClick={this.props.closeModal}
            icon='times-circle'
          >
            {__('Cancel')}
          </Button>

          {renderButton({
            passedName: 'article',
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: article,
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
