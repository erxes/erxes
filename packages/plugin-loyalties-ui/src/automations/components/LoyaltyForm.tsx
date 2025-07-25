import { gql, useLazyQuery } from "@apollo/client";
import Common from "@erxes/ui-automations/src/components/forms/actions/Common";
import { DrawerDetail } from "@erxes/ui-automations/src/styles";
import { __, ControlLabel, FormControl, FormGroup, Icon } from "@erxes/ui/src";
import { Label } from "@erxes/ui/src/components/form/styles";
import { FormColumn, FormWrapper } from "@erxes/ui/src/styles/main";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { queries } from "../../configs/voucherCampaign/graphql";
import { IVoucherCampaign } from "../../configs/voucherCampaign/types";

const DATE_USAGE_OPTIONS = [
  { label: "Month", value: "month" },
  { label: "Week", value: "week" },
  { label: "Day (24h)", value: "day" },
];

type Props = {
  closeModal: () => void;
  activeAction: any;
  triggerType: string;
  addAction: (action: any, actionId?: string, config?: any) => void;
  voucherCampaigns: IVoucherCampaign[];
  common: any;
};

const LoyaltyForm = (props: Props) => {
  const { activeAction, voucherCampaigns } = props;

  const [config, setConfig] = useState(activeAction?.config || {});
  const [showCustomConfig, setShowCustomConfig] = useState<boolean>(!!activeAction?.config?.customRule);

  const [fetchCampaign, { data: campaignData }] = useLazyQuery(
    gql(queries.voucherCampaignDetail)
  );

  useEffect(() => {
    setConfig(activeAction?.config);
  }, [activeAction]);

  useEffect(() => {
    if (!showCustomConfig) {
      setConfig((prevConfig) => {
        const updatedConfig = { ...prevConfig };

        delete updatedConfig.customRule;

        return updatedConfig;
      });
    }
  }, [showCustomConfig]);

  useEffect(() => {
    if (config?.voucherCampaignId) {
      fetchCampaign({
        variables: {
          id: config?.voucherCampaignId,
        },
      });
    }
  }, [config?.voucherCampaignId]);

  const onChangeField = (field: string, value: string | undefined) => {
    setConfig((prevConfig) => {
      const updatedConfig = { ...prevConfig };

      updatedConfig[field] = value;

      return updatedConfig;
    });
  };

  const onChangeRule = (field: string, value: any) => {
    onChangeField("customRule", { ...config.customRule, [field]: value });
  };

  const renderConfig = () => {
    if (!campaignData) {
      return null;
    }

    return (
      <>
        <Label
          style={{
            cursor: "pointer",
            width: "100%",
            display: "flex",
            justifyContent: "flex-end",
            gap: "8px",
            marginBottom: "20px",
            textTransform: "uppercase",
            userSelect: "none",
          }}
          onClick={() => {
            setShowCustomConfig(!showCustomConfig);
          }}
        >
          Set custom config{" "}
          {showCustomConfig ? (
            <Icon icon="uparrow" />
          ) : (
            <Icon icon="downarrow-2" />
          )}
        </Label>
        {showCustomConfig && (
          <FormGroup>
            <FormWrapper>
              <FormColumn>
                <FormGroup>
                  <ControlLabel>From</ControlLabel>
                  <FormControl defaultValue={"Created At"} disabled={true} />
                </FormGroup>
              </FormColumn>
              <FormColumn>
                <FormGroup>
                  <ControlLabel>Duration</ControlLabel>
                  <Select
                    value={DATE_USAGE_OPTIONS.find(
                      (opt) => opt.value === config.customRule?.duration
                    )}
                    options={DATE_USAGE_OPTIONS}
                    onChange={(option) =>
                      onChangeRule("duration", option?.value)
                    }
                  />
                </FormGroup>
              </FormColumn>
            </FormWrapper>
          </FormGroup>
        )}
      </>
    );
  };

  const renderContent = () => {
    const options = voucherCampaigns.map((v) => ({
      label: v.title,
      value: v._id,
    }));
    return (
      <FormGroup>
        <ControlLabel>Voucher Campaign</ControlLabel>
        <Select
          required={true}
          value={options.find((o) => o.value === config?.voucherCampaignId)}
          options={options}
          onChange={(option) =>
            onChangeField("voucherCampaignId", option?.value)
          }
          placeholder={__("Choose type")}
          isClearable
        />
      </FormGroup>
    );
  };

  return (
    <Common config={config} {...props}>
      <DrawerDetail>
        {renderContent()}
        {renderConfig()}
      </DrawerDetail>
    </Common>
  );
};

export default LoyaltyForm;
