import React from "react";
import Button from "@erxes/ui/src/components/Button";
import Icon from "@erxes/ui/src/components/Icon";
import { __, readFile, renderFullName } from "coreui/utils";
import {
  SpaceFormsWrapper,
  CommentWrapper,
  TicketComment,
  CreatedUser,
  CommentContent,
} from "@erxes/ui-settings/src/styles";
import { ColorButton } from "../../boards/styles/common";
import dayjs from "dayjs";
import { IUser } from "@erxes/ui/src/auth/types";
import { IClientPortalComment, ICommentCreatedUser, IWidgetsComment } from "../types";
import Dialog from "@erxes/ui/src/components/Dialog";
import { ModalFooter } from "@erxes/ui/src/styles/main";
import {
  Toggle,
} from '@erxes/ui/src';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import ControlLabel from "@erxes/ui/src/components/form/Label";
import { TabTitle, Tabs } from '@erxes/ui/src/components/tabs';

type Props = {
  currentUser: IUser;
  widgetsComments: IWidgetsComment[]; 
  clientPortalComments: IClientPortalComment[];
  remove: (_id: string) => void;

};
type State = {
  show: boolean;
  currentTab: string;
};
class Comment extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      currentTab: 'clientPortal',
      show: false,
    };
  }

  handleClose = () => this.setState({ show: false });
  handleShow = () => this.setState({ show: true });
  tabOnClick = (tab) => this.setState({ currentTab: tab });


  render() {
    const { currentUser, remove, } = this.props;
    const { show, } = this.state;

  const renderComment = (comment) => {
    const createdUser = comment.createdUser || comment.createdCustomer || {};
    const isCurrentUser = createdUser._id === currentUser._id;
  
    return (
      <TicketComment key={comment._id}>
        <CreatedUser>
          <img
            src={readFile(createdUser.avatar || "/images/avatar-colored.svg")}
            alt="profile"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/images/avatar-colored.svg";
            }}
          />
          <div>
            <CommentContent>
              <h5>
                {createdUser.fullName || 
                 `${createdUser.firstName || ''} ${createdUser.lastName || ''}`}
              </h5>
              <div
                className="comment"
                dangerouslySetInnerHTML={{ __html: comment.content }}
              />
            </CommentContent>
            <span>
              Created at {dayjs(comment.createdAt).format("YYYY-MM-DD HH:mm")}
            </span>
          </div>
          {isCurrentUser && (
            <div className="actions">
              <button 
                type="button"
                onClick={() => remove(comment._id)}
                aria-label="Delete comment"
              >
                Delete
              </button>
            </div>
          )}
        </CreatedUser>
      </TicketComment>
    );
  };

 const renderCommentsList = () => {
    const { currentTab } = this.state;
    const { clientPortalComments, widgetsComments } = this.props;

    const comments = currentTab === 'clientPortal' 
      ? clientPortalComments 
      : widgetsComments;

    return comments.length === 0 ? (
      <EmptyState text="No comments available" icon="info-circle"/>
    ) : (
      comments.map(renderComment)
    );
  };
    return (
      <>
        <ColorButton onClick={this.handleShow}>
          <Icon icon="comment-alt-message" />
          {__("Comment")}
        </ColorButton>

        <Dialog
          show={show}
          closeModal={this.handleClose}
          title={__("Comments")}
        >
         
      <Tabs full={true}>
        <TabTitle
          className={this.state.currentTab === "clientPortal" ? "active" : ""}
          onClick={this.tabOnClick.bind(this, "clientPortal")}
        >
          {__("Client Portal")}
        </TabTitle>
        <TabTitle
          className={this.state.currentTab === "widget" ? "active" : ""}
          onClick={this.tabOnClick.bind(this, "widget")}
        >
          {__("Widgets")}
        </TabTitle>
      </Tabs>         
      <SpaceFormsWrapper>
           <CommentWrapper>
            {renderCommentsList()}
          </CommentWrapper>
        </SpaceFormsWrapper>
          <ModalFooter>
            <Button
              btnStyle="simple"
              size="small"
              icon="times-circle"
              onClick={this.handleClose}
            >
              {__("Cancel")}
            </Button>
          </ModalFooter>
        </Dialog>
      </>
    );
  }
}

export default Comment;
