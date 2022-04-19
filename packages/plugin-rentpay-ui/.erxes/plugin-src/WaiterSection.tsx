import React from "react";
import { CustomerSection } from "@erxes/ui/src";

const RenterSection = ({ mainTypeId, mainType }) => {
  return (
    <CustomerSection
      title="Waiters"
      mainType={mainType}
      mainTypeId={mainTypeId}
      relType="waiterCustomer"
    />
  );
};

export default RenterSection;
