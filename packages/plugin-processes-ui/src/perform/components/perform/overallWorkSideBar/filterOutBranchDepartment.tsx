import React from 'react';
import { withRouter } from 'react-router-dom';

import Box from '@erxes/ui/src/components/Box';
import Icon from '@erxes/ui/src/components/Icon';
import { IRouterProps } from '@erxes/ui/src/types';
import { __, router } from '@erxes/ui/src/utils';
import { SidebarList } from '@erxes/ui/src/layout/styles';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { ControlLabel } from '@erxes/ui/src/components/form';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import { OverallWorkSidebar } from '../../../../styles';

interface IProps extends IRouterProps {
  history: any;
  searchable?: boolean;
  params?: any;
}

type State = {
  inBranchId?: string;
  inDepartmentId?: string;
  outBranchId?: string;
  outDepartmentId?: string;
};

class BranchDepartmentFilter extends React.Component<IProps, State> {
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

  render() {
    const { history } = this.props;

    const { outBranchId, outDepartmentId } = this.state;

    const onClear = () => {
      router.setParams(history, { outBranchId: null });
      router.setParams(history, { outDepartmentId: null });
    };

    const extraButtons = (router.getParam(history, 'outBranchId') ||
      router.getParam(history, 'outDepartmentId')) && (
      <a href="#cancel" tabIndex={0} onClick={onClear}>
        <Icon icon="cancel-1" />
      </a>
    );

    const onSelect = (name, value) => {
      router.setParams(history, { [name]: value });
      this.setState({ [name]: value } as any);
    };

    return (
      <Box
        extraButtons={extraButtons}
        title={__('Filter by Output')}
        name="showFilterByType"
        noShadow={true}
        noMarginBottom={true}
        noBackground={true}
        noSpacing={true}
      >
        <SidebarList>
          <OverallWorkSidebar>
            <FormGroup>
              <ControlLabel>OutBranch</ControlLabel>
              <SelectBranches
                label="Choose branch"
                name="selectedBranchIds"
                initialValue={outBranchId}
                onSelect={branchId => onSelect('outBranchId', branchId)}
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
                  onSelect('outDepartmentId', departmentId)
                }
                multi={false}
                customOption={{ value: 'all', label: 'All departments' }}
              />
            </FormGroup>
          </OverallWorkSidebar>
        </SidebarList>
      </Box>
    );
  }
}

export default withRouter<IProps>(BranchDepartmentFilter);
