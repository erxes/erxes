import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sidebar as LeftSidebar,
  SidebarList as List,
  Wrapper
} from '@erxes/ui/src/layout';
import SidebarHeader from '@erxes/ui-settings/src/common/components/SidebarHeader';
import { CustomRangeContainer, FilterContainer } from '../styles';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import { DateContainer } from '@erxes/ui/src/styles/main';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import { EndDateContainer } from '@erxes/ui-forms/src/forms/styles';
import FormControl from '@erxes/ui/src/components/form/Control';
import Button from '@erxes/ui/src/components/Button';

type Props = { queryParams: any; history: any; loading: boolean };

const { Section } = Wrapper.Sidebar;

const SideBar = ({ queryParams, history, loading }: Props) => {
  return (
    <Wrapper.Sidebar hasBorder={true}>
      <Section.Title>
        {__('Filters')}
        <Section.QuickButtons>
          {/* {this.isFiltered() && (
            <a href="#cancel" tabIndex={0} onClick={this.clearFilter}>
              <Tip text={__('Clear filter')} placement="bottom">
                <Icon icon="cancel-1" />
              </Tip>
            </a>
          )} */}
        </Section.QuickButtons>
      </Section.Title>
      <FilterContainer>
        <List id="SettingsSidebar">
          <FormGroup>
            <ControlLabel>User</ControlLabel>
            {/* <SelectTeamMembers
              label="Choose users"
              name="userId"
              // initialValue={filterParams.userId}
              // onSelect={(userId) => this.setFilter('userId', userId)}
              customOption={{ value: '', label: '...Clear user filter' }}
              multi={false}
            /> */}
          </FormGroup>
          <CustomRangeContainer>
            <FormGroup>
              <ControlLabel required={true}>{__(`Start Date`)}</ControlLabel>
              <DateContainer>
                <DateControl
                  name="startDate"
                  dateFormat="YYYY/MM/DD"
                  timeFormat={true}
                  placeholder="Choose date"
                  // value={filterParams.startDate || ''}
                  // onChange={(value) => this.onSelectDate(value, 'startDate')}
                />
              </DateContainer>
            </FormGroup>
            <FormGroup>
              <ControlLabel required={true}>{__(`End Date`)}</ControlLabel>
              <EndDateContainer>
                <DateContainer>
                  <DateControl
                    name="endDate"
                    dateFormat="YYYY/MM/DD"
                    timeFormat={true}
                    placeholder="Choose date"
                    // value={filterParams.endDate || ''}
                    // onChange={(value) => this.onSelectDate(value, 'endDate')}
                  />
                </DateContainer>
              </EndDateContainer>
            </FormGroup>
          </CustomRangeContainer>
          <FormGroup>
            <ControlLabel>Content Type</ControlLabel>
            <FormControl
              name="contentType"
              // onChange={(e) =>
              //   this.setFilter('contentType', (e.target as any).value)
              // }
              // defaultValue={filterParams.contentType}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Content ID</ControlLabel>
            <FormControl
              name="contentId"
              // onChange={(e) =>
              //   this.setFilter('contentId', (e.target as any).value)
              // }
              // defaultValue={filterParams.contentId}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Search Consume</ControlLabel>
            <FormControl
              name="searchConsume"
              // onChange={(e) =>
              //   this.setFilter('searchConsume', (e.target as any).value)
              // }
              // defaultValue={filterParams.searchConsume}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Search Send</ControlLabel>
            <FormControl
              name="searchSend"
              // onChange={(e) =>
              //   this.setFilter('searchSend', (e.target as any).value)
              // }
              // defaultValue={filterParams.searchSend}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Search Response</ControlLabel>
            <FormControl
              name="searchResponse"
              // onChange={(e) =>
              //   this.setFilter('searchResponse', (e.target as any).value)
              // }
              // defaultValue={filterParams.searchResponse}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Search Error</ControlLabel>
            <FormControl
              name="searchError"
              // onChange={(e) =>
              //   this.setFilter('searchError', (e.target as any).value)
              // }
              // defaultValue={filterParams.searchError}
            />
          </FormGroup>
        </List>
        <Button
          block={true}
          btnStyle="success"
          uppercase={false}
          // onClick={this.runFilter}
          icon="filter"
        >
          {__('Filter')}
        </Button>
      </FilterContainer>
    </Wrapper.Sidebar>
  );
};

export default SideBar;
