import React from 'react';
import { __, router } from '@erxes/ui/src/utils';
import { Sidebar, Wrapper } from '@erxes/ui/src/layout';
import { Tip, Icon } from '@erxes/ui/src/components';
import { SidebarFilters } from '../../common/styles';
import { FormControl, FormGroup, ControlLabel } from '@erxes/ui/src';
import SelectCompaigns from '../../containers/SelectCompaigns';
import { queries as voucherCompaignQueries } from '../../../configs/voucherCompaign/graphql';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import SelectCustomers from '@erxes/ui/src/customers/containers/SelectCustomers';

const { Section } = Wrapper.Sidebar;

interface IProps {
  history: any;
  queryParams: any;
}

class FilterCompaign extends React.Component<IProps> {
  clearCategoryFilter = () => {
    router.setParams(this.props.history, { ownerId: null, ownerType: null, status: null, voucherCompaignId: null });
  };

  setFilter = (name, value) => {
    router.setParams(this.props.history, { [name]: value });
  };

  render() {
    const { queryParams } = this.props
    return (
      <Sidebar>
        <Section
          maxHeight={188}

          collapsible={false}
        >
          <Section.Title>
            {__('Addition filters')}
            <Section.QuickButtons>
              {(
                router.getParam(this.props.history, 'status') ||
                router.getParam(this.props.history, 'ownerType') ||
                router.getParam(this.props.history, 'ownerID') ||
                router.getParam(this.props.history, 'voucherCompaignId')
              ) && (
                  <a href="#cancel" tabIndex={0} onClick={this.clearCategoryFilter}>
                    <Tip text={__('Clear filter')} placement="bottom">
                      <Icon icon="cancel-1" />
                    </Tip>
                  </a>
                )}
            </Section.QuickButtons>
          </Section.Title>
          <SidebarFilters>
            <FormGroup>
              <ControlLabel>Voucher Compaign</ControlLabel>
              <SelectCompaigns
                queryName='voucherCompaigns'
                customQuery={voucherCompaignQueries.voucherCompaigns}
                label='Choose voucher compaign'
                name='compaignId'
                onSelect={(voucherCompaignId) => (this.setFilter('voucherCompaignId', voucherCompaignId))}
                initialValue={queryParams.voucherCompaignId}
                filterParams={{ voucherType: 'spin' }}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Status</ControlLabel>
              <FormControl
                name="status"
                componentClass="select"
                defaultValue={queryParams.status}
                required={false}
                onChange={(e) => (this.setFilter('status', (e.currentTarget as HTMLInputElement).value))}
              >
                <option key={''} value={''}> {'All status'} </option>
                <option key={'new'} value={'new'}> {'new'} </option>
                <option key={'used'} value={'used'}> {'used'} </option>
              </FormControl>
            </FormGroup>
            <FormGroup>
              <ControlLabel>Owner type</ControlLabel>
              <FormControl
                name="ownerType"
                componentClass="select"
                defaultValue={queryParams.ownerType}
                required={false}
                onChange={(e) => (this.setFilter('ownerType', (e.currentTarget as HTMLInputElement).value))}
              >
                <option key={''} value={''}> {'All types'} </option>
                <option key={'customer'} value={'customer'}> {'customer'} </option>
                <option key={'user'} value={'user'}> {'user'} </option>
                <option key={'company'} value={'company'}> {'company'} </option>
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
                onSelect={(customerId) => (this.setFilter('ownerId', customerId))}
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
                onSelect={(userId) => (this.setFilter('ownerId', userId))}
              />
            </FormGroup>
          </SidebarFilters>
        </Section>
      </Sidebar>
    );
  }
}

export default FilterCompaign;
