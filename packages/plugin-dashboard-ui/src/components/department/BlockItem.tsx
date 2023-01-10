import React from 'react';

import { withRouter } from 'react-router-dom';
import Icon from '@erxes/ui/src/components/Icon';
import * as routerUtils from '@erxes/ui/src/utils/router';
import { IRouterProps } from '@erxes/ui/src/types';
import queryString from 'query-string';
import { __ } from '@erxes/ui/src/utils';
import { SideList } from '../../styles';

type Props = {
  item: any;
  title: string;
  icon?: string;
  level?: number;
  queryParamName: string;
};

type FinalProps = Props & IRouterProps;

function BlockItem({
  item,
  title,
  icon,
  queryParamName,
  level,
  history,
  location
}: FinalProps) {
  const onClick = _id => {
    routerUtils.removeParams(history, 'branchId', 'unitId', 'departmentId');

    routerUtils.setParams(history, { [queryParamName]: _id });
  };

  const queryParams = queryString.parse(location.search);

  return (
    <SideList
      isActive={queryParams[queryParamName] === item._id}
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

export default withRouter<FinalProps>(BlockItem);
