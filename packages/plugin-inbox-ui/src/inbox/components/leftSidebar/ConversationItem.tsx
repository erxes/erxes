import * as dayjs from "dayjs";
import * as relativeTime from "dayjs/plugin/relativeTime";

import {
  AssigneeImg,
  CheckBox,
  Count,
  FlexContent,
  Idle,
  MainInfo,
  MessageContent,
  RowContent,
  RowItem,
  SmallTextOneLine,
} from "./styles";
import {
  CustomerName,
  EllipsisContent,
  Flex as FlexRoot,
} from "@erxes/ui/src/styles/main";
import {
  cleanIntegrationKind,
  readFile,
  renderFullName,
} from "@erxes/ui/src/utils";

import { CallLabel } from "@erxes/ui-inbox/src/inbox/styles";
import FormControl from "@erxes/ui/src/components/form/Control";
import { IBrand } from "@erxes/ui/src/brands/types";
import { IConversation } from "@erxes/ui-inbox/src/inbox/types";
import { ICustomer } from "@erxes/ui-contacts/src/customers/types";
import { IIntegration } from "@erxes/ui-inbox/src/settings/integrations/types";
import { IUser } from "@erxes/ui/src/auth/types";
import IntegrationIcon from "@erxes/ui-inbox/src/settings/integrations/components/IntegrationIcon";
import NameCard from "@erxes/ui/src/components/nameCard/NameCard";
import React from "react";
import Tags from "@erxes/ui/src/components/Tags";
import Tip from "@erxes/ui/src/components/Tip";
import strip from "strip";
import withCurrentUser from "@erxes/ui/src/auth/containers/withCurrentUser";

dayjs.extend(relativeTime);

type Props = {
  conversation: IConversation;
  channelId?: string;
  isActive: boolean;
  onClick: (conversation: IConversation) => void;
  toggleCheckbox: (conversation: IConversation, checked: boolean) => void;
  selectedIds?: string[];
  currentUser: IUser;
};

const ConversationItem: React.FC<Props> = (props) => {
  const {
    conversation,
    isActive,
    selectedIds = [],
    currentUser,
    onClick,
    toggleCheckbox,
  } = props;

  const toggleCheckboxHandler = (e: React.FormEvent<HTMLElement>) => {
    toggleCheckbox(conversation, (e.target as HTMLInputElement).checked);
  };

  const onClickHandler = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick(conversation);
  };

  const renderCheckbox = () => {
    if (!toggleCheckbox) {
      return null;
    }

    return (
      <CheckBox onClick={(e) => e.stopPropagation()}>
        <FormControl
          componentclass="checkbox"
          onChange={toggleCheckboxHandler}
        />
      </CheckBox>
    );
  };

  const isIdle = (integration: IIntegration, idleTime: number) => {
    const kind = integration.kind;

    if (
      kind === "form" ||
      kind.includes("nylas") ||
      kind === "gmail" ||
      conversation.status === "closed"
    ) {
      return false;
    }

    // become idle in 3 minutes
    return idleTime >= 3;
  };

  const showMessageContent = (kind: string, content: string) => {
    if (kind === "callpro") {
      return (
        <CallLabel type={(content || "").toLocaleLowerCase()}>
          {content}
        </CallLabel>
      );
    }

    return strip(content);
  };

  const {
    createdAt,
    updatedAt,
    idleTime,
    content,
    customer = {} as ICustomer,
    integration = {} as IIntegration,
    tags = [],
    assignedUser,
    messageCount = 0,
    readUserIds,
  } = conversation;

  const isRead = readUserIds && readUserIds.indexOf(currentUser._id) > -1;
  const isExistingCustomer = customer && customer._id;
  const isChecked = selectedIds.includes(conversation._id);
  const brand = integration.brand || ({} as IBrand);

  return (
    <RowItem onClick={onClickHandler} $isActive={isActive} $isRead={isRead}>
      <RowContent $isChecked={isChecked}>
        {renderCheckbox()}
        <FlexContent>
          <MainInfo>
            {isExistingCustomer && (
              <NameCard.Avatar
                size={36}
                letterCount={1}
                customer={customer}
                icon={<IntegrationIcon integration={integration} />}
              />
            )}
            <FlexContent>
              <CustomerName>
                <EllipsisContent>
                  {isExistingCustomer && renderFullName(customer)}
                </EllipsisContent>
                <time>
                  {(dayjs(updatedAt || createdAt) || ({} as any)).fromNow(true)}
                </time>
              </CustomerName>

              <SmallTextOneLine>
                to {brand.name} via{" "}
                {integration.kind === "callpro"
                  ? integration.name
                  : cleanIntegrationKind(integration && integration.kind)}
              </SmallTextOneLine>
            </FlexContent>
          </MainInfo>

          <MessageContent>
            <EllipsisContent>
              {showMessageContent(integration.kind, content || "")}
            </EllipsisContent>
            <FlexRoot>
              {messageCount > 1 && <Count>{messageCount}</Count>}
              {assignedUser && (
                <Tip
                  key={assignedUser._id}
                  placement="top"
                  text={assignedUser.details && assignedUser.details.fullName}
                >
                  <AssigneeImg
                    src={
                      assignedUser.details &&
                      (assignedUser.details.avatar
                        ? readFile(assignedUser.details.avatar, 36)
                        : "/images/avatar-colored.svg")
                    }
                  />
                </Tip>
              )}
            </FlexRoot>
          </MessageContent>
          <Tags tags={tags} limit={3} />
        </FlexContent>
      </RowContent>
      {isIdle(integration, idleTime) && (
        <Tip placement="left" text="Idle">
          <Idle />
        </Tip>
      )}
    </RowItem>
  );
};

export default withCurrentUser(ConversationItem);
