import Box from "@erxes/ui/src/components/Box";
import React from "react";
import { SidebarList } from "@erxes/ui/src/layout/styles";
import { __ } from "@erxes/ui/src/utils/core";

type Props = {
  allDatas: any[];
  title: string;
  renderItems: () => React.ReactNode;
};

export default function BlockList(props: Props) {
  const { allDatas, title, renderItems } = props;

  return (
    <Box
      title={__(title)}
      name={`show${title}`}
      isOpen={true}
      collapsible={allDatas.length > 6}
    >
      <SidebarList $noTextColor $noBackground className="no-link">
        {renderItems}
      </SidebarList>
    </Box>
  );
}
