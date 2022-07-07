import * as React from "react";
import { IUser } from "../../types";
import asyncComponent from "../../AsyncComponent";

const ConversationDetail = asyncComponent(() => 
  import(/* webpackChunkName: "MessengerConversationDetail" */ "../containers/ConversationDetail")
);

const AccquireInformation = asyncComponent(() => 
  import(/* webpackChunkName: "MessengerAcquireInformation" */ "../containers/AccquireInformation")
);

const Home = asyncComponent(() => 
  import(/* webpackChunkName: "MessengerHome" */ "../containers/Home")
);

const ConversationList = asyncComponent(() => 
  import(/* webpackChunkName: "MessengerConversationList" */ "../containers/ConversationList")
);

const ArticleDetail = asyncComponent(() =>
  import(
    /* webpackChunkName: "MessengerArticleDetail" */ '../containers/faq/ArticleDetail'
  )
);

const CategoryDetail = asyncComponent(() =>
  import(
    /* webpackChunkName: "MessengerCategoryDetail" */ '../containers/faq/CategoryDetail'
  )
);

const WebsiteAppDetail = asyncComponent(() =>
  import(
    /* webpackChunkName: "MessengerWebsiteDetail" */ '../containers/websiteApp/WebsiteAppDetail'
  )
);

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
