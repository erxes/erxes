import SideBarComponent from '../components/SideBar';
import {
  EditTypeMutationResponse,
  RemoveTypeMutationResponse,
  TypeQueryResponse,
} from '../types';
import React from 'react';

type Props = {
  history: any;
  currentTypeId?: string;
};

type FinalProps = {
  listReportsTypeQuery?: TypeQueryResponse;
} & Props &
  RemoveTypeMutationResponse &
  EditTypeMutationResponse;

const SideBar = (props: FinalProps) => {
  const updatedProps = {
    ...props,
  };

  return <SideBarComponent {...updatedProps} />;
};

export default SideBar;
