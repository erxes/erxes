import { ColorButton } from "../../styles/common";
import Icon from "@erxes/ui/src/components/Icon";
import { __, Alert } from "@erxes/ui/src/utils";
import React, { useState, useEffect } from "react";
import Popover from "@erxes/ui/src/components/Popover";
import { ChooseLabelWrapper } from "../../styles/label";
import { IPipelineLabel } from "../../types";
import Overlay from "./Overlay";

type Props = {
  pipelineId: string;
  selectedLabelIds: string[];
  labels: IPipelineLabel[];
  doLabel: (labelIds: string[]) => void;
  isConfirmVisible: boolean;
  toggleConfirm: (callback?: () => void) => void;
  onChangeRefresh: () => void;
};

const ChooseLabel = (props: Props) => {
  const { labels, toggleConfirm, pipelineId, onChangeRefresh } = props;
  const [selectedLabelIds, setSelectedLabelIds] = useState(
    props.selectedLabelIds
  );

  useEffect(() => {
    setSelectedLabelIds(props.selectedLabelIds);
  }, [props.selectedLabelIds]);

  const onSelectLabels = (selectedLabelIds: string[]) => {
    setSelectedLabelIds(selectedLabelIds);

    props.doLabel(selectedLabelIds);
    Alert.success("You successfully updated a label");
  };

  const renderOverlay = (close) => {
    const updatedProps = {
      pipelineId,
      selectedLabelIds,
      labels,
      toggleConfirm,
      onClose: close,
      onSelectLabels: onSelectLabels,
      onChangeRefresh,
    };

    return <Overlay {...updatedProps} />;
  };

  return (
    <ChooseLabelWrapper>
      <Popover
        placement="bottom-start"
        trigger={
          <ColorButton>
            <Icon icon="label-alt" />
            {__("Labels")}
          </ColorButton>
        }
        closeAfterSelect={true}
      >
        {renderOverlay}
      </Popover>
    </ChooseLabelWrapper>
  );
};

export default ChooseLabel;
