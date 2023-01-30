import React from 'react';
import CategorySelect from '../containers/CategorySelect';
import { IPost } from '../types';
import EditorCK from '@erxes/ui/src/components/EditorCK';
import Form from '@erxes/ui/src/components/form/Form';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { FlexContent, FlexItem } from '@erxes/ui/src/layout/styles';
import Button from '@erxes/ui/src/components/Button';

type Props = {
  post?: IPost;
  closeModal: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

type State = {
  content: string;
  title: string;
  categoryId: string;
};

class PostForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const post = props.post || ({ content: '' } as any);

    this.state = {
      content: post.content,
      title: post.title,
      categoryId: post.categoryId
    };
  }

  generateDoc = (values: {
    _id?: string;
    title: string;
    thumbnail: string;
  }) => {
    const { post } = this.props;
    const finalValues = values;

    if (post) {
      finalValues._id = post._id;
    }

    return {
      _id: finalValues._id,
      title: finalValues.title,
      content: this.state.content,
      thumbnail: finalValues.thumbnail,
      categoryId: this.state.categoryId
    };
  };

  onChange = e => {
    this.setState({ content: e.editor.getData() });
  };

  renderCategories() {
    const { categoryId } = this.state;

    return (
      <FormGroup>
        <ControlLabel required={true}>Choose the category</ControlLabel>
        <br />
        <CategorySelect
          value={categoryId}
          onChange={e => {
            this.setState({ categoryId: e });
          }}
        />
      </FormGroup>
    );
  }

  renderContent = (formProps: IFormProps) => {
    const { post, renderButton, closeModal } = this.props;
    const { content } = this.state;

    const { isSubmitted, values } = formProps;

    const object = post || ({} as any);

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
          <ControlLabel>{__('Thumbnail')}</ControlLabel>
          <FormControl
            {...formProps}
            name="thumbnail"
            defaultValue={object.thumbnail}
          />
        </FormGroup>

        <FlexContent>
          <FlexItem count={3} hasSpace={true}>
            {this.renderCategories()}
          </FlexItem>
        </FlexContent>

        <FormGroup>
          <ControlLabel required={true}>{__('Content')}</ControlLabel>
          <EditorCK
            content={content}
            onChange={this.onChange}
            isSubmitted={isSubmitted}
            height={300}
            name={`knowledgeBase_${post ? post._id : 'create'}`}
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
            passedName: 'article',
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: post
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default PostForm;
