import {
  CommentContainer,
  CommentContent,
  CommentWrapper,
  CreatedUser,
  Description,
  DetailHeader,
  DetailRow,
  Label,
  RightSidebar,
  TicketComment,
  TicketDetailContent,
} from "../../styles/cards";

import Button from "../../common/Button";
import { ControlLabel } from "../../common/form";
import { IUser } from "../../types";
import Icon from "../../common/Icon";
import Link from "next/link";
import PriorityIndicator from "../../common/PriorityIndicator";
import React from "react";
import { TextArea } from "../../common/form/styles";
import dayjs from "dayjs";
import { readFile } from "../../common/utils";
import { renderUserFullName } from "../../utils";

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
      content: "",
    };
  }

  handleChange = (e) => {
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
        {comments.map((comment) => {
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
                    <h5>{`${createdUser?.firstName} ${createdUser?.lastName}`}</h5>
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

  renderDetailInfo() {
    const {
      number,
      createdUser,
      status,
      stage,
      priority,
      createdAt,
      modifiedAt,
      modifiedBy,
      startedDate,
      endDate,
    } = this.props.item || ({} as any);

    return (
      <TicketDetailContent>
        <DetailRow>
          <ControlLabel>Number</ControlLabel>
          <span>{number || "-"}</span>
        </DetailRow>
        <DetailRow>
          <ControlLabel>Stage</ControlLabel>
          <span>{stage.name}</span>
        </DetailRow>
        <DetailRow>
          <ControlLabel>Requestor</ControlLabel>
          <span>{renderUserFullName(createdUser || ({} as any))}</span>
        </DetailRow>
        <DetailRow>
          <ControlLabel>Assigned users</ControlLabel>
          <span>{number}</span>
        </DetailRow>
        <DetailRow>
          <ControlLabel>Status</ControlLabel>
          <span>{status}</span>
        </DetailRow>
        <DetailRow>
          <ControlLabel>Priority</ControlLabel>
          <span>
            <PriorityIndicator value={priority} /> {priority || "Normal"}
          </span>
        </DetailRow>
        <DetailRow>
          <ControlLabel>Created at</ControlLabel>
          <span>{dayjs(createdAt).format("DD MMM YYYY, HH:mm")}</span>
        </DetailRow>
        <DetailRow>
          <ControlLabel>Modified at</ControlLabel>
          <span>{dayjs(modifiedAt).format("DD MMM YYYY, HH:mm")}</span>
        </DetailRow>
        <DetailRow>
          <ControlLabel>Start date</ControlLabel>
          <span>{dayjs(startedDate).format("DD MMM YYYY, HH:mm")}</span>
        </DetailRow>
        <DetailRow>
          <ControlLabel>End date</ControlLabel>
          <span>{dayjs(endDate).format("DD MMM YYYY, HH:mm")}</span>
        </DetailRow>
      </TicketDetailContent>
    );
  }

  render() {
    const currentUser = this.props.currentUser || ({} as IUser);
    const { item, type, comments } = this.props;
    const email = currentUser.email;

    if (!item) {
      return null;
    }

    const { labels, description } = item;

    return (
      <>
        <DetailHeader className="d-flex align-items-center">
          <Link href={`/${type}s`}>
            <span>
              <Icon icon="leftarrow-3" /> Back
            </span>
          </Link>
        </DetailHeader>
        <div className="row">
          <div className="col-md-9">
            <h4>{item.name}</h4>
            <DetailRow>
              <ControlLabel>Labels</ControlLabel>
              <div className="d-flex" style={{ gap: "5px" }}>
                {!labels || labels.length === 0 ? (
                  <span>No labels at the moment!</span>
                ) : (
                  (labels || []).map((label) => (
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
            <DetailRow>
              <ControlLabel>Description</ControlLabel>
              {description ? (
                <Description
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              ) : (
                <span>No description at the moment!</span>
              )}
            </DetailRow>

            <DetailRow>
              <ControlLabel>Attachments</ControlLabel>
              <span>No attachments at the moment!</span>
            </DetailRow>

            <ControlLabel>Comments</ControlLabel>
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
          </div>

          <div className="col-md-3">
            <RightSidebar>
              <h6 className="d-flex align-items-center">
                <Icon icon="info-circle" /> &nbsp; Detail Info
              </h6>
              {this.renderDetailInfo()}
            </RightSidebar>
          </div>
        </div>
      </>
    );
  }
}
