import { __ } from "modules/common/utils";
import LeftSidebar from "modules/layout/components/Sidebar";
import { SidebarList as List } from "modules/layout/styles";
import React from "react";
import { Link } from "react-router-dom";
import SidebarHeader from "@erxes/ui-settings/src/common/components/SidebarHeader";

type Props = {
  currentType?: string;
  services: any[];
};

class Sidebar extends React.Component<Props> {
  renderSidebarHeader = () => {
    const { Header } = LeftSidebar;

    return (
      <div>
        <SidebarHeader />
        <Header uppercase={true}>{__("Filter by content type")}</Header>
      </div>
    );
  };

  renderListItem(service) {
    const className =
      this.props.currentType && this.props.currentType === service.contentType
        ? "active"
        : "";

    return (
      <li>
        <Link
          to={`?type=${service.contentType}&serviceType=${service.serviceType}`}
          className={className}
        >
          {__(service.text)}
        </Link>
      </li>
    );
  }

  render() {
    return (
      <LeftSidebar header={this.renderSidebarHeader()} full={true}>
        <LeftSidebar.Section>
          <List id={"ImportExportSidebar"}>
            {this.props.services.map((service) => this.renderListItem(service))}
          </List>
        </LeftSidebar.Section>
      </LeftSidebar>
    );
  }
}

export default Sidebar;
