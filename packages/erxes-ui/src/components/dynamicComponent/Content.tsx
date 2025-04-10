import React, { useState } from "react";

import { DynamicContent } from "./styles";

type Props = {
  children: React.ReactNode;
};

function DynamicComponentContent({ children }: Props) {
  return <DynamicContent>{children}</DynamicContent>;
}

export default DynamicComponentContent;
