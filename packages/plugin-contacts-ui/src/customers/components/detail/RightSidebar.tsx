import { __, loadDynamicComponent } from "coreui/utils";
import { isEnabled, renderFullName } from "@erxes/ui/src/utils/core";

import Box from "@erxes/ui/src/components/Box";
import CompanySection from "@erxes/ui-contacts/src/companies/components/CompanySection";
import EmptyState from "@erxes/ui/src/components/EmptyState";
import { ICustomer } from "../../types";
import Icon from "@erxes/ui/src/components/Icon";
import { List } from "../../../companies/styles";
import PortabelPurchases from "@erxes/ui-purchases/src/purchases/components/PortablePurchases";
import PortableDeals from "@erxes/ui-sales/src/deals/components/PortableDeals";
import PortableTasks from "@erxes/ui-tasks/src/tasks/components/PortableTasks";
import PortableTickets from "@erxes/ui-tickets/src/tickets/components/PortableTickets";
import React from "react";
import Sidebar from "@erxes/ui/src/layout/components/Sidebar";
import Tip from "@erxes/ui/src/components/Tip";
import colors from "@erxes/ui/src/styles/colors";

type Props = {
  customer: ICustomer;
};

export default class RightSidebar extends React.Component<Props> {
  renderContent() {
    const { customer } = this.props;
    const { integration, visitorContactInfo } = customer;

    if (!integration && !visitorContactInfo) {
      return <EmptyState icon="folder-2" text="Empty" size="small" />;
    }

    let integrationNode: React.ReactNode = null;
    let icon: string = "check-1";
    let color: string = colors.colorCoreGreen;
    let text: string = __("Active");

    if (integration && integration.name) {
      if (!integration.isActive) {
        icon = "archive-alt";
        color = colors.colorPrimary;
        text = __("Inactive");
      }

      integrationNode = (
        <li>
          <div>{__("Integration")}:</div>
          {integration.name}
          <Tip text={text}>
            <Icon icon={icon} color={color} />
          </Tip>
        </li>
      );
    }

    return (
      <List>
        {integrationNode}
        {visitorContactInfo && (
          <li>
            <div>{__("Visitor contact info")}:</div>
            <span>{visitorContactInfo.email || visitorContactInfo.phone}</span>
          </li>
        )}
      </List>
    );
  }

  renderOther() {
    return (
      <Box title={__("Other")} name="showOthers">
        {this.renderContent()}
      </Box>
    );
  }

  render() {
    const { customer } = this.props;

    const mainTypeName = renderFullName(customer);

    return (
      <Sidebar>
        <CompanySection mainType="customer" mainTypeId={customer._id} />
        {isEnabled("tickets") && (
          <>
            <PortableTickets
              mainType="customer"
              mainTypeId={customer._id}
              mainTypeName={mainTypeName}
            />
          </>
        )}

        {isEnabled("tasks") && (
          <>
            <PortableTasks
              mainType="customer"
              mainTypeId={customer._id}
              mainTypeName={mainTypeName}
            />
          </>
        )}

        {isEnabled("sales") && (
          <>
            <PortableDeals
              mainType="customer"
              mainTypeId={customer._id}
              mainTypeName={mainTypeName}
            />
          </>
        )}

        {isEnabled("purchases") && (
          <>
            <PortabelPurchases
              mainType="customer"
              mainTypeId={customer._id}
              mainTypeName={mainTypeName}
            />
          </>
        )}

        {loadDynamicComponent(
          "customerRightSidebarSection",
          { mainType: "customer", id: customer._id },
          true
        )}

        {this.renderOther()}
      </Sidebar>
    );
  }
}
