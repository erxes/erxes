import {
  DynamicContent,
  DynamicContentLeft,
  DynamicContentRight,
} from "@erxes/ui/src/styles/main";
import {
  loadDynamicComponentTitle,
  loadDynamicComponentWithTitle,
} from "@erxes/ui/src/utils/core";

import { IItem } from "../../boards/types";
import React from "react";

type Props = {
  item: IItem;
};

function DealDynamicComponent({ item }: Props) {
  return (
    <DynamicContent>
      <DynamicContentLeft>
        {loadDynamicComponentTitle(
          "dealRightSidebarSection",
          {
            id: item._id,
            mainType: "deal",
            mainTypeId: item._id,
            object: item,
            showType: "list",
          },
          true
        )}
      </DynamicContentLeft>
      <DynamicContentRight overflow={true}>
        {loadDynamicComponentWithTitle(
          "dealRightSidebarSection",
          {
            id: item._id,
            mainType: "deal",
            mainTypeId: item._id,
            object: item,
            showType: "list",
          },
          true
        )}
      </DynamicContentRight>
    </DynamicContent>
  );
}

export default DealDynamicComponent;
