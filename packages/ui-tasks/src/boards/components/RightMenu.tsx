import {
  CustomRangeContainer,
  FilterBox,
  FilterButton,
  MenuFooter,
  RightMenuContainer,
  TabContent
} from "../styles/rightMenu";
import { DATERANGES, PRIORITIES } from "../constants";
import { TabTitle, Tabs } from "@erxes/ui/src/components/tabs";

import Archive from "./Archive";
import Button from "@erxes/ui/src/components/Button";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import DateControl from "@erxes/ui/src/components/form/DateControl";
import FormControl from "@erxes/ui/src/components/form/Control";
import { IOption } from "@erxes/ui/src/types";
import { IOptions } from "../types";
import Icon from "@erxes/ui/src/components/Icon";
import React, { Fragment } from "react";
import SegmentFilter from "../containers/SegmentFilter";
import Select, { OnChangeValue } from "react-select";
import SelectBranches from "@erxes/ui/src/team/containers/SelectBranches";
import SelectDepartments from "@erxes/ui/src/team/containers/SelectDepartments";
import SelectLabel from "./label/SelectLabel";
import SelectTeamMembers from "@erxes/ui/src/team/containers/SelectTeamMembers";
import { __ } from "coreui/utils";
import dayjs from "dayjs";
import { isEnabled } from "@erxes/ui/src/utils/core";
import { Transition } from "@headlessui/react";

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
  dateRangeType: IOption | null;
  dateRange: any;
} & StringState;

export default class RightMenu extends React.Component<Props, State> {
  private wrapperRef;

  constructor(props) {
    super(props);

    this.state = {
      currentTab: "Filter",
      dateRangeType: null,
      showMenu: false,
      dateRange: {} as any
    };

    this.setWrapperRef = this.setWrapperRef.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  setWrapperRef(node) {
    this.wrapperRef = node;
  }

  componentDidMount() {
    document.addEventListener("click", this.handleClickOutside, true);
  }

  componentWillUnmount() {
    document.removeEventListener("click", this.handleClickOutside, true);
  }

  handleClickOutside = event => {
    if (
      this.wrapperRef &&
      !this.wrapperRef.contains(event.target) &&
      this.state.currentTab === "Filter"
    ) {
      this.setState({ showMenu: false });
    }
  };

  toggleMenu = () => {
    this.setState({ showMenu: !this.state.showMenu });
  };

  onSearch = (e: React.KeyboardEvent<Element>) => {
    if (e.key === "Enter") {
      const target = e.currentTarget as HTMLInputElement;
      this.props.onSearch(target.value || "");
    }
  };

  onChange = (name: string, value: string) => {
    this.setState({ [name]: value } as Pick<StringState, keyof StringState>);
  };

  onTypeChange = type => {
    return this.setState({ dateRangeType: type }, () => {
      switch (this.state.dateRangeType?.value) {
        case "createdAt":
          return this.setState({
            dateRange: {
              startDate: "createdStartDate",
              endDate: "createdEndDate"
            }
          });
        case "stageChangedDate":
          return this.setState({
            dateRange: {
              startDate: "stateChangedStartDate",
              endDate: "stateChangedEndDate"
            }
          });
        case "startDate":
          return this.setState({
            dateRange: {
              startDate: "startDateStartDate",
              endDate: "startDateEndDate"
            }
          });
        case "closeDate":
          return this.setState({
            dateRange: {
              startDate: "closeDateStartDate",
              endDate: "closeDateEndDate"
            }
          });
      }
    });
  };

  startDateValue = () => {
    const { queryParams } = this.props;

    if (queryParams.createdStartDate) {
      return queryParams.createdStartDate;
    }

    if (queryParams.stateChangedStartDate) {
      return queryParams.stateChangedStartDate;
    }

    if (queryParams.startDateStartDate) {
      return queryParams.startDateStartDate;
    }

    if (queryParams.closeDateStartDate) {
      return queryParams.closeDateStartDate;
    }
  };

  endDateValue = () => {
    const { queryParams } = this.props;

    if (queryParams.createdEndDate) {
      return queryParams.createdEndDate;
    }

    if (queryParams.stateChangedEndDate) {
      return queryParams.stateChangedEndDate;
    }

    if (queryParams.startDateEndDate) {
      return queryParams.startDateEndDate;
    }

    if (queryParams.closeDateEndDate) {
      return queryParams.closeDateEndDate;
    }
  };

  dateRangeType = () => {
    const { queryParams } = this.props;

    if (queryParams.createdStartDate || queryParams.createdEndDate) {
      return { label: "Created date", value: "createdAt" };
    }

    if (queryParams.stateChangedStartDate || queryParams.stateChangedEndDate) {
      return { label: "Stage changed date", value: "stageChangedDate" };
    }

    if (queryParams.startDateStartDate || queryParams.startDateEndDate) {
      return { label: "Start date", value: "startDate" };
    }

    if (queryParams.closeDateStartDate || queryParams.closeDateEndDate) {
      return { label: "Close date", value: "closeDate" };
    }
  };

  onChangeRangeFilter = (kind: string, date) => {
    const formattedDate = date ? dayjs(date).format("YYYY-MM-DD") : "";

    const { queryParams, onSelect } = this.props;

    if (typeof kind === "undefined") {
      return null;
    }

    if (queryParams[kind] !== formattedDate) {
      onSelect(formattedDate, kind);
    }
  };

  renderDates() {
    const { link } = this.props;

    if (link.includes("calendar")) {
      return null;
    }

    return (
      <>
        {this.renderLink("Assigned to me", "assignedToMe", "true")}
        {this.renderLink("Due tomorrow", "closeDateType", "nextDay")}
        {this.renderLink("Due next week", "closeDateType", "nextWeek")}
        {this.renderLink("Due next month", "closeDateType", "nextMonth")}
        {this.renderLink("Has no close date", "closeDateType", "noCloseDate")}
        {this.renderLink("Overdue", "overdue", "closeDateType")}
      </>
    );
  }

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

  renderFilter() {
    const { queryParams, onSelect, extraFilter, options } = this.props;
    const { dateRangeType, dateRange } = this.state;

    const priorityValues = PRIORITIES.map(p => ({
      label: p,
      value: p
    }));
    const daterangeValues = DATERANGES.map(p => ({
      label: p.name,
      value: p.value
    }));
    const priorities = queryParams ? queryParams.priority : [];

    const onPrioritySelect = (ops: OnChangeValue<IOption, true>) =>
      onSelect(
        ops.map(option => option.value),
        "priority"
      );

    return (
      <FilterBox>
        <FormControl
          defaultValue={queryParams.search}
          placeholder={__("Type to search")}
          onKeyPress={this.onSearch}
          autoFocus={true}
        />

        <SelectTeamMembers
          label="Filter by created members"
          name="userIds"
          queryParams={queryParams}
          onSelect={onSelect}
        />
        <SelectBranches
          name="branchIds"
          label="Filter by branches"
          initialValue={queryParams.branchIds}
          onSelect={onSelect}
        />
        <SelectDepartments
          name="departmentIds"
          label="Filter by departments"
          initialValue={queryParams.departmentIds}
          onSelect={onSelect}
        />
        <Select
          placeholder={__("Filter by priority")}
          value={priorityValues.filter(option =>
            (priorities || []).includes(option.value)
          )}
          options={priorityValues}
          name="priority"
          onChange={onPrioritySelect}
          isMulti={true}
          loadingMessage={__("Loading...")}
        />

        <SelectTeamMembers
          label="Filter by team members"
          name="assignedUserIds"
          queryParams={queryParams}
          onSelect={onSelect}
          customOption={{
            value: "",
            label: "Assigned to no one"
          }}
        />

        <SelectLabel
          queryParams={queryParams}
          name="labelIds"
          onSelect={onSelect}
          filterParams={{
            pipelineId: queryParams.pipelineId || ""
          }}
          multi={true}
          customOption={{ value: "", label: "No label chosen" }}
        />

        {extraFilter}

        <ControlLabel>Date range:</ControlLabel>

        <Select
          placeholder={__("Choose date range type")}
          value={this.dateRangeType() || dateRangeType}
          options={daterangeValues}
          name="daterangeType"
          isClearable={true}
          onChange={this.onTypeChange}
        />

        <CustomRangeContainer>
          <DateControl
            value={this.startDateValue()}
            required={false}
            name={dateRange.startDate}
            onChange={date =>
              this.onChangeRangeFilter(dateRange.startDate, date)
            }
            placeholder={"Start date"}
            dateFormat={"YYYY-MM-DD"}
          />

          <DateControl
            value={this.endDateValue()}
            required={false}
            name={dateRange.endDate}
            placeholder={"End date"}
            onChange={date => this.onChangeRangeFilter(dateRange.endDate, date)}
            dateFormat={"YYYY-MM-DD"}
          />
        </CustomRangeContainer>

        {this.renderDates()}

        <SegmentFilter
          type={`tasks:${options.type}`}
          boardId={queryParams.id || ""}
          pipelineId={queryParams.pipelineId || ""}
        />
      </FilterBox>
    );
  }

  renderTabContent() {
    if (this.state.currentTab === "Filter") {
      const { isFiltered, clearFilter } = this.props;

      return (
        <>
          <TabContent>{this.renderFilter()}</TabContent>
          {isFiltered && (
            <MenuFooter>
              <Button
                block={true}
                btnStyle="warning"
                onClick={clearFilter}
                icon="times-circle"
              >
                {__("Clear Filter")}
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
      this.onChange("currentTab", name);
    };

    const { currentTab, showMenu } = this.state;
    const { isFiltered } = this.props;

    return (
      <div ref={this.setWrapperRef}>
        {isFiltered && (
          <Button
            btnStyle="warning"
            icon="times-circle"
            onClick={this.props.clearFilter}
          >
            {__("Clear Filter")}
          </Button>
        )}
        <Button btnStyle="simple" icon="bars" onClick={this.toggleMenu}>
          {showMenu ? __("Hide Menu") : __("Show Menu")}
        </Button>

        <Transition show={showMenu} unmount={true} as={Fragment}>
          <Transition.Child as={Fragment}>
            <RightMenuContainer>
              <Tabs full={true}>
                <TabTitle
                  className={currentTab === "Filter" ? "active" : ""}
                  onClick={tabOnClick.bind(this, "Filter")}
                >
                  {__("Filter")}
                </TabTitle>
                <TabTitle
                  className={currentTab === "Archived items" ? "active" : ""}
                  onClick={tabOnClick.bind(this, "Archived items")}
                >
                  {__("Archived items")}
                </TabTitle>
              </Tabs>
              {this.renderTabContent()}
            </RightMenuContainer>
          </Transition.Child>
        </Transition>
      </div>
    );
  }
}
