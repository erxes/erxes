import { Tip } from "modules/common/components";
import moment from "moment";
import * as React from "react";
import { IMessageDocument } from "../../../../../types";

type Props = {
  message: IMessageDocument;
};

export default class Date extends React.Component<Props, {}> {
  render() {
    const { message } = this.props;

    return (
      <Tip placement="bottom" text={moment(message.createdAt).format("lll")}>
        <a href={`https://facebook.com/statuses/`} target="_blank">
          {moment(message.createdAt).fromNow()}
        </a>
      </Tip>
    );
  }
}
