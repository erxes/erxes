import { ITrigger } from "@erxes/ui-segments/src/types";
import React, { useState } from "react";
import BotSelector from "./BotSelector";
import Select from "react-select";
import { Flex } from "@erxes/ui/src/styles/main";
import {
  Button,
  ControlLabel,
  FormGroup,
  ModalTrigger,
  Toggle,
  __,
} from "@erxes/ui/src";
import DirectMessageForm from "./DirectMessage";
import { DrawerDetail } from "@erxes/ui-automations/src/styles";
import { Features, Padding } from "../../styles";
import PostSelector, { Post } from "./PostSelector";
import Common from "@erxes/ui-automations/src/components/forms/actions/Common";

type Props = {
  activeTrigger: ITrigger;
  addConfig: (trigger: ITrigger, id?: string, config?: any) => void;
  closeModal: () => void;
  triggerConst: any;
};

const POST_TYPE = [
  {
    label: "Specific post",
    value: "specific",
  },
  {
    label: "Any post",
    value: "any",
  },
];

const postSelector = (botId, onChange, postId?) => {
  const trigger = <Button block>{__("Select Post")}</Button>;

  const content = ({ closeModal }) => {
    const onSelect = (postId) => {
      onChange("postId", postId);
      closeModal();
    };

    return <PostSelector botId={botId} onSelect={onSelect} />;
  };

  return (
    <>
      {botId && postId && <Post postId={postId} botId={botId} />}
      <ModalTrigger
        trigger={trigger}
        content={content}
        hideHeader
        title=""
        size="xl"
      />
    </>
  );
};

function CommnetForm({ activeTrigger, addConfig, closeModal }: Props) {
  const [config, setConfig] = useState(
    activeTrigger.config || { postType: "specific" }
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
          onSelect={(botId) => handleChange("botId", botId)}
        />
        <Features isToggled={config.botId}>
          <FormGroup>
            <Select
              options={POST_TYPE}
              value={POST_TYPE.find((o) => o.value === config?.postType)}
              isClearable={true}
              onChange={({ value }: any) => handleChange("postType", value)}
            />
          </FormGroup>

          {config.postType === "specific" &&
            postSelector(config.botId, handleChange, config.postId)}

          <Padding>
            <Flex style={{ justifyContent: "space-between" }}>
              <ControlLabel>
                {__(
                  `comment contains ${
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
              label={__("Comment")}
            />
          )}

          <Padding>
            <Flex style={{ justifyContent: "space-between" }}>
              <ControlLabel>
                {__("Track first level comments only")}
              </ControlLabel>
              <Toggle
                checked={config?.onlyFirstLevel}
                onChange={() =>
                  handleChange("onlyFirstLevel", !config?.onlyFirstLevel)
                }
              />
            </Flex>
          </Padding>
        </Features>
      </Common>
    </DrawerDetail>
  );
}

export default CommnetForm;
