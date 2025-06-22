import SelectProducts from "@erxes/ui-products/src/containers/SelectProducts";
import {
  Button,
  Form as CommonForm,
  ControlLabel,
  DateControl,
  FormControl,
  FormGroup,
  Tabs,
  TabTitle,
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
import React, { useState } from "react";
import Select from "react-select";
import { VOUCHER_TYPES } from "../../../constants";
import { COUPON_APPLY_TYPES } from "../../../loyalties/coupons/constants";
import { ILotteryCampaign } from "../../lotteryCampaign/types";
import { ISpinCampaign } from "../../spinCampaign/types";
import { IVoucherCampaign } from "../types";
import RestrictionForm from "./RestrictionForm";

type Props = {
  voucherCampaign?: IVoucherCampaign;
  spinCampaigns: ISpinCampaign[];
  lotteryCampaigns: ILotteryCampaign[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

const Form = (props: Props) => {
  const {
    voucherCampaign,
    lotteryCampaigns,
    spinCampaigns,
    renderButton,
    closeModal,
  } = props;

  const [currentTab, setCurrentTab] = useState("campaign");
  const [campaignState, setCampaignState] = useState(
    voucherCampaign || {
      title: "",
      buyScore: 0,
      startDate: new Date(),
      voucherType: VOUCHER_TYPES.discount.value,
    }
  );

  const generateDoc = (values: {
    _id?: string;
    attachment?: IAttachment;
    description: string;
  }) => {
    const finalValues = values;

    if (campaignState._id) {
      finalValues._id = campaignState._id;
    }

    const {
      discountPercent = 0,
      spinCount = 0,
      lotteryCount = 0,
      bonusCount = 0,
      buyScore = 0,
      value = 0,
    } = campaignState;

    return {
      ...finalValues,
      ...campaignState,
      discountPercent: Number(discountPercent),
      spinCount: Number(spinCount),
      lotteryCount: Number(lotteryCount),
      bonusCount: Number(bonusCount),
      buyScore: Number(buyScore),
      value: Number(value),
    };
  };

  const handleOnChange = ({
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
    setCampaignState((prevState) => {
      const updatedCampaign = { ...prevState };

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

      return updatedCampaign;
    });
  };

  const handleButtonClick = () => {
    const { voucherType = "" } = campaignState || {};

    if (["", "campaign"].includes(currentTab)) {
      setCurrentTab("restriction");
    }

    if (voucherType && currentTab === "restriction") {
      setCurrentTab(voucherType);
    }
  };

  const renderDefaultContent = (formProps) => {
    const attachments =
      (campaignState.attachment &&
        extractAttachment([campaignState.attachment])) ||
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
                defaultValue={campaignState.title}
                autoFocus={true}
                onChange={(event) => handleOnChange({ event })}
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
                defaultValue={campaignState.buyScore}
                onChange={(event) => handleOnChange({ event })}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Type</ControlLabel>
              <Select
                value={Object.values(VOUCHER_TYPES).find(
                  (o) => o.value === (campaignState.voucherType || "discount")
                )}
                options={Object.values(VOUCHER_TYPES)}
                name="voucherType"
                isClearable={true}
                onChange={(selectedOption) =>
                  handleOnChange({
                    event: {
                      target: {
                        name: "voucherType",
                        value: selectedOption?.value,
                      },
                    } as any,
                  })
                }
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
                  (type) => type.value === campaignState.kind
                )}
                onChange={(option) => {
                  handleOnChange({
                    event: {
                      target: { name: "kind", value: option?.value },
                    } as any,
                  });

                  handleOnChange({
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
                value={campaignState.value}
                onChange={(event) => handleOnChange({ event })}
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
                  name="startDate"
                  placeholder={__("Start date")}
                  value={campaignState.startDate}
                  onChange={(date) =>
                    handleOnChange({ dateType: "startDate", date })
                  }
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
                  value={campaignState.endDate}
                  onChange={(date) =>
                    handleOnChange({ dateType: "endDate", date })
                  }
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
                  value={campaignState.finishDateOfUse}
                  onChange={(date) =>
                    handleOnChange({ dateType: "finishDateOfUse", date })
                  }
                />
              </DateContainer>
            </FormGroup>
          </FormColumn>
        </FormWrapper>

        <FormGroup>
          <ControlLabel required>Description</ControlLabel>
          <RichTextEditor
            content={campaignState.description || ""}
            onChange={(content) => handleOnChange({ content })}
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
            onChange={(files) => handleOnChange({ files })}
            multiple={false}
            single={true}
          />
        </FormGroup>
      </>
    );
  };

  const renderRestrictionContent = (formProps) => {
    return (
      <RestrictionForm
        restrictions={campaignState.restrictions || {}}
        onChange={(restrictions) => handleOnChange({ restrictions })}
      />
    );
  };

  const renderVoucherTypeContent = (formProps) => {
    const { voucherType = "" } = campaignState || {};

    if (!voucherType) {
      return null;
    }

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
                initialValue={campaignState.bonusProductId}
                onSelect={(productId) =>
                  handleOnChange({
                    event: {
                      target: {
                        name: "bonusProductId",
                        value: String(productId),
                      },
                    } as any,
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
                defaultValue={campaignState.bonusCount}
                onChange={(event) => handleOnChange({ event })}
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
                  (o) => o.value === campaignState.lotteryCampaignId
                )}
                options={options}
                name="lotteryCampaignId"
                isClearable={true}
                onChange={(selectedOption) => {
                  handleOnChange({
                    event: {
                      target: {
                        name: "lotteryCampaignId",
                        value: String(selectedOption?.value || ""),
                      },
                    } as any,
                  });
                }}
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
                defaultValue={campaignState.lotteryCount}
                onChange={(event) => handleOnChange({ event })}
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
                  (o) => o.value === campaignState.spinCampaignId
                )}
                options={options}
                name="spinCampaignId"
                isClearable={true}
                onChange={(selectedOption) => {
                  handleOnChange({
                    event: {
                      target: {
                        name: "spinCampaignId",
                        value: String(selectedOption?.value || ""),
                      },
                    } as any,
                  });
                }}
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
                defaultValue={campaignState.spinCount}
                onChange={(event) => handleOnChange({ event })}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>
      );
    }
  };

  const renderSaveButton = (formProps) => {
    const { values, isSubmitted } = formProps;

    const { voucherType = "" } = campaignState || {};

    let isFinishTab = currentTab === "restriction";

    if (["reward", "discount"].includes(voucherType)) {
      isFinishTab = currentTab === "restriction";
    } else if (voucherType) {
      isFinishTab = currentTab === voucherType;
    }

    if (isFinishTab || voucherCampaign) {
      return renderButton({
        name: "voucher Campaign",
        values: generateDoc(values),
        isSubmitted,
        callback: closeModal,
        object: voucherCampaign,
      });
    }

    return (
      <Button
        btnStyle="success"
        size="medium"
        icon="check-circle"
        onClick={handleButtonClick}
      >
        Next
      </Button>
    );
  };

  const renderTabContent = (formProps) => {
    let content;

    if (["", "campaign"].includes(currentTab)) {
      content = renderDefaultContent(formProps);
    }

    if ("restriction" === currentTab) {
      content = renderRestrictionContent(formProps);
    }

    if (!["campaign", "restriction"].includes(currentTab)) {
      content = renderVoucherTypeContent(formProps);
    }

    if (content) {
      return (
        <>
          {content}
          <ModalFooter>
            <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
              Close
            </Button>

            {renderSaveButton(formProps)}
          </ModalFooter>
        </>
      );
    }

    return null;
  };

  const renderVoucherTypeTab = () => {
    const { voucherType = "" } = campaignState || {};

    if (!voucherType || ["reward", "discount"].includes(voucherType)) {
      return null;
    }

    const label = VOUCHER_TYPES[voucherType]["label"] || "";

    return (
      <TabTitle
        onClick={() => setCurrentTab(voucherType)}
        className={currentTab === voucherType ? "active" : ""}
      >
        {label}
      </TabTitle>
    );
  };

  const renderContent = (formProps: IFormProps) => {
    return (
      <>
        <Tabs full={true}>
          <TabTitle
            onClick={() => setCurrentTab("campaign")}
            className={["", "campaign"].includes(currentTab) ? "active" : ""}
          >
            {__("Campaign")}
          </TabTitle>
          <TabTitle
            onClick={() => setCurrentTab("restriction")}
            className={currentTab === "restriction" ? "active" : ""}
          >
            {__("Restriction")}
          </TabTitle>

          {renderVoucherTypeTab()}
        </Tabs>
        <br />
        {renderTabContent(formProps)}
      </>
    );
  };

  return <CommonForm renderContent={renderContent} />;
};

export default Form;
