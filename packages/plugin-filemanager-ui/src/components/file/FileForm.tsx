import {
  IAttachment,
  IButtonMutateProps,
  IFormProps,
  IOption
} from '@erxes/ui/src/types';

import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import EditorCK from '@erxes/ui/src/components/EditorCK';
import { FILE_MIME_TYPES } from '@erxes/ui-settings/src/general/constants';
import Form from '@erxes/ui/src/components/form/Form';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { IFile } from '../../types';
import Icon from '@erxes/ui/src/components/Icon';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import React from 'react';
import Select from 'react-select-plus';
import Uploader from '@erxes/ui/src/components/Uploader';
import { __ } from 'coreui/utils';

type Props = {
  file?: IFile;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  // content: string;
  // reactionChoices: string[];
  // topicId?: string;
  // categoryId: string;
  // attachments: IAttachment[];
  // image: IAttachment | null;
};

class FileForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const file = props.file || ({} as IFile);
    // const attachments =
    //   (article.attachments && extractAttachment(article.attachments)) || [];
    // const image = article.image ? extractAttachment([article.image])[0] : null;

    this.state = {
      // content: article.content,
      // reactionChoices: article.reactionChoices || [],
      // topicId: article.topicId,
      // categoryId: article.categoryId,
      // erxesForms: article.forms || [],
      // image,
      // attachments,
    };
  }

  componentDidUpdate(prevProps) {
    // const { topics, currentCategoryId } = this.props;
    // if (!this.state.topicId && topics && topics.length > 0) {
    //   this.setState({ topicId: topics[0]._id, categoryId: currentCategoryId });
    // }
  }

  onChangeAttachments = (attachments: IAttachment[]) =>
    this.setState({ attachments });

  // getFirstAttachment = () => {
  //   const { attachments } = this.state;

  //   return attachments.length > 0 ? attachments[0] : ({} as IAttachment);
  // };

  generateDoc = (values: {
    _id?: string;
    title: string;
    summary: string;
    status: string;
  }) => {
    const { file } = this.props;
    // const {
    //   attachments,
    //   content,
    //   reactionChoices,
    //   topicId,
    //   categoryId,
    //   image,
    //   erxesForms,
    // } = this.state;

    const finalValues = values;

    if (file) {
      finalValues._id = file._id;
    }

    return {
      _id: finalValues._id,
      doc: {
        title: finalValues.title,
        summary: finalValues.summary
        // content,
        // reactionChoices,
        // status: finalValues.status,
        // categoryIds: [currentCategoryId],
        // topicId,
        // forms: erxesForms.map((f) => ({
        //   formId: f.formId,
        //   brandId: f.brandId,
        // })),
        // attachments,
        // categoryId,
        // image,
      }
    };
  };

  renderContent = (formProps: IFormProps) => {
    const { file, renderButton, closeModal } = this.props;
    // const { attachments, reactionChoices, content, image } = this.state;
    // const attachment = this.getFirstAttachment();

    const mimeTypeOptions = FILE_MIME_TYPES.map(item => ({
      value: item.value,
      label: `${item.label} (${item.extension})`
    }));

    const { isSubmitted, values } = formProps;

    const object = file || ({} as IFile);

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>{__('Name')}</ControlLabel>
          <FormControl
            {...formProps}
            name="name"
            defaultValue={object.name}
            required={true}
            autoFocus={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>{__('Attachment')}</ControlLabel>
          <Uploader
            defaultFileList={[]}
            onChange={this.onChangeAttachments}
            single={true}
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
            object: file
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default FileForm;
