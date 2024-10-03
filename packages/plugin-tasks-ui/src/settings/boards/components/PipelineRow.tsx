import { IPipeline } from "@erxes/ui-tasks/src/boards/types";
import ActionButtons from "@erxes/ui/src/components/ActionButtons";
import Button from "@erxes/ui/src/components/Button";
import Tip from "@erxes/ui/src/components/Tip";
import { __ } from "@erxes/ui/src/utils/core";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import React, { useState } from "react";
import PipelineForm from "../containers/PipelineForm";
import { IOption } from "../types";
import Label from "@erxes/ui/src/components/Label";
import Icon from "@erxes/ui/src/components/Icon";
import { DateWrapper } from "@erxes/ui-forms/src/forms/styles";
import dayjs from "dayjs";
import { Capitalize } from "@erxes/ui-settings/src/permissions/styles";

type Props = {
  pipeline: IPipeline;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  remove: (pipelineId: string) => void;
  archive: (pipelineId: string, status: string) => void;
  copied: (pipelineId: string) => void;
  onTogglePopup: () => void;
  type: string;
  options?: IOption;
};

const PipelineRow = (props: Props) => {
  const [showModal, setShowModal] = useState(false);

  const renderArchiveAction = () => {
    const { archive, pipeline } = props;

    if (pipeline.status === "archived") {
      return null;
    }

    const onClick = () => archive(pipeline._id, pipeline.status);

    return (
      <Tip text={__("Archive")} placement="top">
        <Button btnStyle="link" onClick={onClick} icon="archive-alt" />
      </Tip>
    );
  };

  const renderUnarchiveAction = () => {
    const { archive, pipeline } = props;

    if (!pipeline.status || pipeline.status === "active") {
      return null;
    }

    const onClick = () => archive(pipeline._id, pipeline.status);

    return (
      <Tip text={__("Unarchive")} placement="top">
        <Button btnStyle="link" onClick={onClick} icon="redo" />
      </Tip>
    );
  };

  const renderRemoveAction = () => {
    const { remove, pipeline } = props;

    const onClick = () => remove(pipeline._id);

    return (
      <Tip text={__("Delete")} placement="top">
        <Button btnStyle="link" onClick={onClick} icon="times-circle" />
      </Tip>
    );
  };

  const renderExtraLinks = () => {
    const { copied, pipeline } = props;

    const duplicate = () => copied(pipeline._id);

    const edit = () => {
      setShowModal(true);

      props.onTogglePopup();
    };

    return (
      <>
        <Tip text={__("Edit")} placement="top">
          <Button btnStyle="link" onClick={edit} icon="edit-3" />
        </Tip>
        <Tip text={__("Duplicate")} placement="top">
          <Button btnStyle="link" onClick={duplicate} icon="copy-1" />
        </Tip>
      </>
    );
  };

  const renderEditForm = () => {
    const { renderButton, type, pipeline, options } = props;

    const closeModal = () => {
      setShowModal(false);

      props.onTogglePopup();
    };

    return (
      <PipelineForm
        options={options}
        type={type}
        boardId={pipeline.boardId || ""}
        renderButton={renderButton}
        pipeline={pipeline}
        closeModal={closeModal}
        show={showModal}
      />
    );
  };

  const { pipeline } = props;
  const { createdUser } = pipeline;

  const labelStyle =
    !pipeline.status || pipeline.status === "active" ? "success" : "warning";

  return (
    <tr>
      <td>{pipeline.name}</td>
      <td>
        <Label lblStyle={labelStyle}>{pipeline.status || "active"}</Label>
      </td>
      <td>
        <DateWrapper>
          <Icon icon="calender" />{" "}
          {dayjs(pipeline.createdAt.toString().split("T")[0]).format("ll")}
        </DateWrapper>
      </td>
      <td>
        <Capitalize>
          {createdUser && createdUser.details && createdUser.details.fullName}
        </Capitalize>
      </td>
      <td>
        <ActionButtons>
          {renderExtraLinks()}
          {renderArchiveAction()}
          {renderUnarchiveAction()}
          {renderRemoveAction()}
          {renderEditForm()}
        </ActionButtons>
      </td>
    </tr>
  );
};

export default PipelineRow;
