import {
  FieldInfo,
  Padding,
} from "../../../components/messenger/widgetPreview/styles";
import { FlexItem, LeftItem } from "@erxes/ui/src/components/step/styles";
import React, { useEffect, useState } from "react";

import ButtonsGenerator from "../action/ButtonGenerator";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import { FlexRow } from "@erxes/ui-settings/src/styles";
import FormControl from "@erxes/ui/src/components/form/Control";
import FormGroup from "@erxes/ui/src/components/form/Group";
import HelpPopover from "@erxes/ui/src/components/HelpPopover";
import { IMessages } from "@erxes/ui-inbox/src/settings/integrations/types";
import Toggle from "@erxes/ui/src/components/Toggle";
import { __ } from "coreui/utils";

type BotPersistentMenuTypeMessenger = {
  _id: string;
  type: string;
  text: string;
  link: string;
};

type OnChangeHandler = (
  name: string,
  value: boolean | string | BotPersistentMenuTypeMessenger[]
) => void;

type Props = {
  onChange: OnChangeHandler;
  title?: string;
  botCheck?: boolean;
  botGreetMessage?: string;
  persistentMenus?: BotPersistentMenuTypeMessenger[];
};

const BotSelector: React.FC<Props> = (props) => {
  const { onChange, botGreetMessage, persistentMenus = [], botCheck } = props;

  const [doc, setDoc] =
    useState<BotPersistentMenuTypeMessenger[]>(persistentMenus);

  useEffect(() => {
    setDoc(persistentMenus);
  }, [persistentMenus]);

  const handleBot = (name: string, value: BotPersistentMenuTypeMessenger[]) => {
    setDoc(value);
    onChange(name, value);
  };

  const handleToggleBot = (e: React.FormEvent<Element>) => {
    const target = e.target as HTMLInputElement;
    onChange("botCheck", target.checked);
  };

  const changeBotGreetMessage = (e: React.FormEvent<HTMLElement>) => {
    const target = e.target as HTMLTextAreaElement;
    onChange("botGreetMessage", target.value);
  };

  return (
    <FlexItem>
      <LeftItem>
        <Padding>
          <FormGroup>
            <ControlLabel>{__("Greet Message (Optional)")}</ControlLabel>
            <FieldInfo error={(botGreetMessage?.length || 0) > 160}>
              {`${botGreetMessage?.length || 0}/160`}
            </FieldInfo>
            <FormControl
              componentclass="textarea"
              placeholder={__("Write here Greeting message") + "."}
              rows={3}
              value={botGreetMessage}
              onChange={changeBotGreetMessage}
              disabled={(botGreetMessage?.length || 0) > 160}
            />
          </FormGroup>
        </Padding>
        <ControlLabel>
          <FlexRow $alignItems="center">
            {__("Persistent Menu")}
            <HelpPopover title="">
              "A Persistent Menu is a quick-access toolbar in your chat.
              Customize it below for easy navigation to key bot features."
            </HelpPopover>
          </FlexRow>
        </ControlLabel>

        <ButtonsGenerator
          _id=""
          buttons={doc || []}
          addButtonLabel="Add Persistent Menu"
          onChange={(_id, _name, values) =>
            handleBot("persistentMenus", values)
          }
          limit={5}
        />

        <FormGroup>
          <ControlLabel>Generate Messenger Bots</ControlLabel>
          <p>{__("Please check messenger bot")}</p>
          <Toggle
            checked={botCheck}
            onChange={handleToggleBot}
            icons={{
              checked: <span>{__("Yes")}</span>,
              unchecked: <span>{__("No")}</span>,
            }}
          />
        </FormGroup>
      </LeftItem>
    </FlexItem>
  );
};

export default BotSelector;
