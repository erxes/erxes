import React, { Component } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { IReactions } from "../../../../../types";
import { LeftAlign, Reaction } from "./styles";

type Props = {
  reactions: IReactions;
  comment?: boolean;
};

class Reactions extends Component<Props, {}> {
  renderUsers(users) {
    return users.map((user, index) => (
      <LeftAlign key={index}>{user.name}</LeftAlign>
    ));
  }

  renderReaction(key, users) {
    const tooltip = (
      <Tooltip id="tooltip">
        <LeftAlign>
          <b>{key}</b>
        </LeftAlign>
        {this.renderUsers(users)}
      </Tooltip>
    );

    if (!(users.length > 0)) {
      return null;
    }

    return (
      <OverlayTrigger key={key} placement="top" overlay={tooltip}>
        <Reaction className={key} comment={this.props.comment} />
      </OverlayTrigger>
    );
  }

  render() {
    const { reactions } = this.props;

    return Object.keys(reactions).map(key =>
      this.renderReaction(key, reactions[key])
    );
  }
}

export default Reactions;
