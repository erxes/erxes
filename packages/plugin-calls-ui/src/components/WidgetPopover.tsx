import React, { useState } from "react";
import { Tab, TabContent, TabsContainer, TabsWrapper } from "../styles";

import ContactsContainer from "../containers/Contacts";
import HistoryContainer from "../containers/History";
import { ICallConfigDoc } from "../types";
import { Icon } from "@erxes/ui/src/components";
import KeyPadContainer from "../containers/KeyPad";
import { __ } from "@erxes/ui/src/utils";
import { callPropType } from "../lib/types";
import { extractPhoneNumberFromCounterpart } from "../utils";

type Props = {
  autoOpenTab: string;
  callUserIntegrations?: ICallConfigDoc[];
  setConfig?: any;
  currentCallConversationId: string;
};

const WidgetPopover = (
  {
    autoOpenTab,
    callUserIntegrations,
    setConfig,
    currentCallConversationId,
  }: Props,
  context
) => {
  const phone = extractPhoneNumberFromCounterpart(context?.call?.counterpart);
  const [currentTab, setCurrentTab] = useState(autoOpenTab || "Keyboard");
  const [phoneNumber, setPhoneNumber] = useState(phone || "");

  const onTabClick = (newTab) => {
    setCurrentTab(newTab);
  };

  const changeTab = (number, tab) => {
    setCurrentTab(tab);
    setPhoneNumber(number);
  };

  const historyOnClick = () => {
    onTabClick("History");
  };

  const keyboardOnClick = () => {
    onTabClick("Keyboard");
  };

  const contactsOnClick = () => {
    onTabClick("Contact");
  };

  const renderContent = () => {
    if (currentTab === "History") {
      return (
        <HistoryContainer
          changeMainTab={changeTab}
          callUserIntegrations={callUserIntegrations}
        />
      );
    }

    if (currentTab === "Contact") {
      return <ContactsContainer changeMainTab={changeTab} />;
    }

    return (
      <KeyPadContainer
        callUserIntegrations={callUserIntegrations}
        setConfig={setConfig}
        phoneNumber={phoneNumber}
        currentCallConversationId={currentCallConversationId}
      />
    );
  };
  if (context?.call?.direction === "callDirection/INCOMING") {
    return;
  }
  return (
    <>
      <TabContent>{renderContent()}</TabContent>
      <TabsWrapper>
        <TabsContainer full={true}>
          <Tab
            className={currentTab === "History" ? "active" : ""}
            onClick={historyOnClick}
          >
            <Icon icon="history" size={20} />
            {__("History")}
          </Tab>
          <Tab
            className={currentTab === "Keyboard" ? "active" : ""}
            onClick={keyboardOnClick}
          >
            <Icon icon="keyboard-alt" size={20} />
            {__("Keyboard")}
          </Tab>
          <Tab
            className={currentTab === "Contact" ? "active" : ""}
            onClick={contactsOnClick}
          >
            <Icon icon="book" size={18} />
            {__("Contact")}
          </Tab>
        </TabsContainer>
      </TabsWrapper>
    </>
  );
};

WidgetPopover.contextTypes = {
  call: callPropType,
};

export default WidgetPopover;
