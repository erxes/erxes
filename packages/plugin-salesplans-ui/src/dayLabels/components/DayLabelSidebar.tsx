import ControlLabel from '@erxes/ui/src/components/form/Label';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import Icon from '@erxes/ui/src/components/Icon';
import moment from 'moment';
import React from 'react';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import SelectLabels from '../../settings/containers/SelectLabels';
import Tip from '@erxes/ui/src/components/Tip';
import { __, router } from '@erxes/ui/src/utils';
import { DateContainer } from '@erxes/ui/src/styles/main';
import { SidebarFilters } from '../../styles';
import { SidebarList as List } from '@erxes/ui/src/layout';
import { Wrapper } from '@erxes/ui/src/layout';

interface Props {
  history: any;
  queryParams: any;
}

const { Section } = Wrapper.Sidebar;

class Sidebar extends React.Component<Props> {
  private timer?: NodeJS.Timer;

  clearFilter = () => {
    router.removeParams(
      this.props.history,
      'date',
      'filterStatus',
      'branchId',
      'departmentId',
      'labelId'
    );
  };

  setFilter = (name, value) => {
    router.removeParams(this.props.history, 'page');
    router.setParams(this.props.history, { [name]: value });
  };

  onInputChange = e => {
    e.preventDefault();

    if (this.timer) {
      clearTimeout(this.timer);
    }

    const value = e.target.value;
    const name = e.target.name;
    this.timer = setTimeout(() => {
      this.setFilter(name, value);
    }, 500);
  };

  onSelectDate = value => {
    const strVal = moment(value).format('YYYY/MM/DD');
    this.setFilter('date', strVal);
  };

  render() {
    const { queryParams } = this.props;

    return (
      <Wrapper.Sidebar hasBorder wide={true}>
        <Section.Title>
          {__('Filters')}
          <Section.QuickButtons>
            {(router.getParam(this.props.history, 'filterStatus') ||
              router.getParam(this.props.history, 'branchId') ||
              router.getParam(this.props.history, 'departmentId') ||
              router.getParam(this.props.history, 'date') ||
              router.getParam(this.props.history, 'labelId')) && (
              <a href="#cancel" tabIndex={0} onClick={this.clearFilter}>
                <Tip text={__('Clear filter')} placement="bottom">
                  <Icon icon="cancel-1" />
                </Tip>
              </a>
            )}
          </Section.QuickButtons>
        </Section.Title>
        <SidebarFilters>
          <List id="SettingsSidebar">
            <FormGroup>
              <ControlLabel required={true}>{__(`Date`)}</ControlLabel>
              <DateContainer>
                <DateControl
                  name="createdAtFrom"
                  placeholder="Choose date"
                  value={queryParams.date || ''}
                  onChange={this.onSelectDate}
                />
              </DateContainer>
            </FormGroup>
            <FormGroup>
              <ControlLabel>Branch</ControlLabel>
              <SelectBranches
                label="Choose branch"
                name="branchId"
                initialValue={queryParams.branchId || ''}
                customOption={{
                  value: '',
                  label: '...Clear branch filter'
                }}
                onSelect={branchId => this.setFilter('branchId', branchId)}
                multi={false}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Department</ControlLabel>
              <SelectDepartments
                label="Choose department"
                name="departmentId"
                initialValue={queryParams.departmentId || ''}
                customOption={{
                  value: '',
                  label: '...Clear department filter'
                }}
                onSelect={departmentId =>
                  this.setFilter('departmentId', departmentId)
                }
                multi={false}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Label</ControlLabel>
              <SelectLabels
                label="Choose label"
                name="labelId"
                initialValue={queryParams.labelId || ''}
                customOption={{
                  value: '',
                  label: '...Clear label filter'
                }}
                onSelect={labelId => this.setFilter('labelId', labelId)}
                multi={false}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Status</ControlLabel>
              <FormControl
                name="filterStatus"
                componentClass="select"
                defaultValue={queryParams.filterStatus}
                required={false}
                onChange={e =>
                  this.setFilter(
                    'filterStatus',
                    (e.currentTarget as HTMLInputElement).value
                  )
                }
              >
                <option key={''} value={''}>
                  {' '}
                  {'All status'}{' '}
                </option>
                <option key={'active'} value={'active'}>
                  {' '}
                  {'active'}{' '}
                </option>
                <option key={'archived'} value={'archived'}>
                  {' '}
                  {'archived'}{' '}
                </option>
              </FormControl>
            </FormGroup>
          </List>
        </SidebarFilters>
      </Wrapper.Sidebar>
    );
  }
}

export default Sidebar;
