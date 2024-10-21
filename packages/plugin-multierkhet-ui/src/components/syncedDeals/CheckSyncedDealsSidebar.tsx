import BoardSelectContainer from "@erxes/ui-sales/src/boards/containers/BoardSelect";
import Datetime from "@nateradebaugh/react-datetime";
import dayjs from "dayjs";
import Button from "@erxes/ui/src/components/Button";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import FormGroup from "@erxes/ui/src/components/form/Group";
import React, { useState } from "react";
import { Sidebar, Wrapper } from "@erxes/ui/src/layout";
import { __, router } from "@erxes/ui/src/utils";
import SelectTeamMembers from "@erxes/ui/src/team/containers/SelectTeamMembers";
import FormControl from "@erxes/ui/src/components/form/Control";
import { useLocation, useNavigate } from "react-router-dom";

const { Section } = Wrapper.Sidebar;

interface IProps {
  queryParams: any;
}

const CheckerSidebar = (props: IProps) => {
  const { queryParams } = props;

  const [userId, setUserId] = useState(queryParams.userId);
  const [boardId, setBoardId] = useState(queryParams.boardId);
  const [pipelineId, setPipelineId] = useState(queryParams.pipelineId);
  const [stageId, setStageId] = useState(queryParams.stageId);
  const [configStageId, setConfigStageId] = useState(queryParams.configStageId);
  const [stageChangedStartDate, setStageChangedStartDate] = useState<Date>(
    queryParams.stageChangedStartDate
  );
  const [stageChangedEndDate, setStageChangedEndDate] = useState<Date>(
    queryParams.stageChangedEndDate
  );
  const [dateType, setDateType] = useState(queryParams.dateType);
  const [search, setSearch] = useState(queryParams.search);
  const [number, setNumber] = useState(queryParams.number);

  const navigate = useNavigate();
  const location = useLocation();

  const onFilter = () => {
    router.setParams(navigate, location, {
      page: 1,
      boardId,
      pipelineId,
      stageId,
      configStageId,
      userId,
      stageChangedStartDate,
      stageChangedEndDate,
      dateType,
      search,
      number
    });
  };

  const onChangeRangeFilter = (kind, date) => {
    const cDate = dayjs(date).format("YYYY-MM-DD HH:mm");
    if (kind === "stageChangedStartDate") {
      setStageChangedStartDate(cDate as any);
    }
    if (kind === "stageChangedEndDate") {
      setStageChangedEndDate(cDate as any);
    }
  };

  const renderRange = (dateType: string) => {
    const lblStart = `${dateType}StartDate`;
    const lblEnd = `${dateType}EndDate`;

    return (
      <>
        <FormGroup>
          <ControlLabel>{`${dateType} Date range:`}</ControlLabel>

          <Datetime
            inputProps={{ placeholder: __("Click to select a date") }}
            dateFormat="YYYY-MM-DD"
            timeFormat="HH:mm"
            value={stageChangedStartDate || null}
            closeOnSelect={true}
            utc={true}
            input={true}
            onChange={onChangeRangeFilter.bind(this, lblStart)}
            viewMode={"days"}
            className={"filterDate"}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{`${dateType} Date range:`}</ControlLabel>
          <Datetime
            inputProps={{ placeholder: __("Click to select a date") }}
            dateFormat="YYYY-MM-DD"
            timeFormat="HH:mm"
            value={stageChangedEndDate}
            closeOnSelect={true}
            utc={true}
            input={true}
            onChange={onChangeRangeFilter.bind(this, lblEnd)}
            viewMode={"days"}
            className={"filterDate"}
          />
        </FormGroup>
      </>
    );
  };

  const onChangeBoard = (boardId: string) => {
    setBoardId(boardId);
  };

  const onChangePipeline = (pipelineId: string) => {
    setPipelineId(pipelineId);
  };

  const onChangeStage = (stageId: string) => {
    setStageId(stageId);
  };

  const onChangeConfigStage = (stageId: string) => {
    setConfigStageId(stageId);
  };

  const onUserChange = userId => {
    setUserId(userId);
  };

  const onChangeType = (e: React.FormEvent<HTMLElement>) => {
    setDateType((e.currentTarget as HTMLInputElement).value);
  };

  const onChangeInput = (e: React.FormEvent<HTMLElement>) => {
    const value = (e.currentTarget as HTMLInputElement).value;
    const name = (e.currentTarget as HTMLInputElement).name;
    if (name === "number") {
      setNumber(value);
    }
    if (name === "search") {
      setSearch(value);
    }
  };

  return (
    <Wrapper.Sidebar>
      <Sidebar>
        <Section $collapsible={false}>
          <Section.Title>{__("Filters")}</Section.Title>

          <FormGroup>
            <ControlLabel>Choose Filter Stage</ControlLabel>
            <BoardSelectContainer
              type="deal"
              autoSelectStage={false}
              boardId={boardId || ""}
              pipelineId={pipelineId || ""}
              stageId={stageId || ""}
              onChangeBoard={onChangeBoard}
              onChangePipeline={onChangePipeline}
              onChangeStage={onChangeStage}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Assigned</ControlLabel>
            <SelectTeamMembers
              label={__("Choose users")}
              name="userId"
              customOption={{ label: "Choose user", value: "" }}
              initialValue={userId || ""}
              onSelect={onUserChange}
              multi={false}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Deal search</ControlLabel>
            <FormControl
              type="text"
              name="search"
              onChange={onChangeInput}
              defaultValue={search}
              autoFocus={true}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Number</ControlLabel>
            <FormControl
              type="text"
              name="number"
              onChange={onChangeInput}
              defaultValue={number}
              autoFocus={true}
            />
          </FormGroup>

          {renderRange("stageChanged")}
          <FormGroup>
            <ControlLabel>Choose Get Config Stage</ControlLabel>
            <BoardSelectContainer
              type="deal"
              autoSelectStage={false}
              boardId={boardId || ""}
              pipelineId={pipelineId || ""}
              stageId={configStageId || stageId || ""}
              onChangeBoard={onChangeBoard}
              onChangePipeline={onChangePipeline}
              onChangeStage={onChangeConfigStage}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Date type</ControlLabel>
            <FormControl
              componentclass="select"
              value={dateType}
              name="dateType"
              onChange={onChangeType}
            >
              <option value={""}>Now</option>
              <option value={"lastMove"}>Last move at</option>
              <option value={"created"}>Created At</option>
              <option value={"closeOrCreated"}>Close date or created at</option>
              <option value={"closeOrMove"}>Close date or last move at</option>
              <option value={"firstOrMove"}>
                First synced or last move at
              </option>
              <option value={"firstOrCreated"}>
                First synced or created at
              </option>
            </FormControl>
          </FormGroup>
        </Section>

        <Button onClick={onFilter}>Filter</Button>
      </Sidebar>
    </Wrapper.Sidebar>
  );
};

export default CheckerSidebar;
