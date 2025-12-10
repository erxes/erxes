import React, { FC, useMemo } from "react";
import { colors } from "@erxes/ui/src/styles";

import Assignees from "../../boards/components/Assignees";
import Details from "../../boards/components/Details";
import DueDateLabel from "../../boards/components/DueDateLabel";
import Labels from "../../boards/components/label/Labels";
import ItemFooter from "../../boards/components/portable/ItemFooter";
import EditForm from "../../boards/containers/editForm/EditForm";
import ItemArchivedStatus from "../../boards/components/portable/ItemArchivedStatus";

import { ItemContainer } from "../../boards/styles/common";
import { PriceContainer, Right } from "../../boards/styles/item";
import { Content } from "../../boards/styles/stage";
import { IOptions } from "../../boards/types";
import { renderPriority } from "../../boards/utils";
import { ITicket } from "../types";

type Props = {
  stageId?: string;
  item: ITicket;
  onClick?: () => void;
  isFormVisible?: boolean;
  beforePopupClose?: () => void;
  options?: IOptions;
  portable?: boolean;
  onAdd?: (stageId: string, item: ITicket) => void;
  onRemove?: (dealId: string, stageId: string) => void;
  onUpdate?: (item: ITicket) => void;
};

const TicketItem: FC<Props> = React.memo(
  ({ item, portable, onClick, isFormVisible, stageId, ...props }) => {
    if (!item || !item._id) return null;

    const renderForm = () => {
      if (!isFormVisible) return null;

      return (
        <EditForm
          {...props}
          stageId={stageId || item.stageId}
          itemId={item._id}
          hideHeader
          isPopupVisible={isFormVisible}
          key={`edit-form-${item._id}`}
        />
      );
    };

    const renderContent = useMemo(() => {
      if (!item) return null;

      const {
        customers,
        companies,
        closeDate,
        startDate,
        isComplete,
        customProperties,
        tags,
      } = item;

      return (
        <>
          <h5>
            {renderPriority(item.priority)}
            {item.name}
          </h5>

          <Details color="#F7CE53" items={customers || []} />
          <Details color="#EA475D" items={companies || []} />
          <Details color="#FF6600" items={tags || []} />
          <Details
            color={colors.colorCoreOrange}
            items={customProperties || []}
          />

          <PriceContainer>
            <Right>
              <Assignees users={item.assignedUsers} />
            </Right>
          </PriceContainer>

          <DueDateLabel
            startDate={startDate}
            closeDate={closeDate}
            isComplete={isComplete}
          />
          <ItemFooter item={item} />
        </>
      );
    }, [item]);

    if (portable) {
      return (
        <>
          <ItemContainer onClick={onClick}>
            <ItemArchivedStatus
              status={item.status || "active"}
              skipContainer={false}
            />
            <Content>{renderContent}</Content>
          </ItemContainer>
          {renderForm()}
        </>
      );
    }

    return (
      <>
        <Labels labels={item.labels} indicator />
        <Content onClick={onClick}>{renderContent}</Content>
        {renderForm()}
      </>
    );
  },
  (prevProps, nextProps) =>
    prevProps.item._id === nextProps.item._id &&
    prevProps.isFormVisible === nextProps.isFormVisible
);

export default TicketItem;
