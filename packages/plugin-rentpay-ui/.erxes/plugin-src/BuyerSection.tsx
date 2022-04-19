import React from "react";
import { CustomerSection } from "@erxes/ui/src";

const RenterSection = ({ mainTypeId, mainType }) => {
  return (
    <CustomerSection
      title="Buyers"
      mainType={mainType}
      mainTypeId={mainTypeId}
      relType="buyerCustomer"
    />
  );
};

export default RenterSection;
