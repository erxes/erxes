import ActivityInputs from "@erxes/ui/src/activityLogs/components/ActivityInputs";
import ActivityLogs from "@erxes/ui/src/activityLogs/containers/ActivityLogs";
import Icon from "@erxes/ui/src/components/Icon";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import { TabTitle } from "@erxes/ui/src/components/tabs";
import { __ } from "@erxes/ui/src/utils";
import ActionSection from "@erxes/ui-contacts/src/customers/containers/ActionSection";
import LeadState from "@erxes/ui-contacts/src/customers/containers/LeadState";
import { MailBox, UserHeader } from "@erxes/ui-contacts/src/customers/styles";
// import Widget from "@erxes/ui-engage/src/containers/Widget";
import Wrapper from "./Wrapper";
// import MailForm from "@erxes/ui-settings/src/integrations/containers/mail/MailForm";
// import { IField } from "@erxes/ui/src/types";
import React from "react";
// import { ICustomer } from "../../types";
// import InfoSection from "@erxes/ui-contacts/src/customers/components/common/InfoSection";
// import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
// import { isEnabled } from "@erxes/ui/src/utils/core";
import BreadCrumb from '@erxes/ui/src/components/breadcrumb/BreadCrumb';

type Props = {
  // customer: ICustomer;
  // fields?: IField[];
  // deviceFields?: IField[];
  taggerRefetchQueries?: any[];
};

class PluginDetails extends React.Component<Props> {
  // renderEmailTab = () => {
  //   // const { customer } = this.props;

  //   if (!customer.primaryEmail) {
  //     return null;
  //   }

  //   const triggerEmail = (
  //     <TabTitle>
  //       <Icon icon="envelope-add" /> {__("New email")}
  //     </TabTitle>
  //   );

  //   const content = (props) => (
  //     <MailBox>
  //       <MailForm
  //         fromEmail={customer.primaryEmail}
  //         refetchQueries={["activityLogsCustomer"]}
  //         closeModal={props.closeModal}
  //       />
  //     </MailBox>
  //   );

  //   return (
  //     <ModalTrigger
  //       dialogClassName="middle"
  //       title="Email"
  //       trigger={triggerEmail}
  //       size="xl"
  //       content={content}
  //       paddingContent="less-padding"
  //       enforceFocus={false}
  //     />
  //   );
  // };

  // renderExtraTabs = () => {
  //   const triggerMessenger = (
  //     <TabTitle>
  //       <Icon icon="comment-plus" /> {__("New message")}
  //     </TabTitle>
  //   );

  //   if (isEnabled("engages")) {
  //     return (
  //       <>
  //         <Widget
  //           customers={[this.props.customer]}
  //           modalTrigger={triggerMessenger}
  //           channelType="messenger"
  //         />
  //         {this.renderEmailTab()}
  //       </>
  //     );
  //   }

  //   return null;
  // };

  renderRightSidebar() {
    return (
      <VerticalContent>
        <RightSidebarWrapper>{this.renderMembers()}</RightSidebarWrapper>
        <RightSidebarWrapper>{this.renderRelease()}</RightSidebarWrapper>
        <RightSidebarWrapper>{this.renderShare()}</RightSidebarWrapper>
        <RightSidebarWrapper>
          {this.renderInstalledOrganizations()}
        </RightSidebarWrapper>
        {/* <Button><b>Add to cart</b> $24</Button> */}
        <FullButton>
          <b>Add to cart</b> $24
        </FullButton>
      </VerticalContent>
    );
  }

  render() {
    // const { customer, fields, deviceFields, taggerRefetchQueries } = this.props;

    const breadcrumb = [
      { title: __("Store"), link: "/store" },
      { title: "WeeCommere Cart all in One" },
    ];

    const content = (
      <>
        {/* <ActivityInputs
          contentTypeId={customer._id}
          contentType="contacts:customer"
          toEmail={customer.primaryEmail}
          showEmail={false}
          extraTabs={this.renderExtraTabs()}
        />
        {isEnabled("logs") && (
          <ActivityLogs
            target={customer.firstName}
            contentId={customer._id}
            contentType="customer"
            extraTabs={[
              { name: "conversation", label: "Conversation" },
              { name: "email", label: "Email" },
              { name: "task", label: "Task" },
              { name: "sms", label: "SMS" },
              { name: "campaign", label: "Campaign" },
            ]}
          />
        )} */}
        <h1>hihihihih</h1>
      </>
    );

    return (
      <Wrapper
        // header={headerDescription}
        mainHead={<BreadCrumb breadcrumbs={breadcrumb}/>}
        // mainHead={
        //   // <UserHeader>
        //   //   <InfoSection nameSize={16} avatarSize={60} customer={customer}>
        //   //     <ActionSection customer={customer} />
        //   //   </InfoSection>
        //   //   <LeadState customer={customer} />
        //   // </UserHeader>
        //   <h1>jijiji</h1>
        // }
        // leftSidebar={
        //   <LeftSidebar
        //     wide={true}
        //     customer={customer}
        //     fields={fields}
        //     deviceFields={deviceFields}
        //     taggerRefetchQueries={taggerRefetchQueries}
        //   />
        // }
        rightSidebar={<RightSidebar />}
        content={content}
        // transparent={true}
      />
    );
  }
}

export default PluginDetails;
