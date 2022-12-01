import SideBar from '../components/SideBar';
import React from 'react';

type Props = {
  onUserSelect: (userId: string) => void;
  history: any;
  currentDate?: string;
  queryParams: any;
};

const TypesListContainer = (props: Props) => {
  const updatedProps = {
    ...props
  };
  return <SideBar {...updatedProps} />;
};

export default TypesListContainer;
