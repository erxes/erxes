import {
  Button,
  Form as CommonForm,
  ControlLabel,
  FormControl,
  FormGroup,
  MainStyleModalFooter as ModalFooter,
  Uploader,
  extractAttachment,
  generateCategoryOptions,
} from "@erxes/ui/src";
import {
  IAttachment,
  IButtonMutateProps,
  IFormProps,
} from "@erxes/ui/src/types";

import { ICarCategory } from "../../types";
import React from "react";
import SelectProductCategory from "@erxes/ui-products/src/containers/SelectProductCategory";

type Props = {
  categories: ICarCategory[];
  category?: ICarCategory;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  image?: IAttachment;
  secondaryImages?: IAttachment[];
  productCategoryId?: String;
};

class CategoryForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const category = props.category || ({} as ICarCategory);
    const { image, secondaryImages, productCategoryId } = category;

    this.state = {
      image: image ? image : undefined,
      secondaryImages: secondaryImages || undefined,
      productCategoryId: productCategoryId || "",
    };
  }

  generateDoc = (values: {
    _id?: string;
    image?: IAttachment;
    secondaryImages?: IAttachment[];
    productCategoryId?: string;
  }) => {
    const { category } = this.props;
    const finalValues = values;
    const { image, secondaryImages, productCategoryId } = this.state;

    if (category) {
      finalValues._id = category._id;
    }

    finalValues.image = image;

    return {
      ...finalValues,
      image,
      secondaryImages,
      productCategoryId,
    };
  };
  onChangeAttachment = (files: IAttachment[]) => {
    this.setState({ image: files.length ? files[0] : undefined });
  };

  onChangeAttachmentMore = (files: IAttachment[]) => {
    this.setState({ secondaryImages: files ? files : undefined });
  };

  onSelectChange = (value) => {
    this.setState({ productCategoryId: value });
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
            componentclass="textarea"
            rows={5}
            defaultValue={object.description}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Parent Category</ControlLabel>

          <FormControl
            {...formProps}
            name="parentId"
            componentclass="select"
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

        <FormGroup>
          <ControlLabel>Product Category</ControlLabel>

          <SelectProductCategory
            label="Choose product category"
            name="productCategoryId"
            initialValue={object.productCategoryId || ""}
            customOption={{
              value: "",
              label: "...Clear product category filter",
            }}
            onSelect={(categoryId) => this.onSelectChange(categoryId)}
            multi={false}
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
            name: "car category",
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: category,
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
