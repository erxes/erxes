import { Config, IUser } from "../../types";
import React, { useState } from "react";
import { duedateFilter, priorityFilter } from "../../main/constants";

import { Card } from "react-bootstrap";
import Detail from "../containers/Detail";
import Group from "../containers/Group";
import { GroupList } from "../../styles/tickets";
import TicketForm from "../containers/Form";
import TicketHeader from "./TicketHeader";
import { getConfigColor } from "../../common/utils";
import { renderUserFullName } from "../../utils";
import { useRouter } from "next/router";

type Props = {
  currentUser: IUser;
  config: Config;
  stages: any;
  pipeLinelabels: any;
  pipelineAssignedUsers: any;
};

export default function Ticket({
  currentUser,
  config,
  stages,
  pipeLinelabels,
  pipelineAssignedUsers,
}: Props) {
  const router = useRouter();
  const { itemId } = router.query as { itemId: string };

  const [mode, setMode] = useState("stage");
  const [viewType, setViewType] = useState("list");
  const [showForm, setShowForm] = useState(false);

  if (itemId) {
    return (
      <Detail
        _id={itemId}
        onClose={() => router.push("/tickets")}
        currentUser={currentUser}
        config={config}
      />
    );
  }

  const renderGroup = (items, type: string) => {
    if (!items || items.length === 0) {
      return null;
    }

    return (items || []).map((item, index) => (
      <GroupList key={index}>
        <Card.Header>
          {type === "user" ? renderUserFullName(item.details) : item.name}
        </Card.Header>
        <Group type={type} id={item._id} />
      </GroupList>
    ));
  };

  const renderContent = () => {
    if (viewType === "board") {
      return <div>hi kkk</div>;
    }

    switch (mode) {
      case "stage":
        return renderGroup(stages?.stages, "stage");
      case "label":
        return renderGroup(pipeLinelabels?.pipelineLabels, "label");
      case "duedate":
        return renderGroup(duedateFilter, "duedate");
      case "priority":
        return renderGroup(priorityFilter, "priority");
      case "user":
        return renderGroup(pipelineAssignedUsers.pipelineAssignedUsers, "user");
      default:
        return <Group type={"all"} id={""} />;
    }
  };

  if (showForm) {
    return <TicketForm closeModal={() => setShowForm(!showForm)} />;
  }

  return (
    <>
      <TicketHeader
        ticketLabel={config.ticketLabel || "Tickets"}
        baseColor={getConfigColor(config, "baseColor")}
        mode={mode}
        viewType={viewType}
        setMode={setMode}
        setViewType={setViewType}
        setShowForm={setShowForm}
      />

      {renderContent()}
    </>
  );
}
