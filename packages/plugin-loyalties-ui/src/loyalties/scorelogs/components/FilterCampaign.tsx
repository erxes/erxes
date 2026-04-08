import SelectCompanies from "@erxes/ui-contacts/src/companies/containers/SelectCompanies";
import SelectCustomers from "@erxes/ui-contacts/src/customers/containers/SelectCustomers";
import { EndDateContainer } from "@erxes/ui-forms/src/forms/styles";
import BoardSelectContainer from "@erxes/ui-sales/src/boards/containers/BoardSelect";
import { Icon, router } from "@erxes/ui/src";
import Box from "@erxes/ui/src/components/Box";
import {
  ControlLabel,
  FormControl,
  FormGroup,
} from "@erxes/ui/src/components/form";
import Tip from "@erxes/ui/src/components/Tip";
import { FieldStyle, SidebarList } from "@erxes/ui/src/layout/styles";
import { DateContainer } from "@erxes/ui/src/styles/main";
import SelectTeamMembers from "@erxes/ui/src/team/containers/SelectTeamMembers";
import { __ } from "@erxes/ui/src/utils/core";
import Datetime from "@nateradebaugh/react-datetime";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CustomRangeContainer,
  ExtraButtons,
  FilterContainer,
} from "../../../styles";
import { FILTER_OPTIONS } from "../constants";

type Props = {
  queryParams: any;
  refetch: (variable: any) => void;
};

const FilterCampaign = (props: Props) => {
  const location = useLocation();
  const navigate = useNavigate();

  const { queryParams } = props;

  const [filterParams, setFilterParams] = useState(queryParams);

  useEffect(() => {
    setFilterParams(queryParams);
  }, [queryParams]);

  const clearCategoryFilter = (field?: string[]) => {
    let params = [
      "page",
      "ownerType",
      "orderType",
      "order",
      "ownerId",
      "fromDate",
      "toDate",
    ];

    if (field?.length) {
      params = field;
    }

    router.removeParams(navigate, location, ...params);
    setFilterParams({});
  };

  const handleOnChange = (field, value) => {
    if ((field === "number" || field === "description") && value !== null) {
      value = value?.currentTarget?.value || "";
    }

    value = String(value);

    if (!value && field === "ownerType") {
      return clearCategoryFilter(["ownerType", "ownerId"]);
    }

    if (!value && field === "orderType") {
      return clearCategoryFilter(["orderType", "order"]);
    }

    if (!value) {
      return clearCategoryFilter([field]);
    }

    if (field === "fromDate" || field === "toDate") {
      value = dayjs(value).format("YYYY/MM/DD");
    }

    router.removeParams(navigate, location, "page", "perPage");
    router.setParams(navigate, location, { [field]: value });
  };

  const renderOwner = () => {
    if (queryParams.ownerType === "customer") {
      return (
        <SelectCustomers
          label="Customers"
          name="ownerId"
          multi={false}
          initialValue={queryParams?.ownerId}
          onSelect={(value) => handleOnChange("ownerId", value)}
        />
      );
    }

    if (queryParams.ownerType === "user") {
      return (
        <SelectTeamMembers
          label="Team Members"
          name="ownerId"
          multi={false}
          initialValue={queryParams?.ownerId}
          onSelect={(value) => handleOnChange("ownerId", value)}
        />
      );
    }

    if (queryParams.ownerType === "company") {
      return (
        <SelectCompanies
          label="Company"
          name="ownerId"
          multi={false}
          initialValue={queryParams?.ownerId}
          onSelect={(value) => handleOnChange("ownerId", value)}
        />
      );
    }

    return <></>;
  };

  const renderDateRange = () => {
    return (
      <FilterContainer>
        <ControlLabel>{`Created Date range:`}</ControlLabel>
        <CustomRangeContainer>
          <DateContainer>
            <Datetime
              dateFormat="YYYY/MM/DD"
              value={queryParams["fromDate"] || null}
              onChange={(date) => handleOnChange("fromDate", date)}
              className={"filterDate"}
              viewMode={"days"}
              inputProps={{ placeholder: __("From") }}
              timeFormat=""
            />
          </DateContainer>
          <EndDateContainer>
            <DateContainer>
              <Datetime
                dateFormat="YYYY/MM/DD"
                value={queryParams["toDate"] || null}
                onChange={(date) => handleOnChange("toDate", date)}
                className={"filterDate"}
                viewMode={"days"}
                inputProps={{ placeholder: __("To") }}
                timeFormat=""
              />
            </DateContainer>
          </EndDateContainer>
        </CustomRangeContainer>
      </FilterContainer>
    );
  };

  const renderTarget = () => {
    const { number, boardId, pipelineId, stageId, description } = filterParams;

    return (
      <FilterContainer>
        <BoardSelectContainer
          key={`${boardId}-${pipelineId}-${stageId}`}
          type="deal"
          autoSelectStage={false}
          boardId={boardId || ""}
          pipelineId={pipelineId || ""}
          stageId={stageId || ""}
          onChangeBoard={(boardId) => handleOnChange("boardId", boardId)}
          onChangePipeline={(pipelineId) =>
            handleOnChange("pipelineId", pipelineId)
          }
          onChangeStage={(stageId) => handleOnChange("stageId", stageId)}
        />
        <FormGroup>
          <ControlLabel>Number</ControlLabel>
          <FormControl
            type="text"
            name="number"
            onChange={(event) => handleOnChange("number", event)}
            defaultValue={number}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <FormControl
            type="text"
            name="description"
            onChange={(event) => handleOnChange("description", event)}
            defaultValue={description}
          />
        </FormGroup>
      </FilterContainer>
    );
  };

  const renderExtraButtons = (field) => {
    let content;

    if (
      field === "date" &&
      (queryParams["fromDate"] || queryParams["toDate"])
    ) {
      content = (
        <Icon
          icon="times-circle"
          onClick={() => clearCategoryFilter(["fromDate", "toDate"])}
        />
      );
    }

    if (
      field === "target" &&
      (queryParams["boardId"] ||
        queryParams["pipelineId"] ||
        queryParams["stageId"] ||
        queryParams["number"])
    ) {
      content = (
        <Icon
          icon="times-circle"
          onClick={() =>
            clearCategoryFilter(["boardId", "pipelineId", "stageId", "number"])
          }
        />
      );
    }

    if (queryParams[field]) {
      content = (
        <Icon icon="times-circle" onClick={() => handleOnChange(field, "")} />
      );
    }

    return (
      <ExtraButtons>
        <Tip text={"Clear Filter"}>{content}</Tip>
      </ExtraButtons>
    );
  };

  const renderOptions = ({
    field,
    title,
    child,
    type,
  }: {
    field: string;
    title: string;
    type?: string;
    child?: React.ReactNode;
  }) => {
    if (child) {
      return (
        <Box
          title={__(`Filter by ${title}`)}
          name={`showFilterBy${field}`}
          isOpen={true}
          extraButtons={renderExtraButtons(field)}
        >
          {child}
        </Box>
      );
    }

    const options =
      type && FILTER_OPTIONS[field]?.[type]
        ? FILTER_OPTIONS[field][type]
        : FILTER_OPTIONS[field] || [];

    return (
      <Box
        title={__(`Filter by ${title}`)}
        name={`showFilterBy${field}`}
        isOpen={true}
        extraButtons={renderExtraButtons(field)}
      >
        <SidebarList>
          {options.map(({ value, label }) => {
            return (
              <li key={value}>
                <a
                  href="#filter"
                  tabIndex={0}
                  className={
                    queryParams[field] === String(value) ? "active" : ""
                  }
                  onClick={() => handleOnChange(field, value)}
                >
                  <FieldStyle>{label}</FieldStyle>
                </a>
              </li>
            );
          })}

          {queryParams["ownerType"] && field === "ownerType" && (
            <FilterContainer>{renderOwner()}</FilterContainer>
          )}
        </SidebarList>
      </Box>
    );
  };

  return (
    <>
      {renderOptions({ field: "ownerType", title: "Owner Type" })}
      {renderOptions({ field: "orderType", title: "Order Type" })}
      {renderOptions({
        field: "target",
        title: "Target",
        child: renderTarget(),
      })}
      {queryParams["orderType"] &&
        renderOptions({ field: "order", title: "Order" })}
      {renderOptions({ field: "action", title: "Action" })}
      {renderOptions({
        field: "date",
        title: "Date",
        child: renderDateRange(),
      })}
    </>
  );
};

export default FilterCampaign;
