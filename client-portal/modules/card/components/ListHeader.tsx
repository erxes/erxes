import { ActionBarWrapper, CardTab, FilterGroup } from '../../styles/cards';
import { typeFilters, viewModes } from '../../main/constants';

import Button from '../../common/Button';
import { Dropdown } from 'react-bootstrap';
import DropdownToggle from '../../common/DropdownToggle';
import { HeaderWrapper } from '../../styles/main';
import Icon from '../../common/Icon';
import React from 'react';
import { capitalize } from '../../common/utils';
import { __ } from '../../../utils';
import { Dayjs } from 'dayjs';
import { getCurrentDate, nextMonth, previousMonth } from '../../utils/calendar';

type Props = {
  headerLabel: string;
  mode: any;
  type: string;
  setMode: any;
  viewType: string;
  baseColor: string;
  hideHeader: boolean;
  setShowForm: (val: boolean) => void;
  setViewType: (val: string) => void;
  currentDate: Dayjs;
  setCurrentDate: (date: Dayjs) => void;
};

export default class ListHeader extends React.Component<Props> {
  renderFilters() {
    const {
      mode,
      setMode,
      setViewType,
      viewType,
      hideHeader,
      currentDate,
      setCurrentDate
    } = this.props;

    if (hideHeader) {
      return null;
    }

    const onPreviousClick = () => {
      const newDate = previousMonth(currentDate);
      setCurrentDate(newDate);
    };

    const onNextClick = () => {
      const newDate = nextMonth(currentDate);
      setCurrentDate(newDate);
    };

    const onTodayClick = () => {
      const newDate = getCurrentDate();
      setCurrentDate(newDate);
    };

    return (
      <>
        {viewType === 'list' && (
          <Dropdown>
            <Dropdown.Toggle
              as={DropdownToggle}
              id="dropdown-filter-components"
            >
              <FilterGroup className="d-flex align-items-center">
                <label>Filter by</label> &nbsp;
                <CardTab>
                  <span
                    className={`d-flex align-items-center justify-content-center`}
                  >
                    <Icon icon="filter" size={15} /> &nbsp; {mode}
                  </span>
                </CardTab>
              </FilterGroup>
            </Dropdown.Toggle>

            <Dropdown.Menu>
              {typeFilters.map(viewMode => (
                <Dropdown.Item
                  key={viewMode.showMode}
                  className="d-flex align-items-center justify-content-between"
                  eventKey="1"
                  onClick={() => {
                    setMode(viewMode.setMode);
                  }}
                >
                  {viewMode.showMode}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        )}

        {viewType === 'calendar' && (
          <ActionBarWrapper>
            <Button
              btnStyle="simple"
              ignoreTrans={true}
              size="small"
              icon="leftarrow"
              onClick={onPreviousClick}
            />
            <Button
              btnStyle="simple"
              ignoreTrans={true}
              size="small"
              icon="rightarrow"
              onClick={onNextClick}
            />
            <Button
              btnStyle="primary"
              ignoreTrans={true}
              size="small"
              onClick={onTodayClick}
            >
              {__('Today')}
            </Button>
          </ActionBarWrapper>
        )}

        <Dropdown>
          <Dropdown.Toggle as={DropdownToggle} id="dropdown-view-components">
            <FilterGroup className="d-flex align-items-center">
              <label>View by</label> &nbsp;
              <CardTab>
                <span
                  className={`d-flex align-items-center justify-content-center`}
                >
                  <Icon icon="layers-1" size={15} /> &nbsp; {viewType}
                </span>
              </CardTab>
            </FilterGroup>
          </Dropdown.Toggle>

          <Dropdown.Menu>
            {viewModes.map(item => (
              <Dropdown.Item
                key={item.type}
                className="d-flex align-items-center justify-content-between"
                eventKey="1"
                onClick={() => {
                  setViewType(item.type);
                }}
              >
                {item.label}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </>
    );
  }

  render() {
    const { setShowForm, type } = this.props;

    return (
      <>
        <HeaderWrapper>
          <h4>{this.props.headerLabel}</h4>
          <div className="d-flex flex-wrap">
            {this.renderFilters()}

            <Button
              btnStyle="success"
              uppercase={false}
              onClick={() => setShowForm(true)}
              icon="add"
            >
              Create a New {capitalize(type)}
            </Button>
          </div>
        </HeaderWrapper>
      </>
    );
  }
}
