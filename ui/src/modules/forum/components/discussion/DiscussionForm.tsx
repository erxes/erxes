import React from 'react';
import Button from 'modules/common/components/Button';
import EditorCK from 'modules/common/components/EditorCK';
import Form from 'modules/common/components/form/Form';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { ModalFooter } from 'modules/common/styles/main';
import { FlexContent, FlexItem } from 'modules/layout/styles';
import {
  IAttachment,
  IButtonMutateProps,
  IFormProps
} from 'modules/common/types';
import { IDiscussion } from '../../types';
import { ITag } from 'erxes-ui/lib/tags/types';
import Select from 'react-select-plus';
import Uploader from 'modules/common/components/Uploader';
import Icon from 'modules/common/components/Icon';
import { DateWrapper } from 'modules/forms/styles';
import DateControl from 'modules/common/components/form/DateControl';
import { __ } from 'modules/common/utils';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  currentTopicId: string;
  discussion: IDiscussion;
  forumId: string;
  tags: ITag[];
};

type State = {
  content: string;
  startDate: Date;
  closeDate: Date;
  tagIds: string[];
  attachments?: IAttachment[];
};
class DiscussionForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const discussion = this.props.discussion || { content: '' };

    this.state = {
      content: discussion.content,
      startDate: discussion.startDate,
      closeDate: discussion.closeDate,
      tagIds: discussion.tagIds,
      attachments: discussion.attachments
    };
  }
  generateDoc = (values: {
    _id?: string;
    title: string;
    description: string;
    status: string;
  }) => {
    const { currentTopicId, discussion, forumId } = this.props;
    const { content, startDate, closeDate, tagIds, attachments } = this.state;
    const finalValues = values;

    if (discussion) {
      finalValues._id = discussion._id;
    }

    return {
      _id: finalValues._id,

      topicId: currentTopicId,
      title: finalValues.title,
      description: finalValues.description,
      forumId,
      content,
      status: finalValues.status,
      startDate,
      closeDate,
      tagIds,
      attachments
    };
  };

  onChange = e => {
    this.setState({ content: e.editor.getData() });
  };

  onStartDateFieldsChange = (startDate: any) => {
    this.setState({ startDate });
  };

  onCloseDateFieldChange = (closeDate: any) => {
    this.setState({ closeDate });
  };

  onChangeTag = items => {
    this.setState({ tagIds: items.map(el => el.value) });
  };

  generateTags = items => {
    return items.map(el => {
      return {
        value: el._id,
        label: el.name
      };
    });
  };

  onChangeAttachment = files => this.setState({ attachments: files });

  renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton, discussion, tags } = this.props;
    const { content, startDate, closeDate, tagIds, attachments } = this.state;
    const { values, isSubmitted } = formProps;
    const object = discussion || ({} as IDiscussion);

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>{__('Title')}</ControlLabel>
          <FormControl
            {...formProps}
            name="title"
            defaultValue={object.title}
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>{__('Description')}</ControlLabel>
          <FormControl
            {...formProps}
            name="description"
            defaultValue={object.description}
          />
        </FormGroup>

        <FlexContent>
          <FlexItem count={2}>
            <FormGroup>
              <ControlLabel required={false}>{__('Start date')}</ControlLabel>
              <DateWrapper>
                <DateControl
                  {...formProps}
                  required={false}
                  name="startDate"
                  placeholder={__('Choose start date')}
                  value={startDate}
                  onChange={this.onStartDateFieldsChange}
                  timeFormat={true}
                />
              </DateWrapper>
            </FormGroup>
          </FlexItem>

          <FlexItem count={2} hasSpace={true}>
            <FormGroup>
              <ControlLabel required={false}>{__('End date')}</ControlLabel>
              <DateWrapper>
                <DateControl
                  {...formProps}
                  required={false}
                  name="closeDate"
                  placeholder={__('Choose end date')}
                  value={closeDate}
                  onChange={this.onCloseDateFieldChange}
                  timeFormat={true}
                />
              </DateWrapper>
            </FormGroup>
          </FlexItem>
        </FlexContent>

        <FlexContent>
          <FlexItem count={2}>
            <FormGroup>
              <ControlLabel required={true}>{__('Status')}</ControlLabel>
              <FormControl
                {...formProps}
                name="status"
                componentClass="select"
                placeholder={__('Select')}
                defaultValue={object.status || 'publish'}
                required={true}
              >
                {[{ value: 'publish' }, { value: 'closed' }].map(op => (
                  <option key={op.value} value={op.value}>
                    {op.value}
                  </option>
                ))}
              </FormControl>
            </FormGroup>
          </FlexItem>

          <FlexItem count={2} hasSpace={true}>
            <FormGroup>
              <ControlLabel>{__('Tags')}</ControlLabel>
              <Select
                placeholder={__('Choose your tags')}
                value={tagIds}
                options={this.generateTags(tags)}
                onChange={this.onChangeTag}
                multi={true}
              />
            </FormGroup>
          </FlexItem>
        </FlexContent>

        <FormGroup>
          <ControlLabel>
            <Icon icon="paperclip" />
            {__('Attachments')}
          </ControlLabel>

          <Uploader
            defaultFileList={attachments || []}
            onChange={this.onChangeAttachment}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>{__('Content')}</ControlLabel>
          <EditorCK
            content={content}
            onChange={this.onChange}
            isSubmitted={formProps.isSaved}
            height={300}
            name={`Discussion content`}
          />
        </FormGroup>

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={closeModal}
            icon="cancel-1"
          >
            Cancel
          </Button>

          {renderButton({
            name: 'discussion',
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: discussion
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default DiscussionForm;
