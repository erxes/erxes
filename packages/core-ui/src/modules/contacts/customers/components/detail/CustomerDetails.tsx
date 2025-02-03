import {
  DevicePropertiesSection,
  TaggerSection,
  TrackedDataSection,
} from "../common";
import { LeftSide, RightSide, VerticalRightSidebar } from "../../styles";
import { TabTitle, Tabs } from "@erxes/ui/src/components/tabs";
import { __, renderFullName } from "coreui/utils";
import { isEnabled, loadDynamicComponent } from "@erxes/ui/src/utils/core";

import ActionSection from "@erxes/ui-contacts/src/customers/containers/ActionSection";
import ActivityInputs from "@erxes/ui-log/src/activityLogs/components/ActivityInputs";
import ActivityLogs from "@erxes/ui-log/src/activityLogs/containers/ActivityLogs";
import BasicInfoSection from "../common/BasicInfoSection";
import CollapseSidebar from "modules/common/components/CollapseSidebar";
import CustomFieldsSection from "@erxes/ui-contacts/src/customers/containers/CustomFieldsSection";
import EmailWidget from "@erxes/ui-inbox/src/inbox/components/EmailWidget";
import { ICustomer } from "../../types";
import { IField } from "@erxes/ui/src/types";
import { IFieldsVisibility } from "@erxes/ui-contacts/src/customers/types";
import Icon from "@erxes/ui/src/components/Icon";
import InfoSection from "@erxes/ui-contacts/src/customers/components/common/InfoSection";
import LeadState from "@erxes/ui-contacts/src/customers/containers/LeadState";
import PrintAction from "@erxes/ui-contacts/src/customers/components/common/PrintAction";
import React from "react";
import RightSidebar from "./RightSidebar";
import { UserHeader } from "@erxes/ui-contacts/src/customers/styles";
import WebsiteActivity from "@erxes/ui-contacts/src/customers/components/common/WebsiteActivity";
import Widget from "@erxes/ui-engage/src/containers/Widget";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";

type Props = {
  customer: ICustomer;
  fieldsVisibility: (key: string) => IFieldsVisibility;
  deviceFields: IField[];
  fields: IField[];
  taggerRefetchQueries?: any[];
  deviceFieldsVisibility: (key: string) => IFieldsVisibility;
};

class CustomerDetails extends React.Component<
  Props,
  { currentTab: string; isLeftSidebarCollapsed: boolean }
> {
  constructor(props) {
    super(props);

    this.state = {
      currentTab: "detail",
      isLeftSidebarCollapsed: true,
    };
  }

  renderEmailTab = () => {
    const { customer } = this.props;

    if (!customer.primaryEmail || customer.emailValidationStatus !== "valid") {
      return null;
    }

    return (
      (isEnabled("engages") || isEnabled("imap")) && (
        <EmailWidget
          buttonStyle="link"
          emailTo={customer.primaryEmail}
          buttonText={__("New email")}
          type="tab"
        />
      )
    );
  };

  renderExtraTabs = () => {
    const triggerMessenger = (
      <>
        <Icon icon="comment-plus" /> {__("New message")}
      </>
    );

    if (isEnabled("engages")) {
      return (
        <TabTitle>
          <Widget
            customers={[this.props.customer]}
            modalTrigger={triggerMessenger}
            channelType="messenger"
            forceCreateConversation={true}
          />
          {this.renderEmailTab()}
        </TabTitle>
      );
    }

    return null;
  };

  onCollapseSidebar = (isLeftSidebarCollapsed: boolean) => {
    this.setState({ isLeftSidebarCollapsed });
  };

  tabOnClick = (currentTab: string) => {
    this.setState({ currentTab, isLeftSidebarCollapsed: true });
  };

  renderTabContent = () => {
    const { currentTab } = this.state;
    const {
      customer,
      deviceFields,
      taggerRefetchQueries,
      deviceFieldsVisibility,
    } = this.props;

    switch (currentTab) {
      case "related":
        return <RightSidebar customer={customer} />;
      case "detail":
        return (
          <>
            <TaggerSection
              data={customer}
              type="core:customer"
              refetchQueries={taggerRefetchQueries}
            />
            <DevicePropertiesSection
              customer={customer}
              fields={deviceFields}
              deviceFieldsVisibility={deviceFieldsVisibility}
              isDetail={true}
            />
            <TrackedDataSection customer={customer} />
            <WebsiteActivity urlVisits={customer.urlVisits || []} />
          </>
        );
      case "activity":
        return (
          <>
            <ActivityLogs
              target={customer.firstName}
              contentId={customer._id}
              contentType="core:customer"
              extraTabs={[
                { name: "inbox:conversation", label: "Conversation" },
                { name: "imap:email", label: "Email" },
                { name: "tasks:task", label: "Task" },
                // { name: 'sms', label: 'SMS' },
                { name: "engages:campaign", label: "Campaign" },
              ]}
            />
          </>
        );
      default:
        return null;
    }
  };

  renderLeftSidebar = () => {
    const { customer } = this.props;

    return (
      <CollapseSidebar
        title={__("Properties")}
        onToggle={this.onCollapseSidebar}
        isCollapsed={this.state.isLeftSidebarCollapsed}
      >
        <CustomFieldsSection customer={customer} isDetail={false} />

        {loadDynamicComponent(
          "customerRightSidebarSection",
          { mainType: "customer", id: customer._id },
          true
        )}
      </CollapseSidebar>
    );
  };

  renderRightSidebar = () => {
    const { currentTab, isLeftSidebarCollapsed } = this.state;

    return (
      <VerticalRightSidebar>
        {isLeftSidebarCollapsed && (
          <LeftSide>{this.renderTabContent()}</LeftSide>
        )}
        <RightSide>
          <Tabs direction="vertical">
            <TabTitle
              direction="vertical"
              className={currentTab === "detail" ? "active" : ""}
              onClick={this.tabOnClick.bind(this, "detail")}
            >
              <Icon size={16} icon={"file-info-alt"} />
              {__("Detail")}
            </TabTitle>
            <TabTitle
              direction="vertical"
              className={currentTab === "related" ? "active" : ""}
              onClick={this.tabOnClick.bind(this, "related")}
            >
              <Icon size={16} icon={"settings"} />
              {__("Related")}
            </TabTitle>
            <TabTitle
              direction="vertical"
              className={currentTab === "activity" ? "active" : ""}
              onClick={this.tabOnClick.bind(this, "activity")}
            >
              <Icon size={16} icon={"graph-bar"} />
              {__("Activity")}
            </TabTitle>
          </Tabs>
        </RightSide>
      </VerticalRightSidebar>
    );
  };

  render() {
    const { customer, fields, fieldsVisibility } = this.props;

    const breadcrumb = [
      { title: __("Contacts"), link: "/contacts" },
      { title: renderFullName(customer) },
    ];

    const content = (
      <>
        <UserHeader>
          <InfoSection avatarSize={40} customer={customer}>
            {isEnabled("documents") && (
              <PrintAction coc={customer} contentType="core:customer" />
            )}
            <ActionSection customer={customer} />
          </InfoSection>
          <LeadState customer={customer} />
        </UserHeader>
        <BasicInfoSection
          customer={customer}
          fieldsVisibility={fieldsVisibility}
          fields={fields}
        />
        <ActivityInputs
          contentTypeId={customer._id}
          contentType="core:customer"
          toEmail={customer.primaryEmail}
          showEmail={false}
          extraTabs={this.renderExtraTabs()}
        />
      </>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={renderFullName(customer)}
            breadcrumb={breadcrumb}
          />
        }
        leftSidebar={this.renderLeftSidebar()}
        rightSidebar={this.renderRightSidebar()}
        content={content}
        transparent={true}
      />
    );
  }
}

export default CustomerDetails;
