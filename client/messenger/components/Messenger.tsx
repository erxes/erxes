import * as React from "react";
import { IUser } from "../../types";
import { AccquireInformation, ConversationDetail, Home } from "../containers";

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
    case "conversationCreate":
      return WithSupporters(ConversationDetail);

    // get user's contact information
    case "accquireInformation":
      return <AccquireInformation />;

    default:
      return WithSupporters(Home);
  }
}

export default Messenger;
