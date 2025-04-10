import ClientSection from "./ClientSection";
import React from "react";
import VendorSection from "./VendorSection";

type Props = {
  mainType: string;
  mainTypeId: string;
  showType?: string;
};

const Container = (props: Props) => {
  return (
    <>
      <VendorSection {...props} />
      <ClientSection {...props} />
    </>
  );
};

export default Container;
