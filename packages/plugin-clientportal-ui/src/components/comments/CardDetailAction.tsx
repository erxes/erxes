import {
  CommentContent,
  CommentWrapper,
  CreatedUser,
  TicketComment,
  TicketContent,
  TicketLabel,
} from "./styles";
import React, { useState } from "react";
import { __, readFile } from "@erxes/ui/src/utils";

import Button from "@erxes/ui/src/components/Button";
import EmptyState from "@erxes/ui/src/components/EmptyState";
import FormControl from "@erxes/ui/src/components/form/Control";
import Icon from "@erxes/ui/src/components/Icon";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import { colors } from "@erxes/ui/src/styles";
import dayjs from "dayjs";
import { rgba } from "@erxes/ui/src/styles/ecolor";
import styled from "styled-components";
import styledTS from "styled-components-ts";

type Props = {
  comments: any[];
  handleSubmit: ({ content }: { content: string }) => void;
  handleRemoveComment: (commentId: string) => void;
};

const TriggerButton = styledTS<{ color?: string }>(styled.div)`
  height: 25px;
  border-radius: 2px;
  font-weight: 500;
  line-height: 25px;
  font-size: 12px;
  background-color: ${(props) => rgba(props.color || colors.colorPrimary, 0.1)};
  color: ${(props) => props.color || colors.colorPrimaryDark};
  padding: 0 10px;
  transition: background 0.3s ease;
  > i {
    margin-right: 5px;
  }
  > span {
    margin-right: 5px;
  }
  &:hover {
    cursor: pointer;
    background-color: ${(props) => rgba(props.color || colors.colorPrimary, 0.2)};
  }
`;

const Container: React.FC<Props> = ({
  comments,
  handleRemoveComment,
  handleSubmit,
}: Props) => {
  const [content, setContent] = useState("");

  const handleChange = (e) => {
    setContent(e.target.value);
  };

  const onEditComment = (comment) => {
    setContent(comment.content);
  };

  const createComment = () => {
    setContent("");

    handleSubmit({ content });
  };

  const deleteComment = (commentId: string) => {
    handleRemoveComment(commentId);
  };

  const renderComments = (comments) => {
    if (!comments.length) {
      return (
        <EmptyState
          icon="comment-1"
          text={`There is no comments yet. Be the first one to comment.`}
          size="small"
        />
      );
    }

    return (
      <CommentWrapper>
        {comments.map((comment) => {
          const { createdUser = {} } = comment;

          return (
            <TicketComment key={comment._id}>
              <CreatedUser>
                <img src={readFile(createdUser?.avatar)} alt="profile" />
                <div>
                  <CommentContent>
                    <h5>{`${createdUser?.firstName} ${createdUser?.lastName}`}</h5>
                    <div
                      className="comment"
                      dangerouslySetInnerHTML={{
                        __html: comment.content,
                      }}
                    />
                  </CommentContent>
                  <span>
                    Reported{" "}
                    {dayjs(comment.createdAt).format("YYYY-MM-DD HH:mm")}
                  </span>
                </div>
                <div className="actions">
                  <span onClick={() => deleteComment(comment._id)}>Delete</span>
                </div>
              </CreatedUser>
            </TicketComment>
          );
        })}
      </CommentWrapper>
    );
  };

  const renderContent = () => {
    return (
      <>
        <TicketLabel>
          <Icon icon="comment-1" size={14} />
          &nbsp; Activity
        </TicketLabel>
        <TicketContent>
          <FormControl
            value={content}
            componentclass="textarea"
            onChange={handleChange}
          />
          {content.length !== 0 && (
            <div className="buttons">
              <Button
                btnStyle="success"
                size="small"
                icon="message"
                onClick={createComment.bind(this, "")}
              >
                Save
              </Button>
            </div>
          )}
          {renderComments(comments)}
        </TicketContent>
      </>
    );
  };

  const trigger = (
    <TriggerButton>
      <Icon icon="comment-1" />
      {__("Comments")}
    </TriggerButton>
  );

  return (
    <ModalTrigger
      title="Comments"
      size="lg"
      trigger={trigger}
      content={renderContent}
    />
  );
};

export default Container;
