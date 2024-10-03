import { ItemBox } from "@erxes/ui-sales/src/boards/styles/stage";
import { ICompany } from "@erxes/ui-contacts/src/companies/types";
import { getCPUserName } from "@erxes/ui-log/src/activityLogs/utils";
import { renderFullName } from "@erxes/ui/src/utils";
import React from "react";
import { ClientPortalConfig, IClientPortalUser } from "../../types";

type Props = {
  item: ClientPortalConfig | IClientPortalUser | ICompany;
  color: string;
};

const Detail: React.FC<Props> = ({ item, color }: Props) => {
  const renderItem = (item, color) => {
    return (
      <ItemBox>
        {item.name ||
          item.primaryName ||
          renderFullName(item) ||
          getCPUserName(item)}
      </ItemBox>
    );
  };

  if (!item) {
    return null;
  }

  return <>{renderItem(item, color)}</>;
};

export default Detail;
