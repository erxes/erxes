import Button from 'modules/common/components/Button';
import EditorCK from 'modules/common/components/EditorCK';
import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import React from 'react';
import { IArticle } from '../../types';

type Props = {
  article: IArticle;
  currentCategoryId: string;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  content: string;
};

class ArticleForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const article = props.article || { content: '' };

    this.state = {
      content: article.content
    };
  }

  generateDoc = (values: {
    _id?: string;
    title: string;
    summary: string;
    status: string;
  }) => {
    const { article, currentCategoryId } = this.props;
    const finalValues = values;

    if (article) {
      finalValues._id = article._id;
    }

    return {
      _id: finalValues._id,
      doc: {
        title: finalValues.title,
        summary: finalValues.summary,
        content: this.state.content,
        status: finalValues.status,
        categoryIds: [currentCategoryId]
      }
    };
  };

  onChange = e => {
    this.setState({ content: e.editor.getData() });
  };

  renderContent = (formProps: IFormProps) => {
    const { article, renderButton, closeModal } = this.props;
    const { isSubmitted, values } = formProps;

    const object = article || ({} as IArticle);

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Title</ControlLabel>
          <FormControl
            {...formProps}
            name="title"
            defaultValue={object.title}
            required={true}
            autoFocus={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Summary</ControlLabel>
          <FormControl
            {...formProps}
            name="summary"
            defaultValue={object.summary}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Content</ControlLabel>
          <EditorCK
            content={this.state.content}
            onChange={this.onChange}
            height={300}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Status</ControlLabel>
          <FormControl
            {...formProps}
            name="status"
            componentClass="select"
            placeholder={__('select')}
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

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={this.props.closeModal}
            icon="cancel-1"
          >
            Cancel
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
