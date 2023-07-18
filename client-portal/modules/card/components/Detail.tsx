import {
  Assignees,
  Card,
  CommentContainer,
  CommentContent,
  CommentWrapper,
  CreatedUser,
  Description,
  DetailHeader,
  DetailRow,
  FlexRow,
  Label,
  TicketComment,
  TicketDetailContent
} from "../../styles/cards";
import { getUserAvatar, renderUserFullName } from "../../utils";

import AttachmentsGallery from "../../common/AttachmentGallery";
import Button from "../../common/Button";
import { ControlLabel } from "../../common/form";
import { IUser } from "../../types";
import Icon from "../../common/Icon";
import Link from "next/link";
import PriorityIndicator from "../../common/PriorityIndicator";
import React from "react";
import { TextArea } from "../../common/form/styles";
import { __ } from "../../../utils";
import dayjs from "dayjs";
import { readFile } from "../../common/utils";

type Props = {
  item?: any;
  comments?: any;
  currentUser: IUser;
  type: string;
  onClose: () => void;
  handleSubmit: ({ content }: { content: string }) => void;
  handleRemoveComment: (commentId: string) => void;
};

export default class CardDetail extends React.Component<
  Props,
  { content: string }
> {
  constructor(props) {
    super(props);

    this.state = {
      content: ""
    };
  }

  handleChange = e => {
    this.setState({ content: e.target.value });
  };

  createComment = () => {
    this.props.handleSubmit({ content: this.state.content });

    this.setState({ content: "" });
  };

  deleteComment = (commentId: string) => {
    this.props.handleRemoveComment(commentId);
  };

  renderComments(comments) {
    return (
      <CommentWrapper>
        {comments.map(comment => {
          const { createdUser = {} } = comment;

          return (
            <TicketComment key={comment._id}>
              <CreatedUser>
                <img
                  src={readFile(
                    createdUser && createdUser.avatar
                      ? createdUser?.avatar
                      : "/static/avatar-colored.svg"
                  )}
                  alt="profile"
                />
                <div>
                  <CommentContent>
                    <h5>{renderUserFullName(createdUser)}</h5>
                    <div
                      className="comment"
                      dangerouslySetInnerHTML={{ __html: comment.content }}
                    />
                  </CommentContent>
                  <span>
                    Created at{" "}
                    {dayjs(comment.createdAt).format("YYYY-MM-DD HH:mm")}
                  </span>
                </div>
                {createdUser?._id === this.props.currentUser._id && (
                  <div className="actions">
                    <span onClick={() => this.deleteComment(comment._id)}>
                      Delete
                    </span>
                  </div>
                )}
              </CreatedUser>
            </TicketComment>
          );
        })}
      </CommentWrapper>
    );
  }

  renderAssignedUsers() {
    const { assignedUsers } = this.props.item || {};

    if (!assignedUsers || assignedUsers.length === 0) {
      return <span>{__("No one`s assigned yet")}</span>;
    }

    return assignedUsers.map(user => (
      <Assignees key={user._id}>
        <img
          alt={renderUserFullName(user)}
          src={getUserAvatar(user)}
          width={24}
          height={24}
        />
        <span>{renderUserFullName(user)}</span>
      </Assignees>
    ));
  }

  renderProductsInfo() {
    const { productsData } = this.props.item;
    if (productsData) {
      return productsData.map(product => (
        <span key={product._id}>
          {product.name}&nbsp;<b>({product.quantity} PC)</b>
        </span>
      ));
    }
  }

  renderDetailInfo() {
    const {
      number,
      createdUser,
      status,
      stage,
      createdAt,
      modifiedAt,
      startDate,
      closeDate
    } = this.props.item || ({} as any);

    const { type } = this.props;

    return (
      <TicketDetailContent>
        <DetailRow type="row">
          <ControlLabel>Number</ControlLabel>
          <span>{number || "-"}</span>
        </DetailRow>
        <DetailRow type="row">
          <ControlLabel>Requestor</ControlLabel>
          <span>{renderUserFullName(createdUser || ({} as any))}</span>
        </DetailRow>
        <DetailRow type="row">
          <ControlLabel>Status</ControlLabel>
          <span>{status}</span>
        </DetailRow>
        <DetailRow type="row">
          <ControlLabel>Created at</ControlLabel>
          <span>{dayjs(createdAt).format("DD MMM YYYY, HH:mm")}</span>
        </DetailRow>
        <DetailRow type="row">
          <ControlLabel>Modified at</ControlLabel>
          <span>{dayjs(modifiedAt).format("DD MMM YYYY, HH:mm")}</span>
        </DetailRow>
        <DetailRow type="row">
          <ControlLabel>Assigned users</ControlLabel>
          <div>{this.renderAssignedUsers()}</div>
        </DetailRow>
        {type === "deal" && (
          <DetailRow type="row">
            <ControlLabel>Products & Service</ControlLabel>
            <div>{this.renderProductsInfo()}</div>
          </DetailRow>
        )}
      </TicketDetailContent>
    );
  }

  renderAttachments() {
    const { attachments } = this.props.item || {};

    if (!attachments || attachments.length === 0) {
      return <Description>{__("No attachments at the moment!")}</Description>;
    }

    return <AttachmentsGallery attachments={attachments} />;
  }

  render() {
    const currentUser = this.props.currentUser || ({} as IUser);
    const { item, type, comments } = this.props;
    const email = currentUser.email;

    if (!item) {
      return null;
    }

    const { labels, description, priority, startDate, closeDate, stage } = item;

    const startedDate = dayjs(startDate).format("YYYY-MM-DD");
    const endDate = dayjs(closeDate).format("YYYY-MM-DD");
    const durationDays = dayjs(endDate).diff(dayjs(startedDate), "days");

    return (
      <>
        <DetailHeader className="d-flex align-items-center">
          <Link href={`/${type}s`}>
            <span>
              <Icon icon="angle-double-left" size={20} /> Back
            </span>
          </Link>
        </DetailHeader>
        <div className="row">
          <div className="col-md-12">
            <Card>
              <h4>{item.name}</h4>
              <FlexRow className="justify-content-between">
                <DetailRow>
                  <ControlLabel>Stage</ControlLabel>
                  <span>{stage ? stage.name : "-"}</span>
                </DetailRow>
                <DetailRow>
                  <ControlLabel>Start date</ControlLabel>
                  <span>
                    {startDate
                      ? dayjs(startDate).format("DD MMM YYYY, HH:mm")
                      : "-"}
                  </span>
                </DetailRow>
                <DetailRow>
                  <ControlLabel>Due date</ControlLabel>
                  <span>
                    {closeDate
                      ? dayjs(closeDate).format("DD MMM YYYY, HH:mm")
                      : "-"}
                  </span>
                </DetailRow>
                <DetailRow>
                  <ControlLabel>Duration</ControlLabel>
                  <span>{closeDate ? `${durationDays} days` : "-"}</span>
                </DetailRow>
              </FlexRow>
            </Card>
          </div>
          <div className="col-md-5">
            <ControlLabel>Details</ControlLabel>
            <Card>
              <DetailRow type="row">
                <ControlLabel>Priority</ControlLabel>
                <span>
                  <PriorityIndicator value={priority} /> {priority || "Normal"}
                </span>
              </DetailRow>
              <DetailRow type="row">
                <ControlLabel>Labels</ControlLabel>
                <div className="d-flex" style={{ gap: "5px" }}>
                  {!labels || labels.length === 0 ? (
                    <span>No labels at the moment!</span>
                  ) : (
                    (labels || []).map(label => (
                      <Label
                        key={label._id}
                        lblStyle={"custom"}
                        colorCode={label.colorCode}
                      >
                        {label.name}
                      </Label>
                    ))
                  )}
                </div>
              </DetailRow>
              {this.renderDetailInfo()}
            </Card>
          </div>

          <div className="col-md-7">
            <ControlLabel>Description</ControlLabel>
            <Card>
              {description ? (
                <Description
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              ) : (
                <span>No description at the moment!</span>
              )}
            </Card>

            <ControlLabel>Attachments</ControlLabel>
            <Card> {this.renderAttachments()}</Card>

            <ControlLabel>Comments</ControlLabel>
            <Card>
              <CommentContainer>
                <TextArea
                  onChange={this.handleChange}
                  placeholder="Write a comment..."
                  value={this.state.content}
                />
                {this.state.content.length !== 0 && (
                  <div className="buttons">
                    <Button
                      btnStyle="success"
                      size="small"
                      icon="message"
                      onClick={this.createComment.bind(this, email)}
                    >
                      Save
                    </Button>
                  </div>
                )}
                {this.renderComments(comments)}
              </CommentContainer>
            </Card>
          </div>
        </div>
      </>
    );
  }
}
