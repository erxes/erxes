import React from 'react';
import Button from 'modules/common/components/Button';
import EditorCK from 'modules/common/components/EditorCK';
import Form from 'modules/common/components/form/Form';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { ModalFooter } from 'modules/common/styles/main';
import { FlexContent, FlexItem } from 'modules/layout/styles';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { IDiscussion } from '../../types';
import DateSelector from '../../common/DateSelecter';
import { ITag } from 'erxes-ui/lib/tags/types';
import Select from 'react-select-plus';

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
};
class DiscussionForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const discussion = this.props.discussion || { content: '' };

    this.state = {
      content: discussion.content,
      startDate: discussion.startDate,
      closeDate: discussion.closeDate,
      tagIds: discussion.tagIds
    };
  }
  generateDoc = (values: {
    _id?: string;
    title: string;
    description: string;
    status: string;
  }) => {
    const { currentTopicId, discussion, forumId } = this.props;
    const { content, startDate, closeDate, tagIds } = this.state;
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
      tagIds
    };
  };

  onChange = e => {
    this.setState({ content: e.editor.getData() });
  };

  onStartDateFieldsChange = (value: any) => {
    this.setState({ startDate: value });
  };

  onCloseDateFieldChange = (value: any) => {
    this.setState({ closeDate: value });
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

  renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton, discussion, tags } = this.props;
    const { content, startDate, closeDate, tagIds } = this.state;
    const { values, isSubmitted } = formProps;
    const object = discussion || ({} as IDiscussion);

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Title</ControlLabel>
          <FormControl
            {...formProps}
            name="title"
            defaultValue={object.title}
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <FormControl
            {...formProps}
            name="description"
            defaultValue={object.description}
          />
        </FormGroup>

        <FlexContent>
          <FlexItem count={2}>
            <FormGroup>
              <ControlLabel>{'Start date'}</ControlLabel>
              <DateSelector
                name={'Start Date'}
                isComplete={object.isComplete}
                date={startDate}
                onChangeField={this.onStartDateFieldsChange}
              />
            </FormGroup>
          </FlexItem>

          <FlexItem count={2} hasSpace={true}>
            <FormGroup>
              <ControlLabel>{'Close date'}</ControlLabel>
              <DateSelector
                name={'Close Date'}
                isComplete={object.isComplete}
                date={closeDate}
                onChangeField={this.onCloseDateFieldChange}
              />
            </FormGroup>
          </FlexItem>
        </FlexContent>

        <FlexContent>
          <FlexItem count={2}>
            <FormGroup>
              <ControlLabel required={true}>{'Status'}</ControlLabel>
              <FormControl
                {...formProps}
                name="status"
                componentClass="select"
                placeholder={'Select'}
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

          <FlexItem count={2} hasSpace={true}>
            <FormGroup>
              <ControlLabel>{'Tags'}</ControlLabel>
              <Select
                placeholder="Select tags"
                value={tagIds}
                options={this.generateTags(tags)}
                onChange={this.onChangeTag}
                multi={true}
              />
            </FormGroup>
          </FlexItem>
        </FlexContent>

        <FormGroup>
          <ControlLabel required={true}>{'Content'}</ControlLabel>
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
