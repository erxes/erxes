import {
  generateCategoryOptions,
  MainStyleModalFooter as ModalFooter,
  Button,
  Form as CommonForm,
  ControlLabel,
  FormControl,
  FormGroup,
  Uploader,
  extractAttachment
} from '@erxes/ui/src';
import {
  IAttachment,
  IButtonMutateProps,
  IFormProps
} from '@erxes/ui/src/types';
import React from 'react';
import { ICarCategory } from '../../types';

type Props = {
  categories: ICarCategory[];
  category?: ICarCategory;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  image?: IAttachment;
  secondaryImages?: IAttachment[];
};

class CategoryForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const category = props.category || ({} as ICarCategory);
    const { image, secondaryImages } = category;

    this.state = {
      image: image ? image : undefined,
      secondaryImages: secondaryImages ? secondaryImages : undefined
    };
  }

  generateDoc = (values: {
    _id?: string;
    image?: IAttachment;
    secondaryImages?: IAttachment[];
  }) => {
    const { category } = this.props;
    const finalValues = values;
    const { image, secondaryImages } = this.state;

    if (category) {
      finalValues._id = category._id;
    }

    finalValues.image = image;

    return {
      ...finalValues,
      image,
      secondaryImages
    };
  };
  onChangeAttachment = (files: IAttachment[]) => {
    this.setState({ image: files.length ? files[0] : undefined });
  };

  onChangeAttachmentMore = (files: IAttachment[]) => {
    this.setState({ secondaryImages: files ? files : undefined });
  };

  renderContent = (formProps: IFormProps) => {
    const { renderButton, closeModal, category, categories } = this.props;
    const { values, isSubmitted } = formProps;

    const object = category || ({} as ICarCategory);

    const image = (object.image && extractAttachment([object.image])) || [];

    const secondaryImages =
      (object.secondaryImages && extractAttachment(object.secondaryImages)) ||
      [];

    if (category) {
      values._id = category._id;
    }

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>
          <FormControl
            {...formProps}
            name="name"
            defaultValue={object.name}
            autoFocus={true}
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Code</ControlLabel>
          <FormControl
            {...formProps}
            name="code"
            defaultValue={object.code}
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <FormControl
            {...formProps}
            name="description"
            componentClass="textarea"
            rows={5}
            defaultValue={object.description}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Parent Category</ControlLabel>

          <FormControl
            {...formProps}
            name="parentId"
            componentClass="select"
            defaultValue={object.parentId}
          >
            <option value="" />
            {generateCategoryOptions(categories, object._id, true)}
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel>Image</ControlLabel>

          <Uploader
            defaultFileList={image}
            onChange={this.onChangeAttachment}
            multiple={false}
            single={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Secondary Images</ControlLabel>

          <Uploader
            defaultFileList={secondaryImages}
            onChange={this.onChangeAttachmentMore}
            multiple={true}
            single={false}
          />
        </FormGroup>

        <ModalFooter>
          <Button
            btnStyle="simple"
            onClick={closeModal}
            icon="times-circle"
            uppercase={false}
          >
            Close
          </Button>

          {renderButton({
            name: 'car category',
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: category
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <CommonForm renderContent={this.renderContent} />;
  }
}

export default CategoryForm;
