import {
  generateCategoryOptions,
  MainStyleModalFooter as ModalFooter,
  Button,
  Form as CommonForm,
  ControlLabel,
  FormControl,
  FormGroup,
  Uploader,
  extractAttachment,
} from '@erxes/ui/src';
import {
  IAttachment,
  IButtonMutateProps,
  IFormProps,
} from '@erxes/ui/src/types';
import React, { useState } from 'react';
import { ICarCategory } from '../../types';

type Props = {
  categories: ICarCategory[];
  category?: ICarCategory;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

const CategoryForm = (props: Props) => {
  const {
    categories,
    category = {} as ICarCategory,
    renderButton,
    closeModal,
  } = props;

  const [image, setImage] = useState<IAttachment | undefined>(
    category.image || undefined,
  );
  const [images, setImages] = useState<IAttachment[] | undefined>(
    category.secondaryImages || undefined,
  );

  const generateDoc = (values: {
    _id?: string;
    image?: IAttachment;
    secondaryImages?: IAttachment[];
  }) => {
    const finalValues = values;

    if (category) {
      finalValues._id = category._id;
    }

    finalValues.image = image;

    return {
      ...finalValues,
      image,
      secondaryImages: images,
    };
  };

  const onChangeAttachment = (files: IAttachment[]) => {
    setImage(files.length ? files[0] : undefined);
  };

  const onChangeAttachmentMore = (files: IAttachment[]) => {
    setImages(files ? files : undefined);
  };

  const renderContent = (formProps: IFormProps) => {
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
            onChange={onChangeAttachment}
            multiple={false}
            single={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Secondary Images</ControlLabel>

          <Uploader
            defaultFileList={secondaryImages}
            onChange={onChangeAttachmentMore}
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
            values: generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: props.category,
          })}
        </ModalFooter>
      </>
    );
  };
  return <CommonForm renderContent={renderContent} />;
};

export default CategoryForm;
