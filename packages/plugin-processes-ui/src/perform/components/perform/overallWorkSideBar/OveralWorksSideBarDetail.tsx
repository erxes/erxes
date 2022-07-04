import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import { router, __ } from '@erxes/ui/src/utils';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import {
  FieldStyle,
  SidebarCounter,
  SidebarList
} from '@erxes/ui/src/layout/styles';
import React from 'react';
import { IOverallWorkDocument } from '../../../types';
import { IRouterProps } from '@erxes/ui/src/types';
import Icon from '@erxes/ui/src/components/Icon';

const { Section } = Wrapper.Sidebar;

interface IProps extends IRouterProps {
  history: any;
  queryParams: any;
  overallWork: IOverallWorkDocument;
  loading: boolean;
}

class SideBar extends React.Component<IProps> {
  renderView = (name: string, variable: string) => {
    const defaultName = '-';

    return (
      <li>
        <FieldStyle>{__(name)}</FieldStyle>
        <SidebarCounter>{variable || defaultName}</SidebarCounter>
      </li>
    );
  };

  renderProducts = (name: string, products: any[]) => {
    const result: React.ReactNode[] = [];

    result.push(
      <li>
        <FieldStyle>{__(name)}</FieldStyle>
        <SidebarCounter>{products.length}</SidebarCounter>
      </li>
    );

    for (const product of products) {
      const { quantity, uom } = product;
      const productName = product.product ? product.product.name : 'not noe';
      const uomCode = uom ? uom.code : 'not uom';

      result.push(this.renderView(productName, quantity + '/' + uomCode + '/'));
    }

    return result;
  };

  renderContent() {
    const { overallWork } = this.props;
    const {
      job,
      flow,
      interval,
      intervalId,
      outBranch,
      outDepartment,
      inBranch,
      inDepartment,
      needProductsDetail,
      resultProductsDetail
    } = overallWork;

    return (
      <SidebarList className="no-link">
        {this.renderView('Flow', flow ? flow.name : '')}
        {this.renderView('Job', job ? job.label : '')}
        {this.renderView('Interval', interval ? interval.name : intervalId)}
        {this.renderView('InBranch', inBranch || '')}
        {this.renderView('InBranch', inDepartment || '')}
        {this.renderView('InBranch', outBranch || '')}
        {this.renderView('InBranch', outDepartment || '')}

        {this.renderProducts('NeedProducts', needProductsDetail)}
        {this.renderProducts('ResultProducts', resultProductsDetail)}
      </SidebarList>
    );
  }

  renderOverallWorkHeader() {
    const onClear = () => {
      router.setParams(history, { overallWorkId: null });
    };

    const extraButtons = router.getParam(history, 'overallWorkId') && (
      <button onClick={onClear}>
        <Icon icon="cancel-1" />
      </button>
    );

    return (
      <>
        <Section.Title>{__('OverallWork detail')} </Section.Title>
        {extraButtons}
      </>
    );
  }

  renderOverallWorkList() {
    const { overallWork, loading } = this.props;

    return (
      <SidebarList>
        <DataWithLoader
          data={this.renderContent()}
          loading={loading}
          count={1}
          emptyText="There is no overallWork"
          emptyIcon="folder-2"
          size="small"
        />
      </SidebarList>
    );
  }

  render() {
    return (
      <>
        <SidebarList>
          <Sidebar wide={true} hasBorder={true}>
            {this.renderOverallWorkHeader()}
            {this.renderOverallWorkList()}
          </Sidebar>
        </SidebarList>
      </>
    );
  }
}

export default SideBar;
