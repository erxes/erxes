import {
  FieldStyle,
  SidebarCounter,
  SidebarList
} from "@erxes/ui/src/layout/styles";
import { __, router } from "coreui/utils";

import CountsByTag from "@erxes/ui/src/components/CountsByTag";
import { ITag } from "@erxes/ui-tags/src/types";
import { Link } from "react-router-dom";
import React from "react";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { isEnabled } from "@erxes/ui/src/utils/core";
import { statusFilters } from "@erxes/ui-engage/src/constants";
import { useLocation } from "react-router-dom";

const { Section } = Wrapper.Sidebar;

type Props = {
  kindCounts: any;
  statusCounts: any;
  tagCounts: any;
  tags: ITag[];
};

const Sidebar = (props: Props) => {
  const location = useLocation();
  const { statusCounts, tags, tagCounts } = props;

  const renderStatusFilter = () => {
    return (
      <Section noShadow noMargin>
        <Section.Title>{__("Status")}</Section.Title>

        <SidebarList>
          {statusFilters.map((status, index) => (
            <li key={index}>
              <Link
                tabIndex={0}
                className={
                  router.getParam(location, "status") === status.key
                    ? "active"
                    : ""
                }
                to={`/campaigns?status=${status.key}`}
              >
                <FieldStyle>{__(status.value)}</FieldStyle>
                <SidebarCounter>{statusCounts[status.key]}</SidebarCounter>
              </Link>
            </li>
          ))}
        </SidebarList>
      </Section>
    );
  };

  return (
    <Wrapper.Sidebar hasBorder={true}>
      {renderStatusFilter()}

      <CountsByTag
        tags={tags}
        manageUrl="/settings/tags?type=engages:engageMessage"
        counts={tagCounts}
        loading={false}
      />
    </Wrapper.Sidebar>
  );
};

export default Sidebar;
