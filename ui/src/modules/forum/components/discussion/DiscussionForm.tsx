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

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  currentTopicId: string;
  discussion: IDiscussion;
  forumId: string;
};

type State = {
  content: string;
};
class DiscussionForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const discussion = this.props.discussion || { content: '' };

    this.state = {
      content: discussion.content
    };
  }
  generateDoc = (values: {
    _id?: string;
    title: string;
    description: string;
    status: string;
  }) => {
    const { currentTopicId, discussion, forumId } = this.props;
    const { content } = this.state;
    const finalValues = values;

    if (discussion) {
      finalValues._id = discussion._id;
    }

    return {
      _id: finalValues._id,
      doc: {
        topicId: currentTopicId,
        title: finalValues.title,
        description: finalValues.description,
        forumId,
        content,
        status: finalValues.status
      }
    };
  };

  onChange = e => {
    this.setState({ content: e.editor.getData() });
  };

  renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton, discussion } = this.props;
    const { content } = this.state;
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
              <ControlLabel required={true}>{'Start date'}</ControlLabel>
            </FormGroup>
          </FlexItem>

          <FlexItem count={2} hasSpace={true}>
            <FormGroup>
              <ControlLabel required={true}>{'Close date'}</ControlLabel>
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
            name: 'topic',
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
