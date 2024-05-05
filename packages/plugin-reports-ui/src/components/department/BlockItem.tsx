import * as routerUtils from "@erxes/ui/src/utils/router";

import { useLocation, useNavigate } from "react-router-dom";

import Icon from "@erxes/ui/src/components/Icon";
import React from "react";
import { SideList } from "../../styles";
import { __ } from "@erxes/ui/src/utils";
import queryString from "query-string";

type Props = {
  item: any;
  title: string;
  icon?: string;
  level?: number;
  queryParamName: string;
};

type FinalProps = Props;

function BlockItem({ item, icon, queryParamName, level }: FinalProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const onClick = (_id) => {
    routerUtils.removeParams(
      navigate,
      location,
      "branchId",
      "unitId",
      "departmentId"
    );

    routerUtils.setParams(navigate, location, { [queryParamName]: _id });
  };

  const queryParams = queryString.parse(location.search);

  return (
    <SideList
      $isActive={queryParams[queryParamName] === item._id}
      key={item._id}
      level={level}
    >
      <span onClick={() => onClick(item._id)}>
        {icon && <Icon icon={icon} />}
        {item.title}
      </span>
    </SideList>
  );
}

export default BlockItem;
