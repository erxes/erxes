import { NameCard } from "modules/common/components";
import * as React from "react";
import { Date, FacebookContent, Reactions, UserName } from ".";
import { IMessage, IMessageFacebookData } from "../../../../../types";
import { Counts, FlexItem, PostContainer, User } from "./styles";

type Props = {
  message: IMessage;
  scrollBottom: () => void;
};

export default class FacebookPost extends React.Component<Props, {}> {
  renderCounts(data: IMessageFacebookData) {
    return (
      <Counts>
        <FlexItem>
          {data.reactions && <Reactions reactions={data.reactions} />}
          <a>{data.likeCount !== 0 && data.likeCount}</a>
        </FlexItem>
        <span>{data.commentCount} Comments</span>
      </Counts>
    );
  }

  render() {
    const { message, scrollBottom } = this.props;
    const customer = message.customer;
    const data = message.facebookData;

    if (!data) {
      return null;
    }

    return (
      <PostContainer>
        <NameCard.Avatar customer={customer} />

        <User isPost>
          <UserName username={data.senderName} userId={data.senderId} />
          <Date message={message} />
        </User>

        <FacebookContent
          content={message.content}
          image={data.photo}
          images={data.photos}
          link={data.link || data.video}
          scrollBottom={scrollBottom}
        />

        {this.renderCounts(data)}
      </PostContainer>
    );
  }
}
