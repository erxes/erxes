import { Button, Icon, Label, Tags } from "modules/common/components";
import { AvatarImg } from "modules/common/components/filterableList/styles";
import { __ } from "modules/common/utils";
import { AssignBoxPopover } from "modules/inbox/components";
import { Resolver, Tagger } from "modules/inbox/containers";
import { RespondBox } from "modules/inbox/containers/conversationDetail";
import {
  ActionBarLeft,
  AssignText,
  AssignTrigger,
  ConversationWrapper,
  PopoverButton
} from "modules/inbox/styles";
import { Wrapper } from "modules/layout/components";
import { ContenFooter, ContentBox } from "modules/layout/styles";
import { BarItems } from "modules/layout/styles";
import React, { Component, Fragment } from "react";
import { IAddMessage } from "../../../containers/conversationDetail/WorkArea";
import { IConversation, IMessage } from "../../../types";
import Conversation from "./conversation/Conversation";
import Participators from "./Participators";

type Props = {
  queryParams?: any;
  title?: string;
  currentConversationId?: string;
  currentConversation: IConversation;
  conversationMessages: IMessage[];
  loading: boolean;
  loadMoreMessages: () => void;
  addMessage: (
    {
      variables,
      optimisticResponse,
      callback,
      kind
    }: {
      variables: IAddMessage;
      optimisticResponse: any;
      callback?: (e?) => void;
      kind: string;
    }
  ) => void;
};

type State = {
  attachmentPreview: any;
};

export default class WorkArea extends Component<Props, State> {
  private node;

  constructor(props: Props) {
    super(props);

    this.state = { attachmentPreview: {} };

    this.node = React.createRef();
    this.setAttachmentPreview = this.setAttachmentPreview.bind(this);
    this.scrollBottom = this.scrollBottom.bind(this);
    this.onScroll = this.onScroll.bind(this);
  }

  componentDidMount() {
    this.scrollBottom();
  }

  // Calculating new messages's height to use later in componentDidUpdate
  // So that we can retract cursor position to original place
  getSnapshotBeforeUpdate(prevProps) {
    const { conversationMessages } = this.props;

    if (prevProps.conversationMessages.length < conversationMessages.length) {
      const { current } = this.node;

      return current.scrollHeight - current.scrollTop;
    }

    return null;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { conversationMessages, currentConversation } = this.props;

    const twitterData = currentConversation.twitterData;
    const isTweet = twitterData && !twitterData.isDirectMessage;

    if (isTweet) {
      return null;
    }

    const messageCount = conversationMessages.length;
    const prevMessageCount = prevProps.conversationMessages.length;

    if (snapshot !== null) {
      const { current } = this.node;
      current.scrollTop = current.scrollHeight - snapshot;
    }

    if (prevMessageCount + 1 === messageCount) {
      this.scrollBottom();
    }

    return;
  }

  onScroll() {
    const { current } = this.node;
    const { loadMoreMessages } = this.props;

    if (current.scrollTop === 0) loadMoreMessages();
  }

  scrollBottom() {
    const { current } = this.node;

    current.scrollTop = current.scrollHeight;
  }

  setAttachmentPreview(attachmentPreview) {
    this.setState({ attachmentPreview });
  }

  render() {
    const {
      currentConversation,
      conversationMessages,
      addMessage,
      loading
    } = this.props;

    const tags = currentConversation.tags || [];
    const assignedUser = currentConversation.assignedUser;
    const participatedUsers = currentConversation.participatedUsers || [];

    const tagTrigger = (
      <PopoverButton>
        {tags.length ? (
          <Tags tags={tags} limit={1} />
        ) : (
          <Label lblStyle="default">No tags</Label>
        )}
        <Icon icon="downarrow" />
      </PopoverButton>
    );

    const assignTrigger = (
      <AssignTrigger>
        {assignedUser && assignedUser._id ? (
          <AvatarImg
            src={
              assignedUser.details
                ? assignedUser.details.avatar
                : "/images/avatar-colored.svg"
            }
          />
        ) : (
          <Button btnStyle="simple" size="small">
            Member
          </Button>
        )}
        <Icon icon="downarrow" />
      </AssignTrigger>
    );

    const actionBarRight = (
      <BarItems>
        <Tagger targets={[currentConversation]} trigger={tagTrigger} />

        <Resolver conversations={[currentConversation]} />
      </BarItems>
    );

    const actionBarLeft = (
      <ActionBarLeft>
        <AssignText>{__("Assign to")}:</AssignText>
        <AssignBoxPopover
          targets={[currentConversation]}
          trigger={assignTrigger}
        />
        {participatedUsers && (
          <Participators participatedUsers={participatedUsers} limit={3} />
        )}
      </ActionBarLeft>
    );

    const actionBar = (
      <Wrapper.ActionBar
        right={actionBarRight}
        left={actionBarLeft}
        background="colorWhite"
      />
    );

    const content = (
      <ConversationWrapper innerRef={this.node} onScroll={this.onScroll}>
        <Conversation
          conversation={currentConversation}
          scrollBottom={this.scrollBottom}
          conversationMessages={conversationMessages}
          attachmentPreview={this.state.attachmentPreview}
          loading={loading}
        />
      </ConversationWrapper>
    );

    return (
      <Fragment>
        {actionBar}
        <ContentBox>{content}</ContentBox>
        {currentConversation._id && (
          <ContenFooter>
            <RespondBox
              conversation={currentConversation}
              setAttachmentPreview={this.setAttachmentPreview}
              addMessage={addMessage}
            />
          </ContenFooter>
        )}
      </Fragment>
    );
  }
}
