import { __ } from "modules/common/utils";
import { Header } from "modules/layout/components";
import { Contents } from "modules/layout/styles";
import * as React from "react";
import { ConversationDetail } from "../containers/conversationDetail";
import { Sidebar } from "../containers/leftSidebar";

type Props = {
  queryParams: any;
  currentConversationId: string;
};

function Inbox({ currentConversationId, queryParams }: Props) {
  const breadcrumb = [{ title: __("Inbox") }];
  const submenu = [{ title: __("Inbox"), link: "/inbox" }, { title: __("Insights"), link: "/insights" }];
  
  return (
    <Contents>
      <Header queryParams={queryParams} breadcrumb={breadcrumb} submenu={submenu} />
      <Sidebar
        queryParams={queryParams}
        currentConversationId={currentConversationId}
      />
      <ConversationDetail currentId={currentConversationId} />
    </Contents>
  );
}

export default Inbox;