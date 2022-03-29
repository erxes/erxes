import {
  MainStyleFormColumn as FormColumn,
  MainStyleFormWrapper as FormWrapper
} from 'erxes-ui';
import Button from 'erxes-ui/lib/components/Button';
import FormControl from 'erxes-ui/lib/components/form/Control';
import CommonForm from 'erxes-ui/lib/components/form/Form';
import FormGroup from 'erxes-ui/lib/components/form/Group';
import ControlLabel from 'erxes-ui/lib/components/form/Label';
import { ModalFooter } from 'erxes-ui/lib/styles/main';
import { IButtonMutateProps, IFormProps } from 'erxes-ui/lib/types';
import { FlexContent } from 'modules/boards/styles/item';
import { IAttachment } from 'modules/common/types';
import Uploader from 'modules/common/components/Uploader';
import { extractAttachment } from 'modules/common/utils';
import { ExpandWrapper } from 'modules/settings/styles';
import React from 'react';

import { TYPE_CHOICES } from '../../constants';
import { IProductTemplate, IProductTemplateItem } from '../../types';
import Stages from './Stages';

type Props = {
  productTemplate?: IProductTemplate;
  productTemplates: IProductTemplate[];
  items?: IProductTemplate;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  type?: string;
};

type State = {
  items: IProductTemplateItem[];
  discount: number;
  totalAmount: number;
  templateImage?: IAttachment;
};
class Form extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const productTemplate =
      props.productTemplate || props.items || ({} as IProductTemplate);
    const {
      discount,
      totalAmount,
      templateItems,
      templateImage
    } = productTemplate;

    this.state = {
      items: templateItems || [],
      discount: discount ? discount : 0,
      totalAmount: totalAmount ? totalAmount : 0,
      templateImage: templateImage ? templateImage : undefined
    };
  }

  calculateTotalAmountAndDiscount = items => {
    this.setState({ items });

    let discount = 0 as number;
    let itemsAmount = 0 as number;
    let itemsTotalAmount = 0 as number;

    items.forEach(item => {
      itemsTotalAmount += Number(item.unitPrice) * Number(item.quantity);
      itemsAmount +=
        Number(item.unitPrice) *
        Number(item.quantity) *
        ((100 - Number(item.discount)) / 100);
    });

    const totalAmount = itemsAmount;
    discount =
      Number((100 - (totalAmount * 100) / itemsTotalAmount).toFixed(3)) || 0;

    this.setState({ discount, totalAmount });
  };

  generateTemplateOptions = (
    templates: IProductTemplate[],
    currentTemplateId?: string
  ) => {
    const result: React.ReactNode[] = [];

    for (const template of templates) {
      const order = template.order || '';

      const foundedString = order.match(/[/]/gi);

      let space = '';

      if (foundedString) {
        space = '\u00A0 '.repeat(foundedString.length);
      }

      if (currentTemplateId !== template._id) {
        result.push(
          <option key={template._id} value={template._id}>
            {space}
            {template.title}
          </option>
        );
      }
    }

    return result;
  };

  onChangeItems = items => {
    this.calculateTotalAmountAndDiscount(items);
  };

  onDiscount = e => {
    const discount = e.target.value as number;

    this.setState({ discount });
  };

  onChangeAttachment = (files: IAttachment[]) => {
    this.setState({ templateImage: files.length ? files[0] : undefined });
  };

  renderContent = (formProps: IFormProps) => {
    const {
      renderButton,
      closeModal,
      productTemplate,
      productTemplates
    } = this.props;
    const { values, isSubmitted } = formProps;
    const object = productTemplate || ({} as IProductTemplate);
    const templateImages =
      (object.templateImage && extractAttachment([object.templateImage])) || [];

    values.templateItems = this.state.items;

    if (productTemplate) {
      values._id = productTemplate._id;
    }

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
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Template image</ControlLabel>

          <Uploader
            defaultFileList={templateImages}
            onChange={this.onChangeAttachment}
            multiple={false}
            single={true}
          />
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
                  defaultValue={discount}
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
                  defaultValue={totalAmount}
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

        {productTemplates && (
          <FormGroup>
            <ControlLabel>Parent Template</ControlLabel>

            <FormControl
              {...formProps}
              name="parentId"
              componentClass="select"
              defaultValue={object.parentId}
            >
              <option value="" />
              {this.generateTemplateOptions(productTemplates, object._id)}
            </FormControl>
          </FormGroup>
        )}
        <FormGroup>
          <div id="stages-in-pipeline-form">
            <Stages
              type="productTemplate"
              items={this.state.items}
              onChangeItems={this.onChangeItems}
              products={
                productTemplate ? productTemplate.templateItemsProduct : []
              }
            />
          </div>
        </FormGroup>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} uppercase={false}>
            Close
          </Button>

          {renderButton({
            name: 'Save',
            values: { ...values, templateImage: this.state.templateImage },
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
