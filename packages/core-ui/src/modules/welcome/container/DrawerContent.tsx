import DrawerContent from "../components/DrawerContent";
// import { IUser } from 'modules/auth/types';
import React from "react";
// import {
//   BranchesMainQueryResponse,
//   DepartmentsMainQueryResponse
// } from '@erxes/ui/src/team/types';
// import { Spinner } from '@erxes/ui/src';

type Props = {
  content: any;
  tasks: any;
  setShow: any;
};

// type FinalProps = {
//   branchListQuery: BranchesMainQueryResponse;
//   departmentListQuery: DepartmentsMainQueryResponse;
// } & Props;

class DrawerContentContainer extends React.Component<Props> {
  render() {
    return <DrawerContent {...this.props} />;
  }
}

export default DrawerContentContainer;
