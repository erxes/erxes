import {
  EMPTY_CONTENT_DEAL_PIPELINE,
  EMPTY_CONTENT_PURCHASE_PIPELINE,
  EMPTY_CONTENT_TASK_PIPELINE
} from "@erxes/ui-settings/src/constants";
import { IBoard, IPipeline } from "@erxes/ui-purchases/src/boards/types";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import { __, router } from "coreui/utils";
import { useLocation, useNavigate } from "react-router-dom";

import { BarItems } from "@erxes/ui/src/layout/styles";
import Button from "@erxes/ui/src/components/Button";
import EmptyContent from "@erxes/ui/src/components/empty/EmptyContent";
import EmptyState from "@erxes/ui/src/components/EmptyState";
import FormControl from "@erxes/ui/src/components/form/Control";
import { IOption } from "../types";
import { Link } from "react-router-dom";
import { PipelineCount } from "@erxes/ui-purchases/src/settings/boards/styles";
import PipelineForm from "../containers/PipelineForm";
import PipelineRow from "./PipelineRow";
import React, { useState, useEffect } from "react";
import SortHandler from "@erxes/ui/src/components/SortHandler";
import Table from "@erxes/ui/src/components/table";
import { Title } from "@erxes/ui-settings/src/styles";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";

type Props = {
  type: string;
  pipelines: IPipeline[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  updateOrder?: any;
  remove: (pipelineId: string) => void;
  archive: (pipelineId: string, status: string) => void;
  copied: (pipelineId: string) => void;
  boardId: string;
  options?: IOption;
  refetch: ({ boardId }: { boardId?: string }) => Promise<any>;
  currentBoard?: IBoard;
};

const sortItems = (arr, direction, field) => {
  if (!field || !direction) {
    return;
  }

  arr.sort((a, b) => {
    const valueA = a[field].toLowerCase();
    const valueB = b[field].toLowerCase();

    if (valueA < valueB) {
      return -direction;
    }

    if (valueA > valueB) {
      return direction;
    }

    return 0;
  });
};

function Pipelines(props: Props) {
  const location = useLocation();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(
    location.hash.includes("showPipelineModal") || false
  );
  const [pipelines, setPipelines] = useState<IPipeline[]>(
    props.pipelines || []
  );
  const [isDragDisabled, setIsDragDisabled] = useState(false);

  useEffect(() => {
    if (props.pipelines !== pipelines) {
      setPipelines(props.pipelines);
    }
  }, [props.pipelines, pipelines]);

  const renderAddForm = () => {
    const { boardId, renderButton, type, options } = props;

    const closeModal = () => setShowModal(false);

    return (
      <PipelineForm
        options={options}
        type={type}
        boardId={boardId}
        renderButton={renderButton}
        show={showModal}
        closeModal={closeModal}
      />
    );
  };

  const addPipeline = () => {
    setShowModal(true);
  };

  const onTogglePopup = () => {
    setIsDragDisabled(!isDragDisabled);
  };

  const searchHandler = event => {
    const searchValue = event.target.value.toLowerCase();
    const { pipelines } = props;

    router.setParams(navigate, location, { searchValue: event.target.value });

    let updatedPipelines = pipelines;

    if (searchValue) {
      updatedPipelines = pipelines.filter(p =>
        p.name.toLowerCase().includes(searchValue)
      );
    }

    setPipelines(updatedPipelines);
  };

  const renderRows = () => {
    const { renderButton, type, options } = props;

    const sortDirection = router.getParam(location, "sortDirection");
    const sortField = router.getParam(location, "sortField");

    const sortedPipelines = [...pipelines];

    if (sortDirection && sortField) {
      sortItems(sortedPipelines, sortDirection, sortField);
    }

    return sortedPipelines.map(pipeline => (
      <PipelineRow
        key={pipeline._id}
        pipeline={pipeline}
        renderButton={renderButton}
        remove={props.remove}
        archive={props.archive}
        copied={props.copied}
        type={type}
        options={options}
        onTogglePopup={onTogglePopup}
      />
    ));
  };

  const renderContent = () => {
    const { pipelines, options, type } = props;

    if (pipelines.length === 0) {
      return (
        <EmptyContent
          content={
            type === "purchase"
              ? EMPTY_CONTENT_PURCHASE_PIPELINE
              : EMPTY_CONTENT_TASK_PIPELINE
          }
          maxItemWidth="420px"
        />
      );
    }

    return (
      <Table $whiteSpace="nowrap" $hover={true}>
        <thead>
          <tr>
            <th>
              <SortHandler sortField={"name"} label={__("Name")} />
            </th>
            <th>{__("Status")}</th>
            <th>{__("Created at")}</th>
            <th>{__("Created By")}</th>
            <th>{__("Actions")}</th>
          </tr>
        </thead>
        <tbody>{renderRows()}</tbody>
      </Table>
    );
  };

  const renderAdditionalButton = () => {
    const { options } = props;

    if (options && options.additionalButton) {
      return (
        <Link to={options.additionalButton}>
          <Button icon="arrow-to-right" btnStyle="simple">
            {options.additionalButtonText}
          </Button>
        </Link>
      );
    }

    if (options && options.additionalButtonModal) {
      const Content = options.additionalButtonModal;

      return <Content />;
    }

    return null;
  };

  const renderButton = () => {
    const { options, boardId } = props;
    const pipelineName = options?.pipelineName || "pipeline";

    if (!boardId) {
      return null;
    }

    return (
      <BarItems>
        <FormControl
          type="text"
          placeholder={__("Type to search")}
          onChange={searchHandler}
          value={router.getParam(location, "searchValue")}
          autoFocus={true}
        />

        {renderAdditionalButton()}
        <Button btnStyle="success" icon="plus-circle" onClick={addPipeline}>
          Add {pipelineName}
        </Button>
      </BarItems>
    );
  };

  const { currentBoard, options } = props;
  const pipelineName = options?.pipelineName || "pipeline";

  const leftActionBar = (
    <Title>
      {currentBoard ? currentBoard.name : ""}

      <PipelineCount>
        ({pipelines.length} {__(pipelineName)}
        {pipelines.length > 1 && "s"})
      </PipelineCount>
    </Title>
  );

  return (
    <div id="pipelines-content">
      <Wrapper.ActionBar
        wideSpacing
        left={leftActionBar}
        right={renderButton()}
      />
      {renderContent()}
      {renderAddForm()}
    </div>
  );
}

export default Pipelines;
