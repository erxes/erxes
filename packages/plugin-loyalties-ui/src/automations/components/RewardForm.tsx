import { DrawerDetail } from "@erxes/ui-automations/src/styles";
import { ITrigger } from "@erxes/ui-segments/src/types";
import { ControlLabel, FormControl, FormGroup } from "@erxes/ui/src";
import Button from "@erxes/ui/src/components/Button";
import {
  FormColumn,
  FormWrapper,
  ModalFooter,
} from "@erxes/ui/src/styles/main";
import { __ } from "@erxes/ui/src/utils/core";
import React, { useState } from "react";
import Select from "react-select";

const REWARD_TYPE_OPTIONS = [
  {
    label: "Birthday",
    value: "birthday",
  }
];

const APPLIES_TO_OPTIONS = [
  { label: "Team Members", value: "user" },
  { label: "Customers", value: "customer" },
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

  const onSave = () => {
    addConfig(activeTrigger, activeTrigger.id, {
      ...(activeTrigger?.config || {}),
      ...config,
    });
    closeModal();
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
