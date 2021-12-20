import React from 'react';
import {
  Button,
  ControlLabel,
  EditorCK,
  extractAttachment,
  Form as CommonForm,
  FormControl,
  FormGroup,
  DateControl,
  MainStyleFormColumn as FormColumn,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter,
  Uploader,
  MainStyleScrollWrapper as ScrollWrapper,
  MainStyleDateContainer as DateContainer
} from 'erxes-ui';
import { IAttachment, IButtonMutateProps, IFormProps } from 'erxes-ui/lib/types';
import { IProduct, IProductCategory } from 'erxes-ui/lib/products/types';
import { IVoucherCompaign } from '../types';
import Select from 'react-select-plus';
import { __ } from 'erxes-ui';
import { ISpinCompaign } from '../../spinCompaign/types';
import { ILotteryCompaign } from '../../lotteryCompaign/types';
import { VOUCHER_TYPES } from '../../../constants';

type Props = {
  voucherCompaign?: IVoucherCompaign;
  productCategories: IProductCategory[];
  products: IProduct[];
  spinCompaigns: ISpinCompaign[];
  lotteryCompaigns: ILotteryCompaign[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  voucherCompaign: IVoucherCompaign
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      voucherCompaign: this.props.voucherCompaign || {},
    };
  }

  generateDoc = (values: {
    _id?: string;
    attachment?: IAttachment;
    description: string;
  }) => {
    const finalValues = values;
    const {
      voucherCompaign
    } = this.state;

    if (voucherCompaign._id) {
      finalValues._id = voucherCompaign._id;
    }

    voucherCompaign.discountPercent = Number(voucherCompaign.discountPercent || 0);
    voucherCompaign.spinCount = Number(voucherCompaign.spinCount || 0);
    voucherCompaign.lotteryCount = Number(voucherCompaign.lotteryCount || 0);
    voucherCompaign.bonusCount = Number(voucherCompaign.bonusCount || 0);

    return {
      ...finalValues,
      ...voucherCompaign
    };
  };

  onChangeDescription = (e) => {
    this.setState({ voucherCompaign: { ...this.state.voucherCompaign, description: e.editor.getData() } });
  };

  onChangeAttachment = (files: IAttachment[]) => {
    this.setState({ voucherCompaign: { ...this.state.voucherCompaign, attachment: files.length ? files[0] : undefined } });
  };

  onChangeCombo = (name: string, selected) => {
    const value = selected.value
    this.setState({ voucherCompaign: { ...this.state.voucherCompaign, [name]: value } });
  };

  onChangeMultiCombo = (name: string, values) => {
    let value = values;

    if (Array.isArray(values)) {
      value = values.map(el => el.value);
    }

    this.setState({ voucherCompaign: { ...this.state.voucherCompaign, [name]: value } });
  };

  onDateInputChange = (type: string, date) => {
    this.setState({ voucherCompaign: { ...this.state.voucherCompaign, [type]: date } });
  };

  onInputChange = e => {
    e.preventDefault();
    const value = e.target.value
    const name = e.target.name

    this.setState({ voucherCompaign: { ...this.state.voucherCompaign, [name]: value } });
  };

  renderVoucherType = (formProps) => {
    const { productCategories, products, lotteryCompaigns, spinCompaigns } = this.props;
    const { voucherCompaign } = this.state;
    const voucherType = voucherCompaign.voucherType || 'discount';

    if (voucherType === 'bonus') {
      return (
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Bonus Product</ControlLabel>
              <Select
                placeholder={__('Filter by product')}
                value={voucherCompaign.bonusProductId}
                options={products.map(prod => ({
                  label: prod.name,
                  value: prod._id
                }))}
                name="bonusProductId"
                onChange={this.onChangeCombo.bind(this, 'bonusProductId')}
                loadingPlaceholder={__('Loading...')}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>bonus Count</ControlLabel>
              <FormControl
                {...formProps}
                name="bonusCount"
                type="number"
                min={0}
                defaultValue={voucherCompaign.bonusCount}
                onChange={this.onInputChange}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>
      );
    }

    if (voucherType === 'lottery') {
      return (
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Lottery</ControlLabel>
              <Select
                placeholder={__('Filter by lottery')}
                value={voucherCompaign.lotteryCompaignId}
                options={lotteryCompaigns.map(lottery => ({
                  label: lottery.title,
                  value: lottery._id
                }))}
                name="lotteryCompaignId"
                onChange={this.onChangeCombo.bind(this, 'lotteryCompaignId')}
                loadingPlaceholder={__('Loading...')}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>lottery Count</ControlLabel>
              <FormControl
                {...formProps}
                name="lotteryCount"
                type="number"
                min={0}
                max={100}
                defaultValue={voucherCompaign.lotteryCount}
                onChange={this.onInputChange}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>
      );
    }

    if (voucherType === 'spin') {
      return (
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Spin</ControlLabel>
              <Select
                placeholder={__('Filter by spin')}
                value={voucherCompaign.spinCompaignId}
                options={spinCompaigns.map(spin => ({
                  label: spin.title,
                  value: spin._id
                }))}
                name="spinCompaignId"
                onChange={this.onChangeCombo.bind(this, 'spinCompaignId')}
                loadingPlaceholder={__('Loading...')}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>spin Count</ControlLabel>
              <FormControl
                {...formProps}
                name="spinCount"
                type="number"
                min={0}
                max={100}
                defaultValue={voucherCompaign.spinCount}
                onChange={this.onInputChange}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>
      );
    }

    return (
      <FormWrapper>
        <FormColumn>
          <FormGroup>
            <ControlLabel required={true}>Product Category</ControlLabel>
            <Select
              placeholder={__('Filter by product category')}
              value={voucherCompaign.productCategoryIds}
              options={productCategories.map(cat => ({
                label: `${'\u00A0 '.repeat(((cat.order || '').match(/[/]/gi) || []).length)}${cat.name}`,
                value: cat._id
              }))}
              name="productCategoryIds"
              onChange={this.onChangeMultiCombo.bind(this, 'productCategoryIds')}
              multi={true}
              loadingPlaceholder={__('Loading...')}
            />
          </FormGroup>
        </FormColumn>
        <FormColumn>
          <FormGroup>
            <ControlLabel required={true}>Or Product</ControlLabel>
            <Select
              placeholder={__('Filter by product')}
              value={voucherCompaign.productIds}
              options={products.map(prod => ({
                label: prod.name,
                value: prod._id
              }))}
              name="productIds"
              onChange={this.onChangeMultiCombo.bind(this, 'productIds')}
              multi={true}
              loadingPlaceholder={__('Loading...')}
            />
          </FormGroup>
        </FormColumn>
        <FormColumn>
          <FormGroup>
            <ControlLabel required={true}>discount percent</ControlLabel>
            <FormControl
              {...formProps}
              name="discountPercent"
              type="number"
              min={0}
              max={100}
              defaultValue={voucherCompaign.discountPercent}
              onChange={this.onInputChange}
            />
          </FormGroup>
        </FormColumn>
      </FormWrapper>
    );
  }

  renderContent = (formProps: IFormProps) => {
    const { renderButton, closeModal } = this.props;
    const { values, isSubmitted } = formProps;

    const {
      voucherCompaign
    } = this.state;

    const attachments =
      (voucherCompaign.attachment && extractAttachment([voucherCompaign.attachment])) || [];

    return (
      <>
        <ScrollWrapper>
          <FormWrapper>
            <FormColumn >
              <FormGroup>
                <ControlLabel required={true}>title</ControlLabel>
                <FormControl
                  {...formProps}
                  name="title"
                  defaultValue={voucherCompaign.title}
                  autoFocus={true}
                  required={true}
                  onChange={this.onInputChange}
                />
              </FormGroup>
            </FormColumn>
            <FormColumn>
              <FormGroup>
                <ControlLabel required={true}>Type</ControlLabel>
                <Select
                  value={voucherCompaign.voucherType || 'discount'}
                  options={Object.values(VOUCHER_TYPES)}
                  name="voucherType"
                  onChange={this.onChangeCombo.bind(this, 'voucherType')}
                />
              </FormGroup>
            </FormColumn>
          </FormWrapper>

          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel required={true}>Start Date</ControlLabel>
                <DateContainer>
                  <DateControl
                    {...formProps}
                    required={true}
                    name="startDate"
                    placeholder={__('Start date')}
                    value={voucherCompaign.startDate}
                    onChange={this.onDateInputChange.bind(this, 'startDate')}
                  />
                </DateContainer>
              </FormGroup>
            </FormColumn>

            <FormColumn>
              <FormGroup>
                <ControlLabel required={true}>End Date</ControlLabel>
                <DateContainer>
                  <DateControl
                    {...formProps}
                    required={true}
                    name="endDate"
                    placeholder={__('End date')}
                    value={voucherCompaign.endDate}
                    onChange={this.onDateInputChange.bind(this, 'endDate')}
                  />
                </DateContainer>
              </FormGroup>
            </FormColumn>
          </FormWrapper>

          {this.renderVoucherType(formProps)}

          <FormGroup>
            <ControlLabel>Description</ControlLabel>
            <EditorCK
              content={voucherCompaign.description}
              onChange={this.onChangeDescription}
              height={150}
              isSubmitted={formProps.isSaved}
              name={`voucherCompaign_description_${voucherCompaign.description}`}
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
            <ControlLabel>Featured image</ControlLabel>

            <Uploader
              defaultFileList={attachments}
              onChange={this.onChangeAttachment}
              multiple={false}
              single={true}
            />
          </FormGroup>
        </ScrollWrapper>
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
            name: "voucher Compaign",
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: voucherCompaign,
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
