import * as React from "react";
import { IUser } from "../../types";
import {
  AccquireInformation,
  ConversationCreate,
  ConversationDetail,
  Home
} from "../containers";

type Props = {
  activeRoute: string | "";
  supporters: IUser[];
  loading?: boolean;
};

function Messenger({ activeRoute, supporters, loading }: Props) {
  switch (activeRoute) {
    case "conversationDetail":
      return <ConversationDetail supporters={supporters} loading={loading} />;

    case "conversationCreate":
      return <ConversationCreate supporters={supporters} loading={loading} />;

    case "conversationList":
      return <Home supporters={supporters} />;

    // get user's contact information
    case "accquireInformation":
      return <AccquireInformation />;

    default:
      return <div />;
  }
}

export default Messenger;
