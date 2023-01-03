import SideBar from '../../components/sidebar/SideBar';
import React from 'react';
import { IBranch } from '@erxes/ui/src/team/types';

type Props = {
  history: any;
  currentDate?: string;
  queryParams: any;
  branchesList: IBranch[];
};

const TypesListContainer = (props: Props) => {
  const updatedProps = {
    ...props
  };

  return <SideBar {...updatedProps} />;
};

export default TypesListContainer;
