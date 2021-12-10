import * as React from "react";
import { IUser } from "../../types";
import { AccquireInformation, ConversationDetail, Home, ConversationList} from "../containers";
import { ArticleDetail, CategoryDetail } from "../containers/faq";
import WebsiteAppDetail from "../containers/websiteApp/WebsiteAppDetail";

type Props = {
  activeRoute: string | "";
  supporters: IUser[];
  loading?: boolean;
  isOnline?: boolean;
  serverTime?: string;
};

function Messenger({
  activeRoute,
  isOnline = false,
  supporters,
  loading,
  serverTime,
}: Props) {
  const WithSupporters = (Component: any) => {
    return (
      <Component
        supporters={supporters}
        loading={loading}
        isOnline={isOnline}
        serverTime={serverTime}
      />
    );
  };

  switch (activeRoute) {
    case "allConversations":
      return <ConversationList />;
    case "conversationDetail":
    case "conversationCreate":
      return WithSupporters(ConversationDetail);

    // get user's contact information
    case "accquireInformation":
      return <AccquireInformation />;

    case "faqCategory":
      return <CategoryDetail />;

    case "faqArticle":
      return <ArticleDetail />;

    case "websiteApp":
      return <WebsiteAppDetail />;

    case "faqCategories":
      return (
        <Home
          supporters={supporters}
          isOnline={isOnline}
          serverTime={serverTime}
          activeSupport={true}
        />
      );

    default:
      return WithSupporters(Home);
  }
}

export default Messenger;
