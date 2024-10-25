import { ActionButtons } from "@erxes/ui-settings/src/styles";
import BoardForm from "./BoardForm";
import { BoardItem } from "@erxes/ui-sales/src/settings/boards/styles";
import Button from "@erxes/ui/src/components/Button";
import { IBoard } from "@erxes/ui-sales/src/boards/types";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import Icon from "@erxes/ui/src/components/Icon";
import { Link } from "react-router-dom";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import React from "react";
import Tip from "@erxes/ui/src/components/Tip";
import SaveTemplate from "@erxes/ui-template/src/components/SaveTemplate";

type Props = {
  type: string;
  board: IBoard;
  remove: (boardId: string) => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  isActive: boolean;
};

class BoardRow extends React.Component<Props, {}> {
  private size;

  remove = () => {
    const { board } = this.props;

    this.props.remove(board._id);
  };

  renderEditAction() {
    const { board, renderButton, type } = this.props;

    const editTrigger = (
      <Button btnStyle="link">
        <Icon icon="edit" />
      </Button>
    );

    const content = props => (
      <BoardForm
        {...props}
        board={board}
        renderButton={renderButton}
        type={type}
      />
    );

    return (
      <ModalTrigger
        size={this.size}
        title="Edit"
        trigger={editTrigger}
        tipText="Edit"
        content={content}
      />
    );
  }

  renderTemplateModal() {
    const { board } = this.props;

    const {
      ...boardContent
    } = board

    const content = {
      content: JSON.stringify(boardContent),
      contentType: 'boards',
      serviceName: 'sales'
    };

    return <SaveTemplate as="icon" {...content} />;
  }

  render() {
    const { board, isActive } = this.props;

    return (
      <BoardItem key={board._id} $isActive={isActive} $withOverflow={true}>
        <Link to={`?boardId=${board._id}`}>{board.name}</Link>
        <ActionButtons>
          {this.renderEditAction()}
          {this.renderTemplateModal()}
          <Tip text="Delete" placement="bottom">
            <Button btnStyle="link" onClick={this.remove} icon="cancel-1" />
          </Tip>
        </ActionButtons>
      </BoardItem>
    );
  }
}

export default BoardRow;
