import { AdditionalDetail, CallDetail, CallHistory } from "../styles";
import React, { useState } from "react";
import { TabTitle, Tabs } from "@erxes/ui/src/components/tabs";

import Dropdown from "react-bootstrap/Dropdown";
import DropdownToggle from "@erxes/ui/src/components/DropdownToggle";
import { EmptyState } from "@erxes/ui/src/components";
import { IHistory } from "../types";
import Icon from "@erxes/ui/src/components/Icon";
import NameCard from "@erxes/ui/src/components/nameCard/NameCard";
import { __ } from "@erxes/ui/src/utils";

type Props = {
  histories: IHistory[];
  changeMainTab: (phoneNumber: string, shiftTab: string) => void;
  refetch: ({ callStatus }: { callStatus: string }) => void;
  remove: (_id: string) => void;
};

const History: React.FC<Props> = (props) => {
  const [currentTab, setCurrentTab] = useState("All");

  const onTabClick = (currentTab: string) => {
    setCurrentTab(currentTab);

    if (currentTab === "Missed Call") {
      props.refetch({ callStatus: "missed" });
    } else {
      props.refetch({ callStatus: "all" });
    }
  };

  const onCall = (phoneNumber) => {
    props.changeMainTab(phoneNumber, "Keyboard");
  };

  const onRemove = (_id) => {
    props.remove(_id);
  };

  const renderCalls = () => {
    if (!props.histories || props.histories.length === 0) {
      return <EmptyState icon="ban" text="There is no history" size="small" />;
    }

    return props.histories.map((item, i) => {
      const secondLine =
        item.customer !== null ? item.customer.primaryPhone : "unknown user";
      const content = (
        <CallDetail isMissedCall={false} key={i}>
          <NameCard
            user={item.customer}
            key={i}
            avatarSize={40}
            secondLine={secondLine}
          />
          <AdditionalDetail>
            <Dropdown>
              <Dropdown.Toggle as={DropdownToggle} id="dropdown-convert-to">
                <Icon icon="ellipsis-v" size={18} />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <li
                  key="call"
                  onClick={() => onCall(item.customer?.primaryPhone)}
                >
                  <Icon icon="outgoing-call" /> {__("Call")}
                </li>
                <li key="delete" onClick={() => onRemove(item._id)}>
                  <Icon icon="trash-alt" size={14} /> {__("Delete")}
                </li>
              </Dropdown.Menu>
            </Dropdown>
          </AdditionalDetail>
        </CallDetail>
      );

      return content;
    });
  };

  return (
    <>
      <Tabs $full={true}>
        <TabTitle
          className={currentTab === "All" ? "active" : ""}
          onClick={() => onTabClick("All")}
        >
          {__("All")}
        </TabTitle>
        <TabTitle
          className={currentTab === "Missed Call" ? "active" : ""}
          onClick={() => onTabClick("Missed Call")}
        >
          {__("Missed Call")}
        </TabTitle>
      </Tabs>
      <CallHistory>
        <h4>{__("Recents")}</h4>
        {renderCalls()}
      </CallHistory>
    </>
  );
};

export default History;
