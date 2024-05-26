import { Contents, HeightedWrapper } from "@erxes/ui/src/layout/styles";

import ConversationDetail from "../containers/conversationDetail/ConversationDetail";
import Header from "@erxes/ui/src/layout/components/Header";
import React from "react";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import { loadDynamicComponent } from "@erxes/ui/src/utils/core";

const Sidebar = asyncComponent(
  () =>
    import(
      /* webpackChunkName:"Inbox-Sidebar" */ "../containers/leftSidebar/Sidebar"
    )
);

type Props = {
  queryParams: any;
  currentConversationId: string;
};

const Inbox = (props: Props) => {
  const { currentConversationId, queryParams } = props;

  const menuInbox = [{ title: "Team Inbox", link: "/inbox/index" }];

  return (
    <HeightedWrapper>
      <Header
        title={"Conversation"}
        queryParams={queryParams}
        submenu={menuInbox}
      />
      <Contents>
        <Sidebar
          queryParams={queryParams}
          currentConversationId={currentConversationId}
        />
        <ConversationDetail currentId={currentConversationId} />
      </Contents>
    </HeightedWrapper>
  );
};

export default Inbox;
