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
import JobFilter from './filterJobRefer';
import Icon from '@erxes/ui/src/components/Icon';
import Box from '@erxes/ui/src/components/Box';
import { IJobRefer } from '../../../../job/types';

const { Section } = Wrapper.Sidebar;

interface IProps extends IRouterProps {
  history: any;
  queryParams: any;
  overallWorks: IOverallWorkDocument[];
  loading: boolean;
  params: any;
  jobRefers: IJobRefer[];
  overallWorkIdgetter: (overallWorkId: string) => void;
}

class SideBar extends React.Component<IProps> {
  renderContent() {
    const { overallWorks, overallWorkIdgetter, params } = this.props;

    const result: React.ReactNode[] = [];

    const onClick = (key, value) => {
      const { history } = this.props;

      router.setParams(history, { [key]: value });

      if (key === 'overallWorkId') {
        overallWorkIdgetter(value);
      }
    };

    const paramKey = 'overallWorkId';

    for (const overallWork of overallWorks) {
      const { job, _id } = overallWork;

      const name = <span>{job.label || 'not found'}</span>;

      result.push(
        <OverallWorkSidebar>
          <a
            href="#filter"
            tabIndex={0}
            className={params[paramKey] === _id ? 'active' : ''}
            onClick={onClick.bind(this, paramKey, _id)}
          >
            {name}
          </a>
        </OverallWorkSidebar>
      );
    }

    return result;
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
    const onClear = () => {
      router.setParams(history, { overallWorkId: null });
    };

    const extraButtons = router.getParam(history, 'overallWorkId') && (
      <a href="#cancel" tabIndex={0} onClick={onClear}>
        <Icon icon="cancel-1" />
      </a>
    );

    return (
      <SidebarList>
        <InputFilter {...this.props} />
        <OutputFilter {...this.props} />
        <JobFilter {...this.props} />
        <Sidebar wide={true} hasBorder={true}>
          <Box
            extraButtons={extraButtons}
            title={__('OverallWorks')}
            name="showFilterByType"
          >
            <Section collapsible={this.props.overallWorks.length > 9}>
              {this.renderOverallWorkList()}
            </Section>
          </Box>
        </Sidebar>
      </SidebarList>
    );
  }
}

export default SideBar;
