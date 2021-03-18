import Button from 'modules/common/components/Button';
import { ControlLabel, FormControl } from 'modules/common/components/form';
import Icon from 'modules/common/components/Icon';
import { Tabs, TabTitle } from 'modules/common/components/tabs';
import { IOption } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import SelectTeamMembers from 'modules/settings/team/containers/SelectTeamMembers';
import React from 'react';
import Select from 'react-select-plus';
import RTG from 'react-transition-group';
import { PRIORITIES } from '../constants';
import SegmentFilter from '../containers/SegmentFilter';
import {
  CustomRangeContainer,
  FilterBox,
  FilterButton,
  MenuFooter,
  RightMenuContainer,
  TabContent
} from '../styles/rightMenu';
import { IOptions } from '../types';
import Archive from './Archive';
import SelectLabel from './label/SelectLabel';

type Props = {
  onSearch: (search: string) => void;
  onSelect: (values: string[] | string, key: string) => void;
  queryParams: any;
  link: string;
  extraFilter?: React.ReactNode;
  options: IOptions;
  isFiltered: boolean;
  clearFilter: () => void;
};

type StringState = {
  currentTab: string;
};

type State = {
  showMenu: boolean;
} & StringState;

export default class RightMenu extends React.Component<Props, State> {
  private wrapperRef;

  constructor(props) {
    super(props);

    this.state = {
      currentTab: 'Filter',
      showMenu: false
    };

    this.setWrapperRef = this.setWrapperRef.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  setWrapperRef(node) {
    this.wrapperRef = node;
  }

  componentDidMount() {
    document.addEventListener('click', this.handleClickOutside, true);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClickOutside, true);
  }

  handleClickOutside = event => {
    if (
      this.wrapperRef &&
      !this.wrapperRef.contains(event.target) &&
      this.state.currentTab === 'Filter'
    ) {
      this.setState({ showMenu: false });
    }
  };

  toggleMenu = () => {
    this.setState({ showMenu: !this.state.showMenu });
  };

  onSearch = (e: React.KeyboardEvent<Element>) => {
    if (e.key === 'Enter') {
      const target = e.currentTarget as HTMLInputElement;
      this.props.onSearch(target.value || '');
    }
  };

  onChange = (name: string, value: string) => {
    this.setState({ [name]: value } as Pick<StringState, keyof StringState>);
  };

  renderLink(label: string, key: string, value: string) {
    const { onSelect, queryParams } = this.props;

    const selected = queryParams[key] === value;

    const onClick = _e => {
      onSelect(value, key);
    };

    return (
      <FilterButton selected={selected} onClick={onClick}>
        {__(label)}
        {selected && <Icon icon="check-1" size={14} />}
      </FilterButton>
    );
  }

  onChangeRangeFilter = (kind, e) => {
    this.props.onSelect(e.currentTarget.value, kind);
  };

  renderDates() {
    const { link } = this.props;

    if (link.includes('calendar')) {
      return null;
    }

    return (
      <>
        {this.renderLink('Assigned to me', 'assignedToMe', 'true')}
        {this.renderLink('Due tomorrow', 'closeDateType', 'nextDay')}
        {this.renderLink('Due next week', 'closeDateType', 'nextWeek')}
        {this.renderLink('Due next month', 'closeDateType', 'nextMonth')}
        {this.renderLink('Has no close date', 'closeDateType', 'noCloseDate')}
        {this.renderLink('Overdue', 'overdue', 'closeDateType')}
      </>
    );
  }

  renderFilter() {
    const { queryParams, onSelect, extraFilter, options } = this.props;

    const priorityValues = PRIORITIES.map(p => ({ label: p, value: p }));
    const priorities = queryParams ? queryParams.priority : [];

    const onPrioritySelect = (ops: IOption[]) =>
      onSelect(
        ops.map(option => option.value),
        'priority'
      );

    return (
      <FilterBox>
        <FormControl
          defaultValue={queryParams.search}
          placeholder={__('Search ...')}
          onKeyPress={this.onSearch}
          autoFocus={true}
        />

        <SelectTeamMembers
          label="Filter by created members"
          name="userIds"
          queryParams={queryParams}
          onSelect={onSelect}
        />
        <Select
          placeholder="Filter by priority"
          value={priorities}
          options={priorityValues}
          name="priority"
          onChange={onPrioritySelect}
          multi={true}
          loadingPlaceholder={__('Loading...')}
        />

        <SelectTeamMembers
          label="Filter by team members"
          name="assignedUserIds"
          queryParams={queryParams}
          onSelect={onSelect}
          customOption={{
            value: '',
            label: 'Assigned to no one'
          }}
        />

        <SelectLabel
          queryParams={queryParams}
          name="labelIds"
          onSelect={onSelect}
          filterParams={{ pipelineId: queryParams.pipelineId || '' }}
          multi={true}
          customOption={{ value: '', label: 'No label chosen' }}
        />

        {extraFilter}

        <ControlLabel>Date range:</ControlLabel>

        <CustomRangeContainer>
          <div className="input-container">
            <FormControl
              defaultValue={queryParams.startDate}
              type="date"
              required={false}
              name="startDate"
              onChange={this.onChangeRangeFilter.bind(this, 'startDate')}
              placeholder={'Start date'}
            />
          </div>

          <div className="input-container">
            <FormControl
              defaultValue={queryParams.endDate}
              type="date"
              required={false}
              name="endDate"
              placeholder={'End date'}
              onChange={this.onChangeRangeFilter.bind(this, 'endDate')}
            />
          </div>
        </CustomRangeContainer>

        {this.renderDates()}

        <SegmentFilter type={options.type} />
      </FilterBox>
    );
  }

  renderTabContent() {
    if (this.state.currentTab === 'Filter') {
      const { isFiltered, clearFilter } = this.props;

      return (
        <>
          <TabContent>{this.renderFilter()}</TabContent>
          {isFiltered && (
            <MenuFooter>
              <Button
                block={true}
                btnStyle="warning"
                uppercase={false}
                onClick={clearFilter}
                icon="times-circle"
              >
                {__('Clear Filter')}
              </Button>
            </MenuFooter>
          )}
        </>
      );
    }

    const { queryParams, options } = this.props;

    return (
      <TabContent>
        <Archive queryParams={queryParams} options={options} />
      </TabContent>
    );
  }

  render() {
    const tabOnClick = (name: string) => {
      this.onChange('currentTab', name);
    };

    const { currentTab, showMenu } = this.state;
    const { isFiltered } = this.props;

    return (
      <div ref={this.setWrapperRef}>
        {isFiltered && (
          <Button
            btnStyle="warning"
            icon="times-circle"
            uppercase={false}
            onClick={this.props.clearFilter}
          >
            {__('Clear Filter')}
          </Button>
        )}
        <Button
          btnStyle="simple"
          uppercase={false}
          icon="bars"
          onClick={this.toggleMenu}
        >
          {showMenu ? __('Hide Menu') : __('Show Menu')}
        </Button>

        <RTG.CSSTransition
          in={this.state.showMenu}
          timeout={300}
          classNames="slide-in-right"
          unmountOnExit={true}
        >
          <RightMenuContainer>
            <Tabs full={true}>
              <TabTitle
                className={currentTab === 'Filter' ? 'active' : ''}
                onClick={tabOnClick.bind(this, 'Filter')}
              >
                {__('Filter')}
              </TabTitle>
              <TabTitle
                className={currentTab === 'Archived items' ? 'active' : ''}
                onClick={tabOnClick.bind(this, 'Archived items')}
              >
                {__('Archived items')}
              </TabTitle>
            </Tabs>
            {this.renderTabContent()}
          </RightMenuContainer>
        </RTG.CSSTransition>
      </div>
    );
  }
}
