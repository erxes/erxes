import ActivityItem from "./ActivityItem";
import { IContractDoc } from "../../types";
import { IUser } from "@erxes/ui/src/auth/types";
import LeftSidebar from "./LeftSidebar";

import React from "react";
import RightSidebar from "./RightSidebar";
import ScheduleSection from "../schedules/ScheduleSection";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { __ } from "coreui/utils";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";

const ActivityInputs = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "ActivityInputs" */ "@erxes/ui-log/src/activityLogs/components/ActivityInputs"
    )
);

const ActivityLogs = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "ActivityLogs" */ "@erxes/ui-log/src/activityLogs/containers/ActivityLogs"
    )
);

type Props = {
  contract: IContractDoc;
  currentUser: IUser;
  saveItem: (doc: IContractDoc, callback?: (item) => void) => void;
  regenSchedules: (contractId: string) => void;
  fixSchedules: (contractId: string) => void;
  loading: boolean;
};

const ContractDetails = (props: Props) => {
  const { contract } = props;

  const title = contract.number || "Unknown";

  const breadcrumb = [
    { title: __("Contracts"), link: "/erxes-plugin-saving/contract-list" },
    { title }
  ];

  const content = (
    <>
      <ScheduleSection
        contractId={contract._id}
        isFirst={false}
      ></ScheduleSection>

      <>
        <ActivityInputs
          contentTypeId={contract._id}
          contentType="savingContract"
          showEmail={false}
        />

        <ActivityLogs
          target={contract.number || ""}
          contentId={contract._id}
          contentType="savingContract"
          extraTabs={[
            { name: "savings:interestStore", label: "Interest store" }
          ]}
          activityRenderItem={ActivityItem}
        />
      </>
    </>
  );

  return (
    <Wrapper
      header={<Wrapper.Header title={title} breadcrumb={breadcrumb} />}
      leftSidebar={<LeftSidebar {...props} />}
      rightSidebar={<RightSidebar contract={contract} />}
      content={content}
      transparent={true}
    />
  );
};

export default ContractDetails;
