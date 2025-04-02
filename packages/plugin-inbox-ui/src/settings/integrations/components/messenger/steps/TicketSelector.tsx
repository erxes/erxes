import React, { useState } from "react";
import { __, isEnabled } from "@erxes/ui/src/utils/core";
import TicketsBoardSelect from "@erxes/ui-tickets/src/boards/containers/BoardSelect";
import { FlexItem, LeftItem } from "@erxes/ui/src/components/step/styles";
import { IMessengerData } from "@erxes/ui-inbox/src/settings/integrations/types";
import FormGroup from "@erxes/ui/src/components/form/Group";
type Props = {
  ticketLabel?: string; // Optional ticket label
  ticketStageId: string; // Stage ID of the ticket
  ticketPipelineId: string; // Pipeline ID of the ticket
  ticketBoardId: string; // Board ID of the ticket
  fetchPipelines: (boardId: string) => void; // Function to fetch pipelines
  handleFormChange: (name: string, value: string | boolean) => void; // Form change handler
  ticketToggle?: boolean; // Optional boolean or function to toggle something
  kind?: "client" | "vendor"; // Optional "client" or "vendor" kind
} & IMessengerData;

type ControlItem = {
  required?: boolean;
  label: string;
  subtitle?: string;
  formValueName: string;
  formValue?: string;
  boardType?: string;
  placeholder?: string;
  formProps?: any;
  stageId?: string;
  pipelineId?: string;
  boardId?: string;
  url?: string;
  className?: string;
};

function General({
  ticketStageId,
  ticketPipelineId,
  ticketBoardId,
  fetchPipelines,
  handleFormChange,
  ticketToggle
}: Props) {
  const [show, setShow] = useState<boolean>(false);

  const handleToggleBoardSelect = () => setShow(!show);

  const BoardSelect: React.FC<any> = ({
    type,
    stageId,
    boardId,
    pipelineId,
    toggle
  }) => {
    const onChangeStage = (stgId) => handleFormChange(`${type}StageId`, stgId);
    const onChangePipeline = (plId) =>
      handleFormChange(`${type}PipelineId`, plId);
    const onChangeBoard = (brId) => handleFormChange(`${type}BoardId`, brId);

    return (
      <TicketsBoardSelect
        isRequired={toggle}
        type={type}
        stageId={stageId}
        boardId={boardId || ""}
        pipelineId={pipelineId || ""}
        onChangeStage={onChangeStage}
        onChangePipeline={onChangePipeline}
        onChangeBoard={onChangeBoard}
        autoSelectStage={false}
        callback={handleToggleBoardSelect}
      />
    );
  };

  const renderFeatures = () => {
    if (!isEnabled("tickets")) {
      return null;
    }

    return (
      <FlexItem>
        <LeftItem>
          <FormGroup>
            {isEnabled("tickets") && (
              <BoardSelect
                type='ticket'
                stageId={ticketStageId}
                boardId={ticketBoardId}
                pipelineId={ticketPipelineId}
                toggle={ticketToggle}
              />
            )}
          </FormGroup>
        </LeftItem>
      </FlexItem>
    );
  };

  return <>{renderFeatures()}</>;
}

export default General;
