import ClientSection from "./ClientSection";
import React from "react";
import VendorSection from "./VendorSection";

type Props = {
  mainType: string;
  mainTypeId: string;
  showType?: string;
  relations?: {
    relationType: string;
    type: string;
  }[];
};

const Container = (props: Props) => {
  const { relations, mainType } = props;

  if (relations && mainType === "ticket") {
    const hasVendor = relations.some(
      (r) => r.type === "vendorIds" || r.relationType === "tickets:vendor"
    );

    const hasClient = relations.some(
      (r) => r.type === "clientIds" || r.relationType === "tickets:client"
    );

    return (
      <>
        {hasVendor && <VendorSection {...props} />}
        {hasClient && <ClientSection {...props} />}
      </>
    );
  }

  return (
    <>
      <VendorSection {...props} />
      <ClientSection {...props} />
    </>
  );
};

export default Container;
