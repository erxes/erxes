import React from 'react';
import { withRouter } from 'react-router-dom';

import Box from '@erxes/ui/src/components/Box';
import Icon from '@erxes/ui/src/components/Icon';
import { IRouterProps } from '@erxes/ui/src/types';
import { __, router } from '@erxes/ui/src/utils';
import { SidebarList } from '@erxes/ui/src/layout/styles';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { ControlLabel, FormControl } from '@erxes/ui/src/components/form';
import { OverallWorkSidebar } from '../../../../styles';
import { IJobRefer } from '../../../../job/types';

interface IProps extends IRouterProps {
  history: any;
  jobRefers: IJobRefer[];
}

type State = {
  jobReferId: string;
};

class JobReferFilter extends React.Component<IProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      jobReferId: ''
    };
  }

  onChangeValue = (name, e) => {
    const value = e.target.value;
    const { history } = this.props;

    router.setParams(history, { [name]: value });
    this.setState({ [name]: value } as any);
  };

  render() {
    const { history, jobRefers } = this.props;
    const { jobReferId } = this.state;

    const onClear = () => {
      router.setParams(history, { outBranchId: null });
      router.setParams(history, { outDepartmentId: null });
    };

    const extraButtons = (router.getParam(history, 'jobReferId') ||
      router.getParam(history, 'jobReferId')) && (
      <a href="#cancel" tabIndex={0} onClick={onClear}>
        <Icon icon="cancel-1" />
      </a>
    );

    return (
      <Box
        extraButtons={extraButtons}
        title={__('Filter by Job')}
        name="showFilterByJob"
        noShadow={true}
        noMarginBottom={true}
        noBackground={true}
        noSpacing={true}
      >
        <SidebarList>
          <OverallWorkSidebar>
            <FormGroup>
              <ControlLabel>Jobs</ControlLabel>
              <FormControl
                name="type"
                componentClass="select"
                onChange={this.onChangeValue.bind(this, 'jobReferId')}
                required={true}
                value={jobReferId}
              >
                <option value="" />
                {jobRefers.map(jobRefer => (
                  <option key={jobRefer._id} value={jobRefer._id}>
                    {jobRefer.name}
                  </option>
                ))}
              </FormControl>
            </FormGroup>
          </OverallWorkSidebar>
        </SidebarList>
      </Box>
    );
  }
}

export default withRouter<IProps>(JobReferFilter);
