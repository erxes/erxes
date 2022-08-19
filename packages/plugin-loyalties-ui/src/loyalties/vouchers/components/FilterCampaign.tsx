import {
  ControlLabel,
  FormControl,
  FormGroup
} from '@erxes/ui/src/components/form';
import { Icon, Tip } from '@erxes/ui/src/components';
import { __, router } from '@erxes/ui/src/utils';

import React from 'react';
import SelectCustomers from '@erxes/ui-contacts/src/customers/containers/SelectCustomers';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import { SidebarFilters } from '../../common/styles';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';

const { Section } = Wrapper.Sidebar;

interface IProps {
  history: any;
  queryParams: any;
}

class FilterCampaign extends React.Component<IProps> {
  clearCategoryFilter = () => {
    router.setParams(this.props.history, {
      ownerId: null,
      ownerType: null,
      status: null
    });
  };

  setFilter = (name, value) => {
    router.setParams(this.props.history, { [name]: value });
  };

  render() {
    const { queryParams } = this.props;
    return (
      <Sidebar>
        <Section maxHeight={188} collapsible={false}>
          <Section.Title>
            {__('Addition filters')}
            <Section.QuickButtons>
              {(router.getParam(this.props.history, 'status') ||
                router.getParam(this.props.history, 'ownerType') ||
                router.getParam(this.props.history, 'ownerID')) && (
                <a
                  href="#cancel"
                  tabIndex={0}
                  onClick={this.clearCategoryFilter}
                >
                  <Tip text={__('Clear filter')} placement="bottom">
                    <Icon icon="cancel-1" />
                  </Tip>
                </a>
              )}
            </Section.QuickButtons>
          </Section.Title>
          <SidebarFilters>
            <FormGroup>
              <ControlLabel>Status</ControlLabel>
              <FormControl
                name="status"
                componentClass="select"
                defaultValue={queryParams.status}
                required={false}
                onChange={e =>
                  this.setFilter(
                    'status',
                    (e.currentTarget as HTMLInputElement).value
                  )
                }
              >
                <option key={''} value={''}>
                  {' '}
                  {'All status'}{' '}
                </option>
                <option key={'new'} value={'new'}>
                  {' '}
                  {'new'}{' '}
                </option>
                <option key={'used'} value={'used'}>
                  {' '}
                  {'used'}{' '}
                </option>
              </FormControl>
            </FormGroup>
            <FormGroup>
              <ControlLabel>Owner type</ControlLabel>
              <FormControl
                name="ownerType"
                componentClass="select"
                defaultValue={queryParams.ownerType}
                required={false}
                onChange={e =>
                  this.setFilter(
                    'ownerType',
                    (e.currentTarget as HTMLInputElement).value
                  )
                }
              >
                <option key={''} value={''}>
                  {' '}
                  {'All types'}{' '}
                </option>
                <option key={'customer'} value={'customer'}>
                  {' '}
                  {'customer'}{' '}
                </option>
                <option key={'user'} value={'user'}>
                  {' '}
                  {'user'}{' '}
                </option>
                <option key={'company'} value={'company'}>
                  {' '}
                  {'company'}{' '}
                </option>
              </FormControl>
            </FormGroup>
            <FormGroup>
              <ControlLabel>Customer</ControlLabel>
              <SelectCustomers
                customOption={{
                  value: '',
                  label: 'All customers'
                }}
                label="Customer"
                name="ownerId"
                multi={false}
                initialValue={queryParams.ownerId}
                onSelect={customerId => this.setFilter('ownerId', customerId)}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Team member</ControlLabel>
              <SelectTeamMembers
                customOption={{
                  value: '',
                  label: 'All team members'
                }}
                label="Team member"
                name="ownerId"
                multi={false}
                initialValue={queryParams.ownerId}
                onSelect={userId => this.setFilter('ownerId', userId)}
              />
            </FormGroup>
          </SidebarFilters>
        </Section>
      </Sidebar>
    );
  }
}

export default FilterCampaign;
