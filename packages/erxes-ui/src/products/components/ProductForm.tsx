import React from "react";

import SelectCompanies from "../../companies/containers/SelectCompanies";
import Button from "../../components/Button";
import EditorCK from "../../components/EditorCK";
import FormControl from "../../components/form/Control";
import CommonForm from "../../components/form/Form";
import FormGroup from "../../components/form/Group";
import ControlLabel from "../../components/form/Label";
import ModalTrigger from "../../components/ModalTrigger";
import Uploader from "../../components/Uploader";
import { ModalFooter, FormColumn, FormWrapper } from "../../styles/main";
import { IAttachment, IButtonMutateProps, IFormProps } from "../../types";
import { extractAttachment, generateCategoryOptions } from "../../utils";
import { TYPES, PRODUCT_SUPPLY } from "../constants";
import CategoryForm from "../containers/CategoryForm";
import { Row } from "../styles";
import { IProduct, IProductCategory } from "../types";

type Props = {
  product?: IProduct;
  productCategories: IProductCategory[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  disabled: boolean;
  productCount: number;
  minimiumCount: number;
  attachment?: IAttachment;
  attachmentMore?: IAttachment[];
  vendorId: string;
  description: string;
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const product = props.product || ({} as IProduct);
    const {
      attachment,
      attachmentMore,
      supply,
      productCount,
      minimiumCount,
      vendorId,
      description,
    } = product;

    this.state = {
      disabled: supply === "limited" ? false : true,
      productCount: productCount ? productCount : 0,
      minimiumCount: minimiumCount ? minimiumCount : 0,
      attachment: attachment ? attachment : undefined,
      attachmentMore: attachmentMore ? attachmentMore : undefined,
      vendorId: vendorId ? vendorId : "",
      description: description ? description : "",
    };
  }

  generateDoc = (values: {
    _id?: string;
    attachment?: IAttachment;
    attachmentMore?: IAttachment[];
    productCount: number;
    minimiumCount: number;
    vendorId: string;
    description: string;
  }) => {
    const { product } = this.props;
    const finalValues = values;
    const {
      attachment,
      attachmentMore,
      productCount,
      minimiumCount,
      vendorId,
      description,
    } = this.state;

    if (product) {
      finalValues._id = product._id;
    }

    finalValues.attachment = attachment;

    return {
      ...finalValues,
      attachment,
      attachmentMore,
      productCount,
      minimiumCount,
      vendorId,
      description,
    };
  };

  renderFormTrigger(trigger: React.ReactNode) {
    const content = (props) => (
      <CategoryForm {...props} categories={this.props.productCategories} />
    );

    return (
      <ModalTrigger title="Add category" trigger={trigger} content={content} />
    );
  }

  onComboEvent = (variable: string, e) => {
    const value = variable === "vendorId" ? e : e.target.value;

    this.setState({ [variable]: value } as any);
  };

  onChangeDescription = (e) => {
    this.setState({ description: e.editor.getData() });
  };

  onChangeAttachment = (files: IAttachment[]) => {
    this.setState({ attachment: files.length ? files[0] : undefined });
  };

  onChangeAttachmentMore = (files: IAttachment[]) => {
    this.setState({ attachmentMore: files ? files : undefined });
  };

  onSupplyChange = (e) => {
    const { productCount, minimiumCount } = this.state;
    const islimited = e.target.value === "limited";
    const isUnique = e.target.value === "unique"

    this.setState({
      disabled: islimited ? false : true,
      productCount: islimited ? productCount : isUnique ? 1 :  0,
      minimiumCount: islimited ? minimiumCount : 0,
    });
  };

  renderContent = (formProps: IFormProps) => {
    const { renderButton, closeModal, product, productCategories } = this.props;
    const { values, isSubmitted } = formProps;
    const object = product || ({} as IProduct);

    const types = TYPES.ALL;

    const trigger = (
      <Button btnStyle="primary" uppercase={false} icon="plus-circle">
        Add category
      </Button>
    );

    const attachments =
      (object.attachment && extractAttachment([object.attachment])) || [];

    const attachmentsMore =
      (object.attachmentMore && extractAttachment(object.attachmentMore)) || [];

    const {
      vendorId,
      description,
      productCount,
      disabled,
      minimiumCount,
    } = this.state;

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
          <ControlLabel required={true}>Type</ControlLabel>
          <FormControl
            {...formProps}
            name="type"
            componentClass="select"
            defaultValue={object.type}
            required={true}
          >
            {types.map((typeName, index) => (
              <option key={index} value={typeName}>
                {typeName}
              </option>
            ))}
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Code</ControlLabel>
          <p>
            Depending on your business type, you may type in a barcode or any
            other UPC (Universal Product Code). If you don't use UPC, type in
            any numeric value to differentiate your products.
          </p>
          <FormControl
            {...formProps}
            name="code"
            defaultValue={object.code}
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Category</ControlLabel>
          <Row>
            <FormControl
              {...formProps}
              name="categoryId"
              componentClass="select"
              defaultValue={object.categoryId}
              required={true}
            >
              {generateCategoryOptions(productCategories)}
            </FormControl>

            {this.renderFormTrigger(trigger)}
          </Row>
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <EditorCK
            content={description}
            onChange={this.onChangeDescription}
            height={150}
            isSubmitted={formProps.isSaved}
            name={`product_description_${description}`}
            toolbar={[
              {
                name: "basicstyles",
                items: [
                  "Bold",
                  "Italic",
                  "NumberedList",
                  "BulletedList",
                  "Link",
                  "Unlink",
                  "-",
                  "Image",
                  "EmojiPanel",
                ],
              },
            ]}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Product supply</ControlLabel>

          <FormControl
            {...formProps}
            name="supply"
            componentClass="select"
            onChange={this.onSupplyChange}
            defaultValue={object.supply}
            options={PRODUCT_SUPPLY}
          ></FormControl>
        </FormGroup>

        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel>Product count</ControlLabel>

              <FormControl
                {...formProps}
                name="productCount"
                value={productCount}
                disabled={disabled}
                onChange={this.onComboEvent.bind(this, "productCount")}
                type="number"
              ></FormControl>
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel>Minimium count</ControlLabel>

              <FormControl
                {...formProps}
                name="minimiumCount"
                value={minimiumCount}
                disabled={disabled}
                onChange={this.onComboEvent.bind(this, "minimiumCount")}
                type="number"
              ></FormControl>
            </FormGroup>
          </FormColumn>
        </FormWrapper>

        <FormGroup>
          <ControlLabel>Featured image</ControlLabel>

          <Uploader
            defaultFileList={attachments}
            onChange={this.onChangeAttachment}
            multiple={false}
            single={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Secondary Images</ControlLabel>

          <Uploader
            defaultFileList={attachmentsMore}
            onChange={this.onChangeAttachmentMore}
            multiple={true}
            single={false}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Vendor</ControlLabel>
          <SelectCompanies
            label="Choose an vendor"
            name="vendorId"
            customOption={{ value: "", label: "No vendor chosen" }}
            initialValue={vendorId}
            onSelect={this.onComboEvent.bind(this, "vendorId")}
            multi={false}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Unit price</ControlLabel>
          <p>
            Please ensure you have set the default currency in the{' '}
            <a href="/settings/general"> {('General Settings')}</a> of the
            System Configuration.
          </p>
          <FormControl
            {...formProps}
            type="number"
            name="unitPrice"
            defaultValue={object.unitPrice}
            required={true}
            min={0}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>SKU</ControlLabel>
          <FormControl {...formProps} name="sku" defaultValue={object.sku} />
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
            name: "product and service",
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: product,
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <CommonForm renderContent={this.renderContent} />;
  }
}

export default Form;
