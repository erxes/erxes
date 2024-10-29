import Common from "@erxes/ui-automations/src/components/forms/actions/Common";
import { DrawerDetail } from "@erxes/ui-automations/src/styles";
import { ITrigger } from "@erxes/ui-segments/src/types";
import {
  ControlLabel,
  FormGroup,
  SelectWithSearch,
  Toggle,
  __
} from "@erxes/ui/src";
import { Flex } from "@erxes/ui/src/styles/main";
import { IOption } from "@erxes/ui/src/types";
import React, { useState } from "react";
import Select from "react-select";
import { Features, Padding } from "../../styles";
import BotSelector from "./BotSelector";
import DirectMessageForm from "./DirectMessage";

type Props = {
  activeTrigger: ITrigger;
  addConfig: (trigger: ITrigger, id?: string, config?: any) => void;
  closeModal: () => void;
  triggerConst: any;
};

const ADS_TYPES = [
  {
    label: "Specific ads",
    value: "specific"
  },
  {
    label: "Any ads",
    value: "any"
  }
];

const adsSelector = (botId, onChange, adIds?) => {
  function generateAdsOptions(array: any[] = []): IOption[] {
    return array.map(item => ({
      value: item._id,
      label: item.name,
      avatar: item.thumbnail
    }));
  }

  return (
    <FormGroup>
      <ControlLabel>{__("Ads")}</ControlLabel>
      <SelectWithSearch
        name="adIds"
        label={__("Select a ads of this bot")}
        initialValue={adIds}
        customQuery={`query Query($botId: String) { facebookGetBotAds(botId: $botId) }`}
        multi
        queryName="facebookGetBotAds"
        filterParams={{ botId }}
        generateOptions={generateAdsOptions}
        onSelect={values => onChange("adIds", values)}
      />
    </FormGroup>
  );
};

function AdsForm({ activeTrigger, addConfig, closeModal }: Props) {
  const [config, setConfig] = useState(
    activeTrigger.config || { adsType: "specific" }
  );

  const handleChange = (name, value) => {
    setConfig({ ...config, [name]: value });
  };

  return (
    <DrawerDetail>
      <Common
        closeModal={closeModal}
        addAction={addConfig}
        activeAction={activeTrigger}
        config={config}
      >
        <BotSelector
          botId={config.botId}
          onSelect={botId => handleChange("botId", botId)}
        />
        <Features isToggled={config.botId}>
          <FormGroup>
            <Select
              options={ADS_TYPES}
              value={ADS_TYPES.find(o => o.value === config?.adsType)}
              isClearable={true}
              onChange={({ value }: any) => handleChange("adsType", value)}
            />
          </FormGroup>

          {config.adsType === "specific" &&
            adsSelector(config.botId, handleChange, config.adIds)}

          <Padding>
            <Flex style={{ justifyContent: "space-between" }}>
              <ControlLabel>
                {__(
                  `message from ads contains ${
                    config?.checkContent ? "specific" : "any"
                  } words`
                )}
              </ControlLabel>
              <Toggle
                checked={config?.checkContent}
                onChange={() =>
                  handleChange("checkContent", !config?.checkContent)
                }
              />
            </Flex>
          </Padding>
          {config?.checkContent && (
            <DirectMessageForm
              conditions={config.conditions}
              onChange={handleChange}
              label={__("Message from ads")}
            />
          )}
        </Features>
      </Common>
    </DrawerDetail>
  );
}

export default AdsForm;
