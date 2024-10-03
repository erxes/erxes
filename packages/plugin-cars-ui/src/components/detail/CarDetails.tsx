import EmptyState from "@erxes/ui/src/components/EmptyState";
import { ICar } from "../../types";
import { IUser } from "@erxes/ui/src/auth/types";
import LeftSidebar from "./LeftSidebar";
import React from "react";
import RightSidebar from "./RightSidebar";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { __ } from "@erxes/ui/src";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import { isEnabled } from "@erxes/ui/src/utils/core";

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
  car: ICar;
  currentUser: IUser;
};

const CarDetails = (props: Props) => {
  const { car } = props;

  const title = car.plateNumber || "Unknown";

  const breadcrumb = [{ title: __("Cars"), link: "/cars" }, { title }];

  const renderContent = () => {
    return (
      <>
        <ActivityInputs
          contentTypeId={car._id}
          contentType="car"
          showEmail={false}
        />
        <ActivityLogs
          target={car.plateNumber || ""}
          contentId={car._id}
          contentType="car"
          extraTabs={[]}
        />
      </>
    );
  };

  return (
    <Wrapper
      header={<Wrapper.Header title={title} breadcrumb={breadcrumb} />}
      leftSidebar={<LeftSidebar {...props} />}
      rightSidebar={<RightSidebar car={car} />}
      content={renderContent()}
      transparent={true}
    />
  );
};

export default CarDetails;
