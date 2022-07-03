import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import { __, router } from '@erxes/ui/src/utils';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { SidebarList } from '@erxes/ui/src/layout/styles';
import React from 'react';
import { IOverallWorkDocument } from '../../../types';
import { OverallWorkSidebar } from '../../../../styles';
import { IRouterProps } from '@erxes/ui/src/types';
import InputFilter from './filterInBranchDepartment';
import OutputFilter from './filterOutBranchDepartment';

const { Section } = Wrapper.Sidebar;

interface IProps extends IRouterProps {
  history: any;
  queryParams: any;
  overallWorks: IOverallWorkDocument[];
  loading: boolean;
  params: any;
}

class SideBar extends React.Component<IProps> {
  renderContent() {
    const { overallWorks } = this.props;

    const result: React.ReactNode[] = [];

    for (const overallWork of overallWorks) {
      const { job, intervalId } = overallWork;

      const name = <span>{job.label || 'not found'}</span>;

      const interval = <span>{intervalId || 'not found'}</span>;

      result.push(
        <OverallWorkSidebar>
          {name} | {interval}
        </OverallWorkSidebar>
      );
    }

    return result;
  }

  renderOverallWorkHeader() {
    return (
      <>
        <Section.Title>{__('OverallWorks')} </Section.Title>
      </>
    );
  }

  onSelect = (name, value) => {
    const { history } = this.props;

    router.setParams(history, { [name]: value });
    this.setState({ [name]: value } as any);
  };

  renderOverallWorkList() {
    const { overallWorks, loading } = this.props;

    return (
      <SidebarList>
        <DataWithLoader
          data={this.renderContent()}
          loading={loading}
          count={overallWorks.length}
          emptyText="There is no overallWork"
          emptyIcon="folder-2"
          size="small"
        />
      </SidebarList>
    );
  }

  render() {
    return (
      <SidebarList>
        <InputFilter {...this.props} />
        <OutputFilter {...this.props} />
        <Sidebar wide={true} hasBorder={true}>
          {this.renderOverallWorkHeader()}
          {this.renderOverallWorkList()}
        </Sidebar>
      </SidebarList>
    );
  }
}

export default SideBar;
