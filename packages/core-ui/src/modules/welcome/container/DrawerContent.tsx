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
  setShow: any;
};

// type FinalProps = {
//   branchListQuery: BranchesMainQueryResponse;
//   departmentListQuery: DepartmentsMainQueryResponse;
// } & Props;

class DrawerContentContainer extends React.Component<Props> {
  render() {
    const { setShow, content } = this.props;

    return <DrawerContent content={content} setShow={setShow} />;
  }
}

export default DrawerContentContainer;
