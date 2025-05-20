import SelectProductCategory from "@erxes/ui-products/src/containers/SelectProductCategory";
import SelectProducts from "@erxes/ui-products/src/containers/SelectProducts";
import {
  Button,
  Form as CommonForm,
  ControlLabel,
  DateControl,
  FormControl,
  FormGroup,
  Uploader,
} from "@erxes/ui/src/components";
import { RichTextEditor } from "@erxes/ui/src/components/richTextEditor/TEditor";
import {
  MainStyleDateContainer as DateContainer,
  MainStyleFormColumn as FormColumn,
  MainStyleFormWrapper as FormWrapper,
} from "@erxes/ui/src/styles/eindex";
import { ModalFooter } from "@erxes/ui/src/styles/main";
import {
  IAttachment,
  IButtonMutateProps,
  IFormProps,
} from "@erxes/ui/src/types";
import { __, extractAttachment } from "@erxes/ui/src/utils";
import React from "react";
import Select from "react-select";
import { VOUCHER_TYPES } from "../../../constants";
import { COUPON_APPLY_TYPES } from "../../../loyalties/coupons/constants";
import { ILotteryCampaign } from "../../lotteryCampaign/types";
import { ISpinCampaign } from "../../spinCampaign/types";
import { IVoucherCampaign } from "../types";

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
        voucherType: VOUCHER_TYPES.discount.value,
      },
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

    const {
      discountPercent = 0,
      spinCount = 0,
      lotteryCount = 0,
      bonusCount = 0,
      buyScore = 0,
      value = 0,
    } = voucherCampaign;

    return {
      ...finalValues,
      ...voucherCampaign,
      discountPercent: Number(discountPercent),
      spinCount: Number(spinCount),
      lotteryCount: Number(lotteryCount),
      bonusCount: Number(bonusCount),
      buyScore: Number(buyScore),
      value: Number(value),
    };
  };

  onChangeDescription = (content: string) => {
    this.setState({
      voucherCampaign: {
        ...this.state.voucherCampaign,
        description: content,
      },
    });
  };

  onChangeAttachment = (files: IAttachment[]) => {
    this.setState({
      voucherCampaign: {
        ...this.state.voucherCampaign,
        attachment: files.length ? files[0] : undefined,
      },
    });
  };

  onChangeCombo = (name: string, selected) => {
    const value = selected.value;
    this.setState({
      voucherCampaign: { ...this.state.voucherCampaign, [name]: value },
    });
  };

  onChangeMultiCombo = (name: string, values) => {
    let value = values;

    if (Array.isArray(values)) {
      value = values.map((el) => el.value);
    }

    this.setState({
      voucherCampaign: { ...this.state.voucherCampaign, [name]: value },
    });
  };

  onDateInputChange = (type: string, date) => {
    this.setState({
      voucherCampaign: { ...this.state.voucherCampaign, [type]: date },
    });
  };

  onInputChange = (e) => {
    e.preventDefault();
    const value = e.target.value;
    const name = e.target.name;

    this.setState({
      voucherCampaign: { ...this.state.voucherCampaign, [name]: value },
    });
  };

  handleOnChange = ({
    files,
    content,
    event,
    dateType,
    date,
    restrictions,
  }: {
    files?: IAttachment[];
    content?: string;
    event?: React.FormEvent<HTMLElement>;
    dateType?: string;
    date?: React.FormEvent<HTMLElement>;
    restrictions?: any;
  }) => {
    this.setState((prevState) => {
      const updatedCampaign = { ...prevState.voucherCampaign };

      if (files) {
        updatedCampaign.attachment = files.length > 0 ? files[0] : undefined;
      }

      if (content) {
        updatedCampaign.description = content;
      }

      if (event) {
        const { name, value, type } = event.target as
          | HTMLInputElement
          | HTMLTextAreaElement;
        updatedCampaign[name] = type === "number" ? Number(value) : value;
      }

      if (dateType && date) {
        updatedCampaign[dateType] = date;
      }

      if (restrictions) {
        updatedCampaign.restrictions = {
          ...updatedCampaign.restrictions,
          ...restrictions,
        };
      }

      return { voucherCampaign: updatedCampaign };
    });
  };

  renderVoucherType = (formProps) => {
    const { lotteryCampaigns, spinCampaigns } = this.props;
    const { voucherCampaign } = this.state;
    const voucherType = voucherCampaign.voucherType || "discount";

    if (voucherType === "bonus") {
      return (
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Bonus Product</ControlLabel>
              <SelectProducts
                label={__("Filter by products")}
                name="productId"
                multi={false}
                initialValue={voucherCampaign.bonusProductId}
                onSelect={(productId) =>
                  this.setState({
                    voucherCampaign: {
                      ...this.state.voucherCampaign,
                      bonusProductId: String(productId),
                    },
                  })
                }
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Bonus Count</ControlLabel>
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

    if (voucherType === "lottery") {
      const options = lotteryCampaigns.map((lottery) => ({
        label: lottery.title,
        value: lottery._id,
      }));

      return (
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Lottery</ControlLabel>
              <Select
                placeholder={__("Filter by lottery")}
                value={options.find(
                  (o) => o.value === voucherCampaign.lotteryCampaignId
                )}
                options={options}
                name="lotteryCampaignId"
                isClearable={true}
                onChange={this.onChangeCombo.bind(this, "lotteryCampaignId")}
                // loadingPlaceholder={__('Loading...')}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Lottery Count</ControlLabel>
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

    if (voucherType === "spin") {
      const options = spinCampaigns.map((spin) => ({
        label: spin.title,
        value: spin._id,
      }));
      return (
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Spin</ControlLabel>
              <Select
                placeholder={__("Filter by spin")}
                value={options.find(
                  (o) => o.value === voucherCampaign.spinCampaignId
                )}
                options={options}
                name="spinCampaignId"
                isClearable={true}
                onChange={this.onChangeCombo.bind(this, "spinCampaignId")}
                // loadingPlaceholder={__("Loading...")}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Spin Count</ControlLabel>
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

    if (voucherType === "coupon") {
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
              label={__("Choose product category")}
              name="productCategoryIds"
              initialValue={voucherCampaign.productCategoryIds}
              onSelect={(categoryIds) =>
                this.setState({
                  voucherCampaign: {
                    ...this.state.voucherCampaign,
                    productCategoryIds: categoryIds as string[],
                  },
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
              label={__("Filter by products")}
              name="productIds"
              multi={true}
              initialValue={voucherCampaign.productIds}
              onSelect={(productIds) =>
                this.setState({
                  voucherCampaign: {
                    ...this.state.voucherCampaign,
                    productIds: productIds as string[],
                  },
                })
              }
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
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Title</ControlLabel>
              <FormControl
                {...formProps}
                name="title"
                defaultValue={voucherCampaign.title}
                autoFocus={true}
                onChange={(event) => this.handleOnChange({ event })}
              />
            </FormGroup>
          </FormColumn>

          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Buy Score</ControlLabel>
              <FormControl
                {...formProps}
                name="buyScore"
                type="number"
                min={0}
                required={false}
                defaultValue={voucherCampaign.buyScore}
                onChange={(event) => this.handleOnChange({ event })}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Type</ControlLabel>
              <Select
                value={Object.values(VOUCHER_TYPES).find(
                  (o) => o.value === (voucherCampaign.voucherType || "discount")
                )}
                options={Object.values(VOUCHER_TYPES)}
                name="voucherType"
                isClearable={true}
                onChange={this.onChangeCombo.bind(this, "voucherType")}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Type</ControlLabel>
              <Select
                options={COUPON_APPLY_TYPES}
                value={COUPON_APPLY_TYPES.find(
                  (type) => type.value === voucherCampaign.kind
                )}
                onChange={(option) => {
                  this.handleOnChange({
                    event: {
                      target: { name: "kind", value: option?.value },
                    } as any,
                  });

                  this.handleOnChange({
                    event: {
                      target: { name: "value", value: 0 },
                    } as any,
                  });
                }}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Count</ControlLabel>
              <FormControl
                {...formProps}
                name="value"
                type="number"
                min={0}
                required={false}
                value={voucherCampaign.value}
                onChange={(event) => this.handleOnChange({ event })}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>

        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Minimum spend</ControlLabel>
              <FormControl
                name="minimumSpend"
                type="number"
                min={0}
                value={voucherCampaign?.restrictions?.minimumSpend || 0}
                onChange={(e) =>
                  this.handleOnChange({
                    restrictions: {
                      ...voucherCampaign?.restrictions,
                      minimumSpend: Number((e.target as any).value),
                    },
                  })
                }
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Maximum spend</ControlLabel>
              <FormControl
                name="maximumSpend"
                type="number"
                min={0}
                value={voucherCampaign?.restrictions?.maximumSpend || 0}
                onChange={(e) =>
                  this.handleOnChange({
                    restrictions: {
                      ...voucherCampaign?.restrictions,
                      maximumSpend: Number((e.target as any).value),
                    },
                  })
                }
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>

        {this.renderVoucherType(formProps)}

        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Start Date</ControlLabel>
              <DateContainer>
                <DateControl
                  {...formProps}
                  name="startDate"
                  placeholder={__("Start date")}
                  value={voucherCampaign.startDate}
                  onChange={this.onDateInputChange.bind(this, "startDate")}
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
                  name="endDate"
                  placeholder={__("End date")}
                  value={voucherCampaign.endDate}
                  onChange={this.onDateInputChange.bind(this, "endDate")}
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
                  name="finishDateOfUse"
                  placeholder={__("Finish Date of Use")}
                  value={voucherCampaign.finishDateOfUse}
                  onChange={this.onDateInputChange.bind(
                    this,
                    "finishDateOfUse"
                  )}
                />
              </DateContainer>
            </FormGroup>
          </FormColumn>
        </FormWrapper>

        <FormGroup>
          <ControlLabel required>Description</ControlLabel>
          <RichTextEditor
            content={voucherCampaign.description || ""}
            onChange={(content) => this.handleOnChange({ content })}
            height={150}
            isSubmitted={formProps.isSaved}
            name="couponCampaign_description"
            toolbar={[
              "bold",
              "italic",
              "orderedList",
              "bulletList",
              "link",
              "unlink",
              "|",
              "image",
            ]}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Featured image</ControlLabel>

          <Uploader
            defaultFileList={attachments}
            onChange={(files) => this.handleOnChange({ files })}
            multiple={false}
            single={true}
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
            name: "voucher Campaign",
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: voucherCampaign,
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
