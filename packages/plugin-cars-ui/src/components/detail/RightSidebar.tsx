import Box from "@erxes/ui/src/components/Box";
import { ICar } from "../../types";
import { List } from "../../styles";
import React from "react";
import Sidebar from "@erxes/ui/src/layout/components/Sidebar";
import { __ } from "@erxes/ui/src";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import dayjs from "dayjs";
import { isEnabled } from "@erxes/ui/src/utils/core";

const CompanySection = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "CompanySection" */ "@erxes/ui-contacts/src/companies/components/CompanySection"
    )
);

const CustomerSection = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "CustomerSection" */ "@erxes/ui-contacts/src/customers/components/CustomerSection"
    )
);

const DealSection = asyncComponent(
  () =>
    isEnabled("sales") &&
    import(
      /* webpackChunkName: "CustomerSection" */ "@erxes/ui-sales/src/deals/components/PortableDeals"
    )
);

type Props = {
  car: ICar;
};

const RightSidebar = (props: Props) => {
  const renderPlan = car => {
    if (!car.plan) {
      return null;
    }

    return (
      <li>
        <div>{__("Plan")}: </div>
        <span>{car.plan}</span>
      </li>
    );
  };

  const { car } = props;

  return (
    <Sidebar>
      <>
        <CustomerSection mainType="car" mainTypeId={car._id} />
        <CompanySection mainType="car" mainTypeId={car._id} />
      </>

      {isEnabled("sales") && (
        <>
          <DealSection mainType="car" mainTypeId={car._id} />
        </>
      )}

      <Box title={__("Other")} name="showOthers">
        <List>
          <li>
            <div>{__("Created at")}: </div>{" "}
            <span>{dayjs(car.createdAt).format("lll")}</span>
          </li>
          <li>
            <div>{__("Modified at")}: </div>{" "}
            <span>{dayjs(car.modifiedAt).format("lll")}</span>
          </li>
          {renderPlan(car)}
        </List>
      </Box>
    </Sidebar>
  );
};

export default RightSidebar;
