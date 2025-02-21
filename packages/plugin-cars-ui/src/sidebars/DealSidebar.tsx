import CarSection from "../components/common/CarSection";
import React from "react";

type Props = {
  id: string;
  showType?: string;
};

const CustomerSection = ({ id }: Props) => {
  return <CarSection mainType={"deal"} mainTypeId={id} />;
};

export default CustomerSection;
