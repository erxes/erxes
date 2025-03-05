import { FlexItem, LeftItem } from "@erxes/ui/src/components/step/styles";

import BotSelector from "./BotSelector";
import CloudflareCalls from "./CloudflareCalls";
import CollapseContent from "@erxes/ui/src/components/CollapseContent";
import Connection from "./Connection";
import { ContentBox } from "@erxes/ui-settings/src/styles";
import { ICallData } from "@erxes/ui-inbox/src/settings/integrations/types";
import Icon from "@erxes/ui/src/components/Icon";
import React from "react";

type BotPersistentMenuTypeMessenger = {
  _id: string;
  type: string;
  text: string;
  link: string;
};

type Props = {
  onChange: (name: any, value: any) => void;
  callData?: ICallData;
  title?: string;
  botEndpointUrl?: string;
  botShowInitialMessage?: boolean;
  botCheck?: boolean;
  brandId?: string;
  channelIds?: string[];
  botGreetMessage?: string;
  persistentMenus?: BotPersistentMenuTypeMessenger[];
};

const ConfigSetup: React.FC<Props> = ({
  onChange,
  callData,
  title,
  botCheck,
  botEndpointUrl,
  botGreetMessage,
  botShowInitialMessage,
  brandId,
  persistentMenus,
  channelIds,
}) => {
  return (
    <FlexItem>
      <LeftItem $noPadding>
        <ContentBox id={"IntegrationConfigSetup"} $noPadding>
          <CollapseContent
            full={true}
            beforeTitle={<Icon icon="puzzle" />}
            transparent={true}
            open={true}
            title="Integration Setup"
          >
            <Connection
              title={title}
              botEndpointUrl={botEndpointUrl}
              botShowInitialMessage={botShowInitialMessage}
              botCheck={botCheck}
              channelIds={channelIds}
              brandId={brandId}
              onChange={onChange}
            />
          </CollapseContent>
          <CollapseContent
            full={true}
            beforeTitle={<Icon icon="robot" />}
            transparent={true}
            title="Bot Setup"
          >
            <BotSelector
              title={title}
              botCheck={botCheck}
              botGreetMessage={botGreetMessage}
              persistentMenus={persistentMenus}
              onChange={onChange as any} // Explicitly cast
            />
          </CollapseContent>
          <CollapseContent
            full={true}
            beforeTitle={<Icon icon="phone-call" />}
            transparent={true}
            title="Cloudflare Calls Setup"
          >
            <CloudflareCalls onChange={onChange} callData={callData} />
          </CollapseContent>
        </ContentBox>
      </LeftItem>
    </FlexItem>
  );
};

export default ConfigSetup;
