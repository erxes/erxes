import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import { __, router } from '@erxes/ui/src/utils';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { SidebarList } from '@erxes/ui/src/layout/styles';
import React from 'react';
import { IOverallWorkDocument } from '../../../types';
import { OverallWorkSidebar } from '../../../../styles';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { ControlLabel } from '@erxes/ui/src/components/form';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import { IRouterProps } from '@erxes/ui/src/types';

const { Section } = Wrapper.Sidebar;

interface IProps extends IRouterProps {
  history: any;
  queryParams: any;
  overallWorks: IOverallWorkDocument[];
  loading: boolean;
  params: any;
}

type State = {
  inBranchId?: string;
  inDepartmentId?: string;
  outBranchId?: string;
  outDepartmentId?: string;
};

class SideBar extends React.Component<IProps, State> {
  constructor(props) {
    super(props);

    const { params } = this.props;
    const { inBranchId, inDepartmentId, outBranchId, outDepartmentId } = params;

    this.state = {
      inBranchId,
      inDepartmentId,
      outBranchId,
      outDepartmentId
    };
  }

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
        <Section.Title>{__('OverallWorks')}</Section.Title>
      </>
    );
  }

  onSelect = (name, value) => {
    const { history } = this.props;

    console.log('name name name:', name, value);
    router.removeParams(history, 'page');
    console.log('name1 name1 name1:', name, value);
    router.setParams(history, { [name]: value });
    console.log('name2 name2 name2:', name, value);
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
    const {
      inBranchId,
      inDepartmentId,
      outBranchId,
      outDepartmentId
    } = this.state;

    return (
      <Sidebar wide={true} hasBorder={true}>
        {this.renderOverallWorkHeader()}
        <OverallWorkSidebar>
          <FormGroup>
            <ControlLabel>InBranch</ControlLabel>
            <SelectBranches
              label="Choose branch"
              name="selectedBranchIds"
              initialValue={inBranchId}
              onSelect={branchId => this.onSelect('inBranchId', branchId)}
              multi={false}
              customOption={{ value: 'all', label: 'All branches' }}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>InDepartment</ControlLabel>
            <SelectDepartments
              label="Choose department"
              name="selectedDepartmentIds"
              initialValue={inDepartmentId}
              onSelect={departmentId =>
                this.onSelect('inDepartmentId', departmentId)
              }
              multi={false}
              customOption={{ value: 'all', label: 'All departments' }}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>OutBranch</ControlLabel>
            <SelectBranches
              label="Choose branch"
              name="selectedBranchIds"
              initialValue={outBranchId}
              onSelect={branchId => this.onSelect('outBranchId', branchId)}
              multi={false}
              customOption={{ value: 'all', label: 'All branches' }}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>OutDepartment</ControlLabel>
            <SelectDepartments
              label="Choose department"
              name="selectedDepartmentIds"
              initialValue={outDepartmentId}
              onSelect={departmentId =>
                this.onSelect('outDepartmentId', departmentId)
              }
              multi={false}
              customOption={{ value: 'all', label: 'All departments' }}
            />
          </FormGroup>
        </OverallWorkSidebar>

        {this.renderOverallWorkList()}
      </Sidebar>
    );
  }
}

export default SideBar;
