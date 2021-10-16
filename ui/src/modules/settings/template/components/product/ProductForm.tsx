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
import { IProductTemplate, IProductTemplateItem } from '../../types';
import { FlexContent } from 'modules/boards/styles/item';
import { ExpandWrapper } from 'modules/settings/styles';
import {
  MainStyleFormColumn as FormColumn,
  MainStyleFormWrapper as FormWrapper
} from 'erxes-ui';
import { TYPE_CHOICES } from '../../constants';

import Stages from './Stages';
import { IProductCategory } from 'modules/settings/productService/types';

type Props = {
  productTemplate?: IProductTemplate;
  productCategories?: IProductCategory[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  type?: string;
};

type State = {
  items: IProductTemplateItem[];
  discount: number;
  totalAmount: number;
}
class Form extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    const productTemplate = props.productTemplate || {} as IProductTemplate;
    const { discount, totalAmount, templateItems } = productTemplate;

    this.state = {
      items: templateItems ? templateItems : [],
      discount: discount ? discount : 0,
      totalAmount: totalAmount ? totalAmount : 0
    };

    console.log(props.closeModal);
  }

  onChangeItems = items => {
    this.setState({ items });

    console.log("items");
    console.log(items);

    let discount = 0 as number;
    let itemsAmount = 0 as number;

    items.forEach(item => {
      discount += Number(item.discount);
      itemsAmount += (Number(item.unitPrice) * Number(item.quantity));
    });

    const totalAmount = itemsAmount * ((100 - discount) / 100);

    console.log("itemsAmount:" + itemsAmount, "totalAmount:" + totalAmount, "discount:" + discount);

    this.setState({ discount, totalAmount });

  };

  onDiscount = (e) => {
    const discount = e.target.value as number;
    // const { items } = this.state;
    // const itemsCount = items.length;

    // const eachDiscount = Number(discount / itemsCount).toString().split(".")[0];
    // const leftDiscount = discount - (itemsCount * Number(eachDiscount));

    // items.forEach(item => {
    //   item.discount = Number(eachDiscount);
    // });
    // items[0].discount += leftDiscount;

    this.setState({ discount });

    // console.log("items on discount");
    // console.log(this.state.items);
  }

  renderContent = (formProps: IFormProps) => {
    const { renderButton, closeModal, productTemplate } = this.props;
    const { values, isSubmitted } = formProps;
    const object = productTemplate || ({} as IProductTemplate);

    values.templateItems = this.state.items;



    if (productTemplate) {
      values._id = productTemplate._id;
    }

    const { productCategories } = this.props;
    const { discount, totalAmount } = this.state;

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

        <FlexContent>
          <ExpandWrapper>
            <FormGroup>
              <ControlLabel required={true}>Title</ControlLabel>
              <FormControl
                {...formProps}
                name="title"
                defaultValue={object.title}
                autoFocus={true}
                required={true}
              />
            </FormGroup>
          </ExpandWrapper>

          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel>Discount</ControlLabel>
                <FormControl
                  {...formProps}
                  name="discount"
                  type="number"
                  value={discount}
                  defaultValue={object.discount}
                  onChange={this.onDiscount}
                  disabled={true}
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
                  name="totalAmount"
                  type="number"
                  defaultValue={object.totalAmount}
                  value={totalAmount}
                  disabled={true}
                />
              </FormGroup>
            </FormColumn>
          </FormWrapper>
        </FlexContent>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <FormControl
            {...formProps}
            name="description"
            defaultValue={object.description}
            componentClass="textarea"
            rows={3}
          />
        </FormGroup>
        <FormGroup>
          <div id="stages-in-pipeline-form">
            <Stages
              type="productTemplate"
              items={this.state.items}
              productCategories={productCategories}
              onChangeItems={this.onChangeItems}
            />
          </div>
        </FormGroup>

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
            object: productTemplate
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
