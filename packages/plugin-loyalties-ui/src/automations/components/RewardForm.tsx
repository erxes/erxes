import { DrawerDetail } from "@erxes/ui-automations/src/styles";
import { ITrigger } from "@erxes/ui-segments/src/types";
import { ControlLabel, FormControl, FormGroup } from "@erxes/ui/src";
import Button from "@erxes/ui/src/components/Button";
import {
  FormColumn,
  FormWrapper,
  ModalFooter,
} from "@erxes/ui/src/styles/main";
import { __, isEnabled } from "@erxes/ui/src/utils/core";
import React, { useState } from "react";
import Select from "react-select";

const REWARD_TYPE_OPTIONS = [
  {
    label: "Birthday",
    value: "birthday",
  },
  {
    label: "Registration",
    value: "registration",
  },
];

const BIRTHDAY_SCOPE_OPTIONS = [
  { label: "Month", value: "month" },
  { label: "Week", value: "week" },
  { label: "Day", value: "day" },
];

const APPLIES_TO_OPTIONS = [
  { label: "Team Members", value: "user" },
  { label: "Customers", value: "customer" },
  { label: "Companies", value: "company" },
  ...(isEnabled("clientportal")
    ? [{ label: "Client Portal Users", value: "cpUser" }]
    : []),
];

type Props = {
  activeTrigger: ITrigger;
  addConfig: (trigger: ITrigger, id?: string, config?: any) => void;
  closeModal: () => void;
  triggerConst: any;
};

type Config = {
  rewardType?: string;
  appliesTo?: string[];
  applyRule?: any;
};

const RewardForm = (props: Props) => {
  const { activeTrigger, addConfig, closeModal } = props;

  const [config, setConfig] = useState<Config>(activeTrigger?.config || {});

  const onChangeConfig = (name: string, value: any) => {
    setConfig({ ...config, [name]: value });
  };

  const onChangeRule = (name: string, value: any) => {
    onChangeConfig("applyRule", { ...config.applyRule, [name]: value });
  };

  const onSave = () => {
    addConfig(activeTrigger, activeTrigger.id, {
      ...(activeTrigger?.config || {}),
      ...config,
    });
    closeModal();
  };

  const renderRuleForm = () => {
    if (config.rewardType !== "birthday") {
      return null;
    }

    return (
      <>
        <FormGroup>
          <ControlLabel>Birthday Rule</ControlLabel>
          <Select
            value={BIRTHDAY_SCOPE_OPTIONS.find(
              (opt) => opt.value === config.applyRule?.birthdayRule
            )}
            options={BIRTHDAY_SCOPE_OPTIONS}
            onChange={(option) => onChangeRule("birthdayRule", option?.value)}
          />
        </FormGroup>

        {config.applyRule?.birthdayRule === "custom" && (
          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel>Start Offset (days before)</ControlLabel>
                <FormControl
                  type="number"
                  placeholder="E.g., 7 (for 7 days before birthday)"
                  value={config.applyRule?.startOffset || 0}
                  onChange={(e: any) =>
                    onChangeRule("startOffset", Number(e.target.value))
                  }
                />
              </FormGroup>
            </FormColumn>
            <FormColumn>
              <FormGroup>
                <ControlLabel>End Offset (days after)</ControlLabel>
                <FormControl
                  type="number"
                  placeholder="E.g., 3 (for 3 days after birthday)"
                  value={config.applyRule?.endOffset || 0}
                  onChange={(e: any) =>
                    onChangeRule("endOffset", Number(e.target.value))
                  }
                />
              </FormGroup>
            </FormColumn>
          </FormWrapper>
        )}
      </>
    );
  };

  return (
    <DrawerDetail>
      <FormGroup>
        <ControlLabel>Reward Type</ControlLabel>
        <Select
          value={REWARD_TYPE_OPTIONS.find(
            (option) => option.value === config.rewardType
          )}
          options={REWARD_TYPE_OPTIONS}
          onChange={(option) => onChangeConfig("rewardType", option?.value)}
        />
      </FormGroup>

      <FormGroup>
        <ControlLabel>Applies To</ControlLabel>
        <Select
          value={APPLIES_TO_OPTIONS.filter((option) =>
            config.appliesTo?.includes(option.value)
          )}
          isMulti={true}
          options={
            config.rewardType === "birthday"
              ? APPLIES_TO_OPTIONS.filter(
                  (option) => option.value !== "company"
                )
              : APPLIES_TO_OPTIONS
          }
          onChange={(options) =>
            onChangeConfig(
              "appliesTo",
              (options || []).map((option) => option.value)
            )
          }
        />
      </FormGroup>
      <ModalFooter>
        <Button btnStyle="simple" onClick={closeModal}>
          {__("Cancel")}
        </Button>
        <Button btnStyle="success" onClick={onSave}>
          {__("Save")}
        </Button>
      </ModalFooter>
    </DrawerDetail>
  );
};

export default RewardForm;
