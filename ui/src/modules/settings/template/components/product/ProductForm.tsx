import React from 'react';
// 'erxes-ui/lib/products/containers/ProductForm';
// import SelectCompanies from 'erxes-ui/lib/companies/containers/SelectCompanies';
import Button from 'erxes-ui/lib/components/Button';
// import EditorCK from 'erxes-ui/lib/components/EditorCK';
import FormControl from 'erxes-ui/lib/components/form/Control';
import CommonForm from 'erxes-ui/lib/components/form/Form';
import FormGroup from 'erxes-ui/lib/components/form/Group';
import ControlLabel from 'erxes-ui/lib/components/form/Label';
// import ModalTrigger from 'erxes-ui/lib/components/ModalTrigger';
// import Uploader from 'erxes-ui/lib/components/Uploader';
import { ModalFooter } from 'erxes-ui/lib/styles/main';
import { IButtonMutateProps, IFormProps } from 'erxes-ui/lib/types';
// import { extractAttachment, generateCategoryOptions } from 'erxes-ui/lib/utils';
// import { TYPES } from 'erxes-ui/lib/products/constants';
// import CategoryForm from 'erxes-ui/lib/products/containers/CategoryForm';
// import { Row } from 'erxes-ui/lib/products/styles';
import { IProduct, IProductCategory } from '../../types';
import {
  MainStyleFormColumn as FormColumn,
  MainStyleFormWrapper as FormWrapper
} from 'erxes-ui';
import { TYPE_CHOICES } from '../../constants';

type Props = {
  product?: IProduct;
  productCategories: IProductCategory[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

class Form extends React.Component<Props> {
  // renderFormTrigger(trigger: React.ReactNode) {
  //   const content = props => (
  //     <CategoryForm {...props} categories={this.props.productCategories} />
  //   );

  //   return (
  //     <ModalTrigger title="Add category" trigger={trigger} content={content} />
  //   );
  // }

  renderContent = (formProps: IFormProps) => {
    const { renderButton, closeModal, product } = this.props;
    const { values, isSubmitted } = formProps;
    const object = product || ({} as IProduct);

    // const types = TYPE_CHOICES.ALL;

    if (product) {
      values._id = product._id;
      values.attachment = product.attachment
        ? { ...product.attachment, __typename: undefined }
        : null;
      values.description = product.description;
      values.vendorId = product.vendorId;
    }

    // const trigger = (
    //   <Button btnStyle="primary" uppercase={false} icon="plus-circle">
    //     Add category
    //   </Button>
    // );

    // const onChangeAttachment = (files: IAttachment[]) => {
    //   values.attachment = files.length ? files[0] : null;
    //   object.attachment = values.attachment;
    // };

    // const onChangeDescription = e => {
    //   values.description = e.editor.getData();
    //   object.description = values.description;
    // };

    // const onSelectCompany = vendorId => {
    //   object.vendorId = vendorId;
    //   values.vendorId = vendorId;
    // };

    // const attachments =
    //   (object.attachment && extractAttachment([object.attachment])) || [];

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Type</ControlLabel>
          <FormControl
            {...formProps}
            name="type"
            defaultValue={object.type}
            required={true}
            componentClass="select"
            options={TYPE_CHOICES}
          >
          </FormControl>
        </FormGroup>

        <FormWrapper>
          <FormColumn >
            <FormGroup>
              <ControlLabel required={true}>Title</ControlLabel>
              <FormControl
                {...formProps}
                name="title"
                autoFocus={true}
                required={true}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel>Discount</ControlLabel>
              <FormControl
                {...formProps}
                name="discountMain"
                type="number"
                min={1}
                max={100}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel>Total amount</ControlLabel>
              <FormControl
                {...formProps}
                name="amount"
                type="number"
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>


        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <FormControl
            {...formProps}
            name="description"
            defaultValue={object.description}
            componentClass="textarea"
            rows={3}
            required={true}
          />
        </FormGroup>

        <FormWrapper>
          <FormColumn >
            <FormGroup>
              <ControlLabel required={true}>Category</ControlLabel>
              <FormControl
                {...formProps}
                name="category"
                required={true}
                componentClass="select"
                options={TYPE_CHOICES}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Item</ControlLabel>
              <FormControl
                {...formProps}
                name="item"
                required={true}
                componentClass="select"
                options={TYPE_CHOICES}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel>Unit price</ControlLabel>
              <FormControl
                {...formProps}
                name="unitPrice"
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Quantity</ControlLabel>
              <FormControl
                {...formProps}
                name="quantity"
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Discount</ControlLabel>
              <FormControl
                {...formProps}
                name="discount"
              />
            </FormGroup>
          </FormColumn>

          <FormColumn>
            <Button
              btnStyle="simple"
              uppercase={false}
            >
              X
            </Button>
          </FormColumn>

        </FormWrapper>

        <Button
          btnStyle="primary"
          uppercase={false}
          icon="plus"
        >
          Add more
        </Button>

        <ModalFooter>
          <Button
            btnStyle="simple"
            onClick={closeModal}
            uppercase={false}
          >
            Close
          </Button>

          {renderButton({
            name: 'Save',
            values,
            isSubmitted,
            callback: closeModal,
            object: product
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
