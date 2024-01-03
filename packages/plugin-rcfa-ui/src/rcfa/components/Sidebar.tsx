import React from 'react';
import {
  Sidebar as CommonSidebar,
  ControlLabel,
  DateControl,
  FormGroup,
  router,
  __,
  Icon
} from '@erxes/ui/src';
import {
  CustomRangeContainer,
  EndDateContainer,
  SidebarHeader
} from '../../styles';
import { DateContainer } from '@erxes/ui/src/styles/main';
import moment from 'moment';
import Select from 'react-select-plus';

type Props = {
  history: any;
  queryParams: any;
};

class SideBar extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { queryParams } = this.props;

    if (queryParams.createdAtFrom === 'Invalid date') {
      router.removeParams(this.props.history, 'createdAtFrom', 'createdAtTo');
    }

    if (queryParams.createdAtTo === 'Invalid date') {
      router.removeParams(this.props.history, 'createdAtFrom', 'createdAtTo');
    }

    if (queryParams.closedAtFrom === 'Invalid date') {
      router.removeParams(this.props.history, 'closedAtFrom', 'closedAtTo');
    }

    if (queryParams.closedAtTo === 'Invalid date') {
      router.removeParams(this.props.history, 'closedAtFrom', 'closedAtTo');
    }

    const handleDate = (field: string, value: {}) => {
      value = moment(value).format('YYYY/MM/DD');
      router.setParams(this.props.history, { [field]: value });
      router.setParams(this.props.history, { page: 1 });
    };

    const clearCreatedAt = () => {
      router.removeParams(this.props.history, 'createdAtFrom', 'createdAtTo');
      router.setParams(this.props.history, { page: 1 });
    };

    const clearClosedAt = () => {
      router.removeParams(this.props.history, 'closedAtFrom', 'closedAtTo');
      router.setParams(this.props.history, { page: 1 });
    };

    const statusOptions = [
      { value: 'inProgress', label: 'In Progress' },
      { value: 'closed', label: 'Closed' },
      { value: 'resolved', label: 'Resolved' }
    ];

    const statusChange = (val: any) => {
      if (val) {
        router.setParams(this.props.history, { status: val.value });
      } else {
        router.removeParams(this.props.history, 'status');
      }
      router.setParams(this.props.history, { page: 1 });
    };

    return (
      <CommonSidebar
        full
        header={<SidebarHeader>{__('Additional Filter')}</SidebarHeader>}
      >
        <FormGroup>
          <div style={{ display: 'inline', marginLeft: '10px' }}>
            <ControlLabel>Created Date Range</ControlLabel>
            <Icon
              icon="cancel-1"
              style={{ marginLeft: '0.5rem', cursor: 'pointer' }}
              onClick={clearCreatedAt}
            />
          </div>

          <CustomRangeContainer>
            <DateContainer>
              <DateControl
                name="createdAtFrom"
                placeholder="Choose start date"
                value={queryParams.createdAtFrom}
                onChange={e => handleDate('createdAtFrom', e)}
                dateFormat="YYYY/MM/DD"
              />
            </DateContainer>
            <EndDateContainer>
              <DateContainer>
                <DateControl
                  name="createdAtTo"
                  placeholder="Choose end date"
                  value={queryParams.createdAtTo}
                  onChange={e => handleDate('createdAtTo', e)}
                  dateFormat="YYYY/MM/DD"
                />
              </DateContainer>
            </EndDateContainer>
          </CustomRangeContainer>
        </FormGroup>

        <FormGroup>
          <div style={{ display: 'inline', marginLeft: '10px' }}>
            <ControlLabel>Closed Date Range</ControlLabel>
            <Icon
              icon="cancel-1"
              style={{ marginLeft: '0.5rem', cursor: 'pointer' }}
              onClick={clearClosedAt}
            />
          </div>

          <CustomRangeContainer>
            <DateContainer>
              <DateControl
                name="closedAtFrom"
                placeholder="Choose start date"
                value={queryParams?.closedAtFrom}
                onChange={e => handleDate('closedAtFrom', e)}
              />
            </DateContainer>
            <EndDateContainer>
              <DateContainer>
                <DateControl
                  name="closedAtTo"
                  placeholder="Choose end date"
                  value={queryParams?.closedAtTo}
                  onChange={e => handleDate('closedAtTo', e)}
                />
              </DateContainer>
            </EndDateContainer>
          </CustomRangeContainer>
        </FormGroup>

        <FormGroup>
          <div style={{ display: 'inline', marginLeft: '10px' }}>
            <ControlLabel>Status</ControlLabel>
          </div>

          <CustomRangeContainer>
            <Select
              options={statusOptions}
              value={queryParams?.status}
              onChange={statusChange}
              clearable={true}
            />
          </CustomRangeContainer>
        </FormGroup>
      </CommonSidebar>
    );
  }
}

export default SideBar;
