import React from 'react';
import { IPost, ICategory } from '../../types';
import EditorCK from '@erxes/ui/src/components/EditorCK';
import Form from '@erxes/ui/src/components/form/Form';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Button from '@erxes/ui/src/components/Button';

type Props = {
  post?: IPost;
  closeModal: () => void;
  categories: ICategory[];
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
    categoryId?: string;
    description?: string;
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
      categoryId: finalValues.categoryId,
      description: finalValues.description
    };
  };

  onChange = e => {
    this.setState({ content: e.editor.getData() });
  };

  renderContent = (formProps: IFormProps) => {
    const { post, renderButton, closeModal, categories } = this.props;
    const { content, categoryId } = this.state;

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

        <FormGroup>
          <ControlLabel required={true}>Choose the category</ControlLabel>

          <FormControl
            {...formProps}
            name="categoryId"
            componentClass="select"
            defaultValue={categoryId}
          >
            <option key="null" value="">
              No category
            </option>
            {categories &&
              categories.map(p => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel>{__('Description')}</ControlLabel>
          <FormControl
            {...formProps}
            name="description"
            componentClass="textarea"
            defaultValue={object.description}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>{__('Content')}</ControlLabel>
          <EditorCK
            content={content}
            onChange={this.onChange}
            isSubmitted={isSubmitted}
            height={300}
            name={`post_${post ? post._id : 'create'}`}
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
