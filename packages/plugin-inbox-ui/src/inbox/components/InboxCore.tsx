import { IUser } from "@erxes/ui/src/auth/types";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import Header from "@erxes/ui/src/layout/components/Header";
import { Contents, HeightedWrapper } from "@erxes/ui/src/layout/styles";
import MailForm from "@erxes/ui-settings/src/integrations/containers/mail/MailForm";
import React from "react";
import { __ } from "coreui/utils";
import strip from "strip";
import gql from "graphql-tag";
import { UnreadConversationsTotalCountQueryResponse } from "@erxes/ui-inbox/src/inbox/types";
import { subscriptions } from "@erxes/ui-inbox/src/inbox/graphql";
import { sendDesktopNotification, setBadge } from "@erxes/ui/src/utils";

const Sidebar = asyncComponent(() =>
  import(
    /* webpackChunkName:"Inbox-Sidebar" */ "../containers/leftSidebar/Sidebar"
  )
);

const ConversationDetail = asyncComponent(
  () =>
    import(
      /* webpackChunkName:"Inbox-ConversationDetail" */ "../containers/conversationDetail/ConversationDetail"
    ),
  { height: "auto", width: "100%", color: "#fff", margin: "10px 10px 10px 0" }
);

type Props = {
  queryParams: any;
  currentConversationId: string;
  currentUser: IUser;
  unreadConversationsCountQuery?: UnreadConversationsTotalCountQueryResponse;
};

class Inbox extends React.Component<Props> {
  componentWillMount() {
    const { unreadConversationsCountQuery, currentUser } = this.props;

    unreadConversationsCountQuery.subscribeToMore({
      // listen for all conversation changes
      document: gql(subscriptions.conversationClientMessageInserted),
      variables: { userId: currentUser._id },
      updateQuery: (prev, { subscriptionData: { data } }) => {
        const { conversationClientMessageInserted } = data;
        const { content } = conversationClientMessageInserted;

        this.props.unreadConversationsCountQuery.refetch();

        // no need to send notification for bot message
        sendDesktopNotification({
          title: "You have a new message",
          content: strip(content || ""),
        });
      },
    });
  }

  componentWillReceiveProps = (nextProps) => {
    const { unreadConversationsCountQuery } = this.props;
    const unreadConversationsCount =
      unreadConversationsCountQuery.conversationsTotalUnreadCount || 0;

    const unreadCount = nextProps.unreadConversationsCount;

    if (unreadCount !== unreadConversationsCount) {
      setBadge(unreadCount, __("Team Inbox").toString());
    }
  };

  render() {
    const { currentConversationId, queryParams, currentUser } = this.props;

    const menuInbox = [{ title: "Team Inbox", link: "/inbox/index" }];

    const content = () => <MailForm isReply={false} clearOnSubmit={true} />;

    const sendEmail = (
      <ModalTrigger
        dialogClassName="middle"
        title="Send an Email"
        trigger={<span>{__("Send an Email")}</span>}
        size="lg"
        content={content}
        paddingContent="less-padding"
        enforceFocus={false}
      />
    );

    return (
      <HeightedWrapper>
        <Header
          title={"Conversation"}
          queryParams={queryParams}
          submenu={menuInbox}
          additionalMenuItem={sendEmail}
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
  }
}

export default Inbox;
