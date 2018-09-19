import { Icon } from "modules/common/components";
import { CompanyAssociate } from "modules/companies/containers";
import {
  DevicePropertiesSection,
  MessengerSection,
  TaggerSection
} from "modules/customers/components/common";
import { PortableDeals } from "modules/deals/containers";
import { Sidebar } from "modules/layout/components";
import { SidebarToggle } from "modules/layout/styles";
import * as React from "react";
import { SectionContainer } from "./styles";

import {
  BasicInfoSection,
  CustomFieldsSection
} from "modules/customers/containers/common";

import { __ } from "modules/common/utils";
import { ICustomer } from "modules/customers/types";
import { IConversation } from "../../../types";
import ConversationDetails from "./ConversationDetails";

type BoxProps = {
  title: string;
  name: string;
  children: JSX.Element;
  isOpen: boolean;
  toggle: (params: { name: string; isOpen: boolean }) => void;
};

type BoxState = {
  isOpen: boolean;
};

class Box extends React.Component<BoxProps, BoxState> {
  constructor(props: BoxProps) {
    super(props);

    this.state = {
      isOpen: props.isOpen
    };

    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    const { name, toggle } = this.props;
    const { isOpen } = this.state;

    this.setState({ isOpen: !isOpen });

    toggle({ name, isOpen: !isOpen });
  }

  renderDropBtn() {
    const icon = this.state.isOpen ? "uparrow-2" : "downarrow";

    return (
      <SidebarToggle inverse={!this.state.isOpen} onClick={this.toggle}>
        <Icon icon={icon} />
      </SidebarToggle>
    );
  }

  render() {
    const { Section } = Sidebar;
    const { Title } = Section;

    const { isOpen } = this.state;
    const { children, title } = this.props;

    if (!isOpen) {
      return (
        <SectionContainer>
          <Title>{title}</Title>
          {this.renderDropBtn()}
        </SectionContainer>
      );
    }

    return (
      <SectionContainer>
        {children}
        {this.renderDropBtn()}
      </SectionContainer>
    );
  }
}

type IndexProps = {
  conversation: IConversation;
  customer: ICustomer;
  toggleSection: (params: { name: string; isOpen: boolean }) => void;
  config: any;
  taggerRefetchQueries: any;
};

class Index extends React.Component<IndexProps> {
  renderMessengerData({
    customer,
    kind,
    __,
    config,
    toggleSection
  }: {
    customer: ICustomer;
    kind: string;
    __: (string) => any;
    config: any;
    toggleSection: (params: { name: string; isOpen: boolean }) => void;
  }) {
    if (kind !== "messenger") {
      return null;
    }

    return (
      <Box
        title={__("Messenger data")}
        name="showMessengerData"
        isOpen={config.showMessengerData || false}
        toggle={toggleSection}
      >
        <MessengerSection customer={customer} />
      </Box>
    );
  }

  renderDeviceProperties({ customer, kind, __, config, toggleSection }) {
    if (!(kind === "messenger" || kind === "form")) {
      return null;
    }

    return (
      <Box
        title={__("Device properties")}
        name="showDeviceProperties"
        isOpen={config.showDeviceProperties || false}
        toggle={toggleSection}
      >
        <DevicePropertiesSection customer={customer} />
      </Box>
    );
  }

  render() {
    const {
      taggerRefetchQueries,
      conversation,
      customer,
      toggleSection,
      config
    } = this.props;

    const { kind = "" } = customer.integration || {};

    return (
      <Sidebar>
        <Box
          title={__("Profile").toString()}
          name="showProfile"
          isOpen={config.showProfile || false}
          toggle={toggleSection}
        >
          <BasicInfoSection customer={customer} />
        </Box>

        <Box
          title={__("Conversation details").toString()}
          name="showConversationDetails"
          isOpen={config.showConversationDetails || false}
          toggle={toggleSection}
        >
          <ConversationDetails conversation={conversation} />
        </Box>

        {this.renderMessengerData({
          customer,
          kind,
          __,
          config,
          toggleSection
        })}
        {this.renderDeviceProperties({
          customer,
          kind,
          __,
          config,
          toggleSection
        })}

        <Box
          title={__("Contact information").toString()}
          name="showCustomFields"
          isOpen={config.showCustomFields || false}
          toggle={toggleSection}
        >
          <CustomFieldsSection customer={customer} />
        </Box>

        <Box
          title={__("Tags").toString()}
          name="showTags"
          isOpen={config.showTags || false}
          toggle={toggleSection}
        >
          <TaggerSection
            data={customer}
            type="customer"
            refetchQueries={taggerRefetchQueries}
          />
        </Box>

        <Box
          title={__("Companies").toString()}
          name="showCompanies"
          isOpen={config.showCompanies || false}
          toggle={toggleSection}
        >
          <CompanyAssociate data={customer} />
        </Box>

        <Box
          title={__("Deals").toString()}
          name="showDeals"
          isOpen={config.showDeals || false}
          toggle={toggleSection}
        >
          <PortableDeals customerId={customer._id} />
        </Box>
      </Sidebar>
    );
  }
}

export default Index;
