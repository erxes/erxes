import {
  BarItems,
  ButtonGroup,
  HeaderButton,
  HeaderLabel,
  HeaderLink,
  PageHeader
} from "../styles/header";
import { IBoard, IOptions, IPipeline } from "../types";
import { __, isEnabled } from "@erxes/ui/src/utils/core";
import {
  chartTypes,
  groupByGantt,
  groupByList,
  showByTime,
  stackByChart
} from "../constants";

import Button from "@erxes/ui/src/components/Button";
import EmptyState from "@erxes/ui/src/components/EmptyState";
import Filter from "@erxes/ui/src/components/filter/Filter";
import { GroupByContent } from "../styles/common";
import Icon from "@erxes/ui/src/components/Icon";
import { Link } from "react-router-dom";
import Participators from "@erxes/ui-inbox/src/inbox/components/conversationDetail/workarea/Participators";
import PipelineWatch from "../containers/PipelineWatch";
import React from "react";
import RightMenu from "./RightMenu";
import SelectType from "./SelectType";
import TemporarySegment from "@erxes/ui-segments/src/components/filter/TemporarySegment";
import Tip from "@erxes/ui/src/components/Tip";
import { Listbox, Transition } from "@headlessui/react";

type Props = {
  onSearch: (search: string) => void;
  onSelect: (values: string[] | string, key: string) => void;
  isFiltered: () => boolean;
  clearFilter: () => void;
  currentBoard?: IBoard;
  currentPipeline?: IPipeline;
  boards: IBoard[];
  middleContent?: () => React.ReactNode;
  queryParams: any;
  extraFilter?: React.ReactNode;
  link: string;
  rightContent?: () => React.ReactNode;
  groupContent?: () => React.ReactNode;
  boardText?: string;
  pipelineText?: string;
  options: IOptions;
  viewType: string;
};

type State = {
  showDetail: boolean;
};

class MainActionBar extends React.Component<Props, State> {
  static defaultProps = {
    viewType: "board",
    boardText: "Board",
    pipelineText: "Pipeline"
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      showDetail:
        localStorage.getItem("showSalesDetail") === "true" ? true : false
    };
  }

  renderBoards() {
    const { currentBoard, boards } = this.props;

    if ((currentBoard && boards.length === 1) || boards.length === 0) {
      return (
        <EmptyState icon="web-grid-alt" text="No other boards" size="small" />
      );
    }

    return boards.map(board => {
      let link = `${this.props.link}?id=${board._id}`;

      const { pipelines = [] } = board;

      if (pipelines.length === 0) {
        return null;
      }

      if (pipelines.length > 0) {
        link = `${link}&pipelineId=${pipelines[0]._id}`;
      }

      return (
        <Listbox.Option key={board._id} value={board.name}>
          <Link to={link}>{board.name}</Link>
          {currentBoard && board._id === currentBoard._id && (
            <Icon icon="check-1" size={15} />
          )}
        </Listbox.Option>
      );
    });
  }

  renderPipelines() {
    const { currentBoard, currentPipeline, link } = this.props;
    const pipelines = currentBoard ? currentBoard.pipelines || [] : [];

    if ((currentPipeline && pipelines.length === 1) || pipelines.length === 0) {
      return (
        <EmptyState
          icon="web-section-alt"
          text="No other pipeline"
          size="small"
        />
      );
    }

    if (!currentBoard) {
      return null;
    }

    return pipelines.map(pipeline => {
      return (
        <Listbox.Option key={pipeline._id} value={pipeline.name}>
          <Link
            to={`${link}?id=${currentBoard._id}&pipelineId=${pipeline._id}`}
          >
            {pipeline.name}
          </Link>
          {currentPipeline && pipeline._id === currentPipeline._id && (
            <Icon icon="check-1" size={15} />
          )}
        </Listbox.Option>
      );
    });
  }

  renderFilter() {
    const isFiltered = this.props.isFiltered();
    const {
      onSearch,
      onSelect,
      queryParams,
      link,
      extraFilter,
      options,
      clearFilter
    } = this.props;

    const rightMenuProps = {
      onSearch,
      onSelect,
      queryParams,
      link,
      extraFilter,
      options,
      isFiltered,
      clearFilter
    };

    return <RightMenu {...rightMenuProps} />;
  }

  renderVisibility() {
    const { currentPipeline } = this.props;

    if (!currentPipeline) {
      return null;
    }

    if (currentPipeline.visibility === "public") {
      return (
        <HeaderButton $isActive={true}>
          <Icon icon="earthgrid" /> {__("Public")}
        </HeaderButton>
      );
    }

    const members = currentPipeline.members || [];

    return (
      <>
        <HeaderButton $isActive={true}>
          <Icon icon="users-alt" /> {__("Private")}
        </HeaderButton>
        <Participators participatedUsers={members} limit={3} />
      </>
    );
  }

  renderGroupBy = () => {
    const { viewType, queryParams } = this.props;

    if (viewType !== "list" && viewType !== "gantt") {
      return null;
    }

    return (
      <GroupByContent>
        <SelectType
          title={__("Group by:")}
          icon="list-2"
          list={viewType === "list" ? groupByList : groupByGantt}
          text={__("Stage")}
          queryParamName="groupBy"
          queryParams={queryParams}
        />
      </GroupByContent>
    );
  };

  renderChartView = () => {
    const { viewType, queryParams } = this.props;

    if (viewType !== "chart") {
      return null;
    }

    return (
      <GroupByContent>
        <SelectType
          title={__("Chart Type:")}
          icon="chart-bar"
          list={chartTypes}
          text={__("Stacked Bar Chart")}
          queryParamName="chartType"
          queryParams={queryParams}
        />
        &nbsp;&nbsp;&nbsp;
        <SelectType
          title={__("Stack By:")}
          icon="list-2"
          list={stackByChart}
          text={__("Stage")}
          queryParamName="stackBy"
          queryParams={queryParams}
        />
      </GroupByContent>
    );
  };

  renderTimeView = () => {
    const { viewType, queryParams } = this.props;

    if (viewType !== "time") {
      return null;
    }

    return (
      <GroupByContent>
        <SelectType
          title={__("Group by:")}
          icon="list-2"
          list={showByTime}
          text={__("Stage")}
          queryParamName="groupBy"
          queryParams={queryParams}
        />
      </GroupByContent>
    );
  };

  renderViewChooser = () => {
    const { currentBoard, currentPipeline, options, viewType } = this.props;

    const type = options.type;
    localStorage.setItem(`${type}View`, `${viewType}`);

    const onFilterClick = (option: string) => {
      if (currentBoard && currentPipeline) {
        return `/${options.type}/${option}?id=${currentBoard._id}&pipelineId=${currentPipeline._id}`;
      }

      return `/${options.type}/${option}`;
    };

    return (
      <ButtonGroup>
        <Listbox>
          <div className="relative">
            <Listbox.Button>
              <Button btnStyle="primary" icon="list-ui-alt">
                {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
                <Icon icon="angle-down" />
              </Button>
            </Listbox.Button>
            <Transition
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
              className="absolute w-full shadow-lg"
            >
              <Listbox.Options static>
                <li key="board">
                  <Link
                    to={onFilterClick("board")}
                    className={viewType === "board" ? "active" : ""}
                  >
                    {__("Board")}
                  </Link>
                </li>
                <li key="calendar">
                  <Link
                    to={onFilterClick("calendar")}
                    className={viewType === "calendar" ? "active" : ""}
                  >
                    {__("Calendar")}
                  </Link>
                </li>

                {options.type === "purchase" && (
                  <li key="conversion">
                    <Link
                      to={onFilterClick("conversion")}
                      className={viewType === "conversion" ? "active" : ""}
                    >
                      {__("Conversion")}
                    </Link>
                  </li>
                )}
                <li key="activity">
                  <Link
                    to={onFilterClick("activity")}
                    className={viewType === "activity" ? "active" : ""}
                  >
                    {__("Activity")}
                  </Link>
                </li>
                <li key="list">
                  <Link
                    to={onFilterClick("list")}
                    className={viewType === "list" ? "active" : ""}
                  >
                    {__("List")}
                  </Link>
                </li>
                <li key="chart">
                  <Link
                    to={onFilterClick("chart")}
                    className={viewType === "chart" ? "active" : ""}
                  >
                    {__("Chart")}
                  </Link>
                </li>
                <li key="gantt">
                  <Link
                    to={onFilterClick("gantt")}
                    className={viewType === "gantt" ? "active" : ""}
                  >
                    {__("Gantt")}
                  </Link>
                </li>

                <li key="time">
                  <Link
                    to={onFilterClick("time")}
                    className={viewType === "time" ? "active" : ""}
                  >
                    {__("Time")}
                  </Link>
                </li>
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
      </ButtonGroup>
    );
  };

  onDetailShowHandler = () => {
    this.setState(
      {
        showDetail: !this.state.showDetail
      },
      () => {
        localStorage.setItem("showSalesDetail", `${this.state.showDetail}`);
        const storageChangeEvent = new Event("storageChange");
        window.dispatchEvent(storageChangeEvent);
      }
    );
  };

  render() {
    const {
      currentBoard,
      currentPipeline,
      middleContent,
      options,
      rightContent,
      boardText,
      pipelineText,
      queryParams
    } = this.props;

    const type = options.type;

    if (!localStorage.getItem("showSalesDetail")) {
      localStorage.setItem("showSalesDetail", `false`);
    }

    const actionBarLeft = (
      <BarItems>
        <HeaderLabel>
          <Icon icon="web-grid-alt" /> {__(boardText || "")}:{" "}
        </HeaderLabel>
        <Listbox>
          <div className="relative">
            <Listbox.Button>
              <HeaderButton $rightIconed={true}>
                {(currentBoard && currentBoard.name) || __("Choose board")}
                <Icon icon="angle-down" />
              </HeaderButton>
            </Listbox.Button>
            <Transition
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
              className="absolute w-full shadow-lg"
            >
              <Listbox.Options static>{this.renderBoards()}</Listbox.Options>
            </Transition>
          </div>
        </Listbox>
        <HeaderLabel>
          <Icon icon="web-section-alt" /> {__(pipelineText || "")}:{" "}
        </HeaderLabel>
        <Listbox>
          <div className="relative">
            <Listbox.Button>
              <HeaderButton $rightIconed={true}>
                {(currentPipeline && currentPipeline.name) ||
                  __("Choose pipeline")}
                <Icon icon="angle-down" />
              </HeaderButton>
            </Listbox.Button>
            <Transition
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
              className="absolute w-full shadow-lg"
            >
              <Listbox.Options static>{this.renderPipelines()}</Listbox.Options>
            </Transition>
          </div>
        </Listbox>
        <HeaderLink>
          <Tip text={__("Manage Board & Pipeline")} placement="bottom">
            <Link
              to={`/settings/boards/${type}?boardId=${
                currentBoard ? currentBoard._id : ""
              }`}
            >
              <Icon icon="cog" />
            </Link>
          </Tip>
        </HeaderLink>

        {currentPipeline ? (
          <PipelineWatch pipeline={currentPipeline} type={type} />
        ) : null}

        {this.renderVisibility()}
      </BarItems>
    );

    const actionBarRight = (
      <BarItems>
        {middleContent && middleContent()}

        {this.renderGroupBy()}

        {this.renderChartView()}

        {this.renderTimeView()}
        {queryParams && <Filter queryParams={queryParams} />}
        <TemporarySegment
          contentType={`tickets:${type}`}
          serviceConfig={{
            boardId: currentBoard?._id,
            pipelineId: currentPipeline?._id
          }}
          hideSaveButton
        />
        {this.renderViewChooser()}

        {rightContent && rightContent()}

        {this.renderFilter()}
      </BarItems>
    );

    return (
      <PageHeader id="board-pipeline-header">
        {actionBarLeft}
        {actionBarRight}
      </PageHeader>
    );
  }
}

export default MainActionBar;
