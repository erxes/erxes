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
  const WithSupporters = (Component: any) => {
    return <Component supporters={supporters} loading={loading} />;
  };

  switch (activeRoute) {
    case "conversationDetail":
      return WithSupporters(ConversationDetail);

    case "conversationCreate":
      return WithSupporters(ConversationCreate);

    case "conversationList":
      return WithSupporters(Home);

    // get user's contact information
    case "accquireInformation":
      return <AccquireInformation />;

    default:
      return <div />;
  }
}

export default Messenger;
