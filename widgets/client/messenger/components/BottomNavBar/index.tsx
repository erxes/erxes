import * as React from "react";

import {
  IconChat,
  IconHome,
  IconPhone,
  IconQuestionMark,
  IconTicket,
} from "./Icons";

import Item from "./Item";
import { useRouter } from "../../context/Router";

const items = [
  {
    label: "Home",
    icon: IconHome,
    route: "home",
  },
  { icon: IconChat, route: "allConversations" },
  { icon: IconPhone, route: "call" },
  // { icon: IconTicket, route: 'ticket' },
  {
    label: "Help",
    icon: IconQuestionMark,
    route: "faqCategories",
    additionalRoutes: ["faqCategory", "faqArticle"],
  },
];

function BottomNavBar() {
  const { setActiveRoute, activeRoute } = useRouter();

  const handleItemClick = (route: string) => (e: React.MouseEvent) => {
    setActiveRoute(route);
  };

  const isItemActive = (item: {
    route: string;
    additionalRoutes?: string[];
  }) => {
    const { route, additionalRoutes } = item;
    if (additionalRoutes) {
      return additionalRoutes.includes(activeRoute) || activeRoute === route;
    }
    return activeRoute === route;
  };

  return (
    <ul className="nav-container nav-list">
      {items.map((item) => {
        const { route } = item;

        return (
          <Item
            key={route}
            isActive={isItemActive(item)}
            handleClick={handleItemClick}
            {...item}
          />
        );
      })}
    </ul>
  );
}

export default BottomNavBar;
