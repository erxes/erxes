import {
  ArchiveWrapper,
  CustomRangeContainer,
  FilterBox,
  TopBar
} from "../styles/rightMenu";
import React, { useEffect, useState } from "react";

import ArchivedItems from "../containers/ArchivedItems";
import Button from "@erxes/ui/src/components/Button";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import DateControl from "@erxes/ui/src/components/form/DateControl";
import FormControl from "@erxes/ui/src/components/form/Control";
import { HACKSTAGES } from "../constants";
import { HeaderButton } from "../styles/header";
import { INTEGRATION_KINDS } from "@erxes/ui/src/constants/integrations";
import { IOptions } from "../types";
import { PRIORITIES } from "../constants";
import Select from "react-select";
import SelectLabel from "./label/SelectLabel";
import SelectProducts from "@erxes/ui-products/src/containers/SelectProducts";
import SelectTeamMembers from "@erxes/ui/src/team/containers/SelectTeamMembers";
import { __ } from "@erxes/ui/src/utils";
import dayjs from "dayjs";
import { debounce } from "lodash";

type Props = {
  options: IOptions;
  queryParams: any;
};

const priorityValues = PRIORITIES.map(p => ({ label: p, value: p }));
const sourceOptions = INTEGRATION_KINDS.ALL.map(kind => ({
  label: kind.text,
  value: kind.value
}));
const growthHackOptions = HACKSTAGES.map(hs => ({ value: hs, label: hs }));

function Archive(props: Props) {
  const [type, changeType] = useState("item");
  const [searchValue, setSearchValue] = useState("");
  const { options, queryParams } = props;

  const [searchInputValue, setSearchInputValue] = useState("");
  const [userIds, setUserIds] = useState<string[]>([]);
  const [priorities, setPriorities] = useState<string[]>([]);
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([]);
  const [labelIds, setLabelIds] = useState<string[]>([]);
  const [productIds, setProductIds] = useState<string[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [hackStages, setHackStages] = useState<string[]>([]);

  const onChangeRangeFilter = (setterFn, date) => {
    const formattedDate = date ? dayjs(date).format("YYYY-MM-DD") : "";
    setterFn(formattedDate);
  };

  const switchType = (): string => (type === "list" ? "item" : "list");

  const toggleType = () => changeType(switchType());

  const debouncedSetSearchValue = debounce(setSearchValue, 1000);

  useEffect(() => {
    debouncedSetSearchValue(searchInputValue);
  }, [searchInputValue, debouncedSetSearchValue]);

  const isFiltered = (): boolean => {
    if (type === "item") {
      return !!(
        searchInputValue ||
        // userIds.length ||
        priorities.length ||
        // assignedUserIds.length ||
        // labelIds.length ||
        // productIds.length ||
        startDate ||
        endDate ||
        sources.length ||
        hackStages.length
      );
    } else {
      return !!searchInputValue;
    }
  };

  const clearFilters = () => {
    setSearchInputValue("");
    // setUserIds([]);
    setPriorities([]);
    // setAssignedUserIds([]);
    // setLabelIds([]);
    // setProductIds([]);
    setStartDate("");
    setEndDate("");
    setSources([]);
    setHackStages([]);
  };

  const renderItemFilters = () => {
    return (
      <FilterBox>
        <SelectTeamMembers
          label="Filter by created members"
          name="userIds"
          onSelect={v => {
            if (typeof v === "string") {
              if (!v) {
                setUserIds([]);
              } else {
                setUserIds([v]);
              }
            } else {
              setUserIds(v);
            }
          }}
        />
        <Select
          placeholder={__("Filter by priority")}
          value={priorityValues.filter(p => priorities.includes(p.value))}
          options={priorityValues}
          name="priority"
          onChange={arr => setPriorities(arr.map(v => v.value))}
          isMulti={true}
          // loadingPlaceholder={__('Loading...')}
        />

        <SelectTeamMembers
          label="Filter by team members"
          name="assignedUserIds"
          onSelect={v => {
            if (typeof v === "string") {
              if (!v) {
                setAssignedUserIds([]);
              } else {
                setAssignedUserIds([v]);
              }
            } else {
              setAssignedUserIds(v);
            }
          }}
        />

        <SelectLabel
          name="labelIds"
          onSelect={v => {
            if (typeof v === "string") {
              if (!v) {
                setLabelIds([]);
              } else {
                setLabelIds([v]);
              }
            } else {
              setLabelIds(v);
            }
          }}
          filterParams={{ pipelineId: queryParams.pipelineId || "" }}
          multi={true}
        />

        {options.type === "deal" && (
          <SelectProducts
            label={__("Filter by products")}
            name="productIds"
            onSelect={v => {
              if (typeof v === "string") {
                if (!v) {
                  setProductIds([]);
                } else {
                  setProductIds([v]);
                }
              } else {
                setProductIds(v);
              }
            }}
          />
        )}

        <ControlLabel>Close Date range:</ControlLabel>

        <CustomRangeContainer>
          <DateControl
            value={startDate}
            required={false}
            name="startDate"
            onChange={date => onChangeRangeFilter(setStartDate, date)}
            placeholder={"Start date"}
            dateFormat={"YYYY-MM-DD"}
          />

          <DateControl
            value={endDate}
            required={false}
            name="endDate"
            placeholder={"End date"}
            onChange={date => onChangeRangeFilter(setEndDate, date)}
            dateFormat={"YYYY-MM-DD"}
          />
        </CustomRangeContainer>
      </FilterBox>
    );
  };

  return (
    <ArchiveWrapper>
      <TopBar>
        <FormControl
          type="text"
          autoFocus={true}
          placeholder={`Type to search ${type}...`}
          value={searchInputValue}
          onChange={e =>
            setSearchInputValue((e.target as HTMLInputElement).value)
          }
        />
        <HeaderButton $hasBackground={true} onClick={toggleType}>
          {__("Switch To")} {switchType()}
          {"s"}
        </HeaderButton>
      </TopBar>

      {type === "item" && renderItemFilters()}

      {isFiltered() && (
        <Button
          block={true}
          btnStyle="warning"
          onClick={clearFilters}
          icon="times-circle"
          style={{ marginBottom: "20px" }}
        >
          {__("Clear Filter")}
        </Button>
      )}

      <ArchivedItems
        options={options}
        pipelineId={queryParams.pipelineId}
        search={searchValue}
        itemFilters={{
          userIds,
          priorities,
          assignedUserIds,
          labelIds,
          productIds,
          companyIds: [],
          customerIds: [],
          startDate,
          endDate,
          sources,
          hackStages
        }}
        type={type}
      />
    </ArchiveWrapper>
  );
}

export default Archive;
