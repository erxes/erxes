import React from 'react';
import {
  Button,
  ControlLabel,
  Form as CommonForm,
  FormControl,
  FormGroup,
  DateControl,
  Uploader
} from '@erxes/ui/src/components';
import EditorCK from '@erxes/ui/src/components/EditorCK';
import {
  MainStyleFormColumn as FormColumn,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper,
  MainStyleDateContainer as DateContainer
} from '@erxes/ui/src/styles/eindex';
import {
  IAttachment,
  IButtonMutateProps,
  IFormProps
} from '@erxes/ui/src/types';
import { IVoucherCampaign } from '../types';
import Select from 'react-select-plus';
import { extractAttachment, __ } from '@erxes/ui/src/utils';
import { ISpinCampaign } from '../../spinCampaign/types';
import { ILotteryCampaign } from '../../lotteryCampaign/types';
import { VOUCHER_TYPES } from '../../../constants';
import SelectProducts from '@erxes/ui-products/src/containers/SelectProducts';
import SelectProductCategory from '@erxes/ui-products/src/containers/SelectProductCategory';

type Props = {
  voucherCampaign?: IVoucherCampaign;
  spinCampaigns: ISpinCampaign[];
  lotteryCampaigns: ILotteryCampaign[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  voucherCampaign: IVoucherCampaign;
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      voucherCampaign: this.props.voucherCampaign || {
        voucherType: VOUCHER_TYPES.discount.value
      }
    };
  }

  generateDoc = (values: {
    _id?: string;
    attachment?: IAttachment;
    description: string;
  }) => {
    const finalValues = values;
    const { voucherCampaign } = this.state;

    if (voucherCampaign._id) {
      finalValues._id = voucherCampaign._id;
    }

    voucherCampaign.discountPercent = Number(
      voucherCampaign.discountPercent || 0
    );
    voucherCampaign.spinCount = Number(voucherCampaign.spinCount || 0);
    voucherCampaign.lotteryCount = Number(voucherCampaign.lotteryCount || 0);
    voucherCampaign.bonusCount = Number(voucherCampaign.bonusCount || 0);
    voucherCampaign.buyScore = Number(voucherCampaign.buyScore || 0);

    return {
      ...finalValues,
      ...voucherCampaign
    };
  };

  onChangeDescription = e => {
    this.setState({
      voucherCampaign: {
        ...this.state.voucherCampaign,
        description: e.editor.getData()
      }
    });
  };

  onChangeAttachment = (files: IAttachment[]) => {
    this.setState({
      voucherCampaign: {
        ...this.state.voucherCampaign,
        attachment: files.length ? files[0] : undefined
      }
    });
  };

  onChangeCombo = (name: string, selected) => {
    const value = selected.value;
    this.setState({
      voucherCampaign: { ...this.state.voucherCampaign, [name]: value }
    });
  };

  onChangeMultiCombo = (name: string, values) => {
    let value = values;

    if (Array.isArray(values)) {
      value = values.map(el => el.value);
    }

    this.setState({
      voucherCampaign: { ...this.state.voucherCampaign, [name]: value }
    });
  };

  onDateInputChange = (type: string, date) => {
    this.setState({
      voucherCampaign: { ...this.state.voucherCampaign, [type]: date }
    });
  };

  onInputChange = e => {
    e.preventDefault();
    const value = e.target.value;
    const name = e.target.name;

    this.setState({
      voucherCampaign: { ...this.state.voucherCampaign, [name]: value }
    });
  };

  renderVoucherType = formProps => {
    const { lotteryCampaigns, spinCampaigns } = this.props;
    const { voucherCampaign } = this.state;
    const voucherType = voucherCampaign.voucherType || 'discount';

    if (voucherType === 'bonus') {
      return (
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Bonus Product</ControlLabel>
              <SelectProducts
                label={__('Filter by products')}
                name="productId"
                multi={false}
                initialValue={voucherCampaign.bonusProductId}
                onSelect={productId =>
                  this.setState({
                    voucherCampaign: {
                      ...this.state.voucherCampaign,
                      bonusProductId: String(productId)
                    }
                  })
                }
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
                defaultValue={voucherCampaign.bonusCount}
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
                value={voucherCampaign.lotteryCampaignId}
                options={lotteryCampaigns.map(lottery => ({
                  label: lottery.title,
                  value: lottery._id
                }))}
                name="lotteryCampaignId"
                onChange={this.onChangeCombo.bind(this, 'lotteryCampaignId')}
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
                defaultValue={voucherCampaign.lotteryCount}
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
                value={voucherCampaign.spinCampaignId}
                options={spinCampaigns.map(spin => ({
                  label: spin.title,
                  value: spin._id
                }))}
                name="spinCampaignId"
                onChange={this.onChangeCombo.bind(this, 'spinCampaignId')}
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
                defaultValue={voucherCampaign.spinCount}
                onChange={this.onInputChange}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>
      );
    }

    if (voucherType === 'coupon') {
      return (
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Coupon title</ControlLabel>
              <FormControl
                {...formProps}
                name="coupon"
                defaultValue={voucherCampaign.coupon}
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
            <SelectProductCategory
              label="Choose product category"
              name="productCategoryIds"
              initialValue={voucherCampaign.productCategoryIds}
              onSelect={categoryIds =>
                this.setState({
                  voucherCampaign: {
                    ...this.state.voucherCampaign,
                    productCategoryIds: categoryIds as string[]
                  }
                })
              }
              multi={true}
            />
          </FormGroup>
        </FormColumn>
        <FormColumn>
          <FormGroup>
            <ControlLabel required={true}>Or Product</ControlLabel>
            <SelectProducts
              label={__('Filter by products')}
              name="productIds"
              multi={true}
              initialValue={voucherCampaign.productIds}
              onSelect={productIds =>
                this.setState({
                  voucherCampaign: {
                    ...this.state.voucherCampaign,
                    productIds: productIds as string[]
                  }
                })
              }
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
              defaultValue={voucherCampaign.discountPercent}
              onChange={this.onInputChange}
            />
          </FormGroup>
        </FormColumn>
      </FormWrapper>
    );
  };

  renderContent = (formProps: IFormProps) => {
    const { renderButton, closeModal } = this.props;
    const { values, isSubmitted } = formProps;

    const { voucherCampaign } = this.state;

    const attachments =
      (voucherCampaign.attachment &&
        extractAttachment([voucherCampaign.attachment])) ||
      [];

    return (
      <>
        <ScrollWrapper>
          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel required={true}>title</ControlLabel>
                <FormControl
                  {...formProps}
                  name="title"
                  defaultValue={voucherCampaign.title}
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
                  value={voucherCampaign.voucherType || 'discount'}
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
                    value={voucherCampaign.startDate}
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
                    value={voucherCampaign.endDate}
                    onChange={this.onDateInputChange.bind(this, 'endDate')}
                  />
                </DateContainer>
              </FormGroup>
            </FormColumn>

            <FormColumn>
              <FormGroup>
                <ControlLabel required={true}>Finish Date of Use</ControlLabel>
                <DateContainer>
                  <DateControl
                    {...formProps}
                    required={true}
                    name="finishDateOfUse"
                    placeholder={__('Finish Date of Use')}
                    value={voucherCampaign.finishDateOfUse}
                    onChange={this.onDateInputChange.bind(
                      this,
                      'finishDateOfUse'
                    )}
                  />
                </DateContainer>
              </FormGroup>
            </FormColumn>
          </FormWrapper>

          {this.renderVoucherType(formProps)}

          <FormGroup>
            <ControlLabel required={true}>Buy Score</ControlLabel>
            <FormControl
              {...formProps}
              name="buyScore"
              type="number"
              min={0}
              required={false}
              defaultValue={voucherCampaign.buyScore}
              onChange={this.onInputChange}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Description</ControlLabel>
            <EditorCK
              content={voucherCampaign.description || ''}
              onChange={this.onChangeDescription}
              height={150}
              isSubmitted={formProps.isSaved}
              name={`voucherCampaign_description_${voucherCampaign.description}`}
              toolbar={[
                {
                  name: 'basicstyles',
                  items: [
                    'Bold',
                    'Italic',
                    'NumberedList',
                    'BulletedList',
                    'Link',
                    'Unlink',
                    '-',
                    'Image',
                    'EmojiPanel'
                  ]
                }
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
            name: 'voucher Campaign',
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: voucherCampaign
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
