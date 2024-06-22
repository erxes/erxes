import {
  EditTypeMutationResponse,
  RemoveTypeMutationResponse,
  TypeQueryResponse,
} from "../types";

import React from "react";
import SideBarComponent from "../components/SideBar";

type Props = {
  currentTypeId?: string;
};

const SideBar = (props: Props) => {
  const updatedProps = {
    ...props,
  };

  return <SideBarComponent {...updatedProps} />;
};

export default SideBar;
