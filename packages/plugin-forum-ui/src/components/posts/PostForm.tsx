import React from 'react';
import { IPost, ICategory, IPollOption } from '../../types';
import EditorCK from '@erxes/ui/src/components/EditorCK';
import Form from '@erxes/ui/src/components/form/Form';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Button from '@erxes/ui/src/components/Button';
import Select from 'react-select-plus';

type Props = {
  post?: IPost;
  tags?: any;
  closeModal: () => void;
  categories: ICategory[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

type State = {
  content: string;
  title: string;
  categoryId: string;
  selectedTags: string[];
};

class PostForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const post = props.post || ({ content: '' } as any);

    this.state = {
      content: post.content,
      title: post.title,
      categoryId: post.categoryId,
      selectedTags: post.tagIds || []
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
      description: finalValues.description,
      tagIds: this.state.selectedTags
    };
  };

  onChange = e => {
    this.setState({ content: e.editor.getData() });
  };

  renderOptions = () => {
    const { categories } = this.props;

    return (
      <>
        <option key="null" value="">
          No category
        </option>
        {categories &&
          categories.map(p => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
      </>
    );
  };

  renderContent = (formProps: IFormProps) => {
    const { post, renderButton, closeModal, tags } = this.props;
    const { content, categoryId, selectedTags } = this.state;

    const { isSubmitted, values } = formProps;

    const object = post || ({} as any);

    const renderTagOptions = () => {
      return tags.map(tag => ({
        value: tag._id,
        label: tag.name,
        _id: tag._id
      }));
    };

    const onChange = members => {
      const ids = members.map(m => m._id);
      this.setState({ selectedTags: ids });
    };

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
            {this.renderOptions()}
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
          <ControlLabel>{__('Tags')}</ControlLabel>
          <Select
            placeholder={__('Choose tags')}
            options={renderTagOptions()}
            value={selectedTags}
            onChange={onChange}
            multi={true}
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
