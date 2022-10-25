import { Sidebar as CommonSideBar } from '@erxes/ui/src';
import React from 'react';
import { ContainerBox } from '../../style';
import CategoryListContainer from '../category/containers/List';

type Props = {
  queryParams: any;
  history: any;
};

class SideBar extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <CommonSideBar>
        <ContainerBox column gap={5}>
          <CategoryListContainer {...this.props} />
        </ContainerBox>
      </CommonSideBar>
    );
  }
}
export default SideBar;
