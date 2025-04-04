import { IOptions, IStage } from "../../boards/types";
import { PriceContainer, Right, Status } from "../../boards/styles/item";

import Assignees from "../../boards/components/Assignees";
import { Content } from "../../boards/styles/stage";
import Details from "../../boards/components/Details";
import DueDateLabel from "../../boards/components/DueDateLabel";
import { IDeal } from "../types";
import ItemArchivedStatus from "../../boards/components/portable/ItemArchivedStatus";
import { ItemContainer } from "../../boards/styles/common";
import ItemFooter from "../../boards/components/portable/ItemFooter";
import ItemProductProbabilities from "./ItemProductProbabilities";
import Labels from "../../boards/components/label/Labels";
import React from "react";
import { __ } from "@erxes/ui/src/utils";
import { colors } from "@erxes/ui/src/styles";
import { renderPriority } from "../../boards/utils";

type Props = {
  stageId?: string;
  item: IDeal;
  beforePopupClose?: () => void;
  onClick?: () => void;
  options?: IOptions;
  portable?: boolean;
  onAdd?: (stageId: string, item: IDeal) => void;
  onRemove?: (dealId: string, stageId: string) => void;
  onUpdate?: (item: IDeal) => void;
};

class DealItem extends React.PureComponent<Props> {
  renderStatusLabel(text, color) {
    const { item } = this.props;

    return (
      <Status>
        <span style={{ backgroundColor: color }}>{__(text)}</span>
        <ItemArchivedStatus
          status={item.status || "active"}
          skipContainer={true}
        />
      </Status>
    );
  }

  renderStatus(stage) {
    if (!stage) {
      return null;
    }

    if (stage.probability === "Lost") {
      return this.renderStatusLabel("Lost", colors.colorCoreRed);
    }

    if (stage.probability === "Won") {
      return this.renderStatusLabel("Won", colors.colorCoreGreen);
    }

    return this.renderStatusLabel("In Progress", colors.colorCoreBlue);
  }

  renderContent() {
    const { item } = this.props;

    const renderProduct = (p) => {
      const data: any = { ...p.product };
      data.quantity = p.quantity;
      data.uom = p.uom;
      data.unitPrice = p.unitPrice;

      return data;
    };

    const products = (item.products || [])
      .filter((p) => p.tickUsed)
      .map((p) => renderProduct(p));

    const exProducts = (item.products || [])
      .filter((p) => !p.tickUsed)
      .map((p) => renderProduct(p));

    const {
      customers,
      companies,
      startDate,
      closeDate,
      isComplete,
      stage = {} as IStage,
      customProperties,
      tags,
    } = item;

    const renderItemProductProbabilities = () => {
      if (
        window.location.pathname.includes("deal/board") ||
        window.location.pathname.includes("deal/calendar")
      ) {
        return (
          <ItemProductProbabilities
            totalAmount={item.amount}
            unusedTotalAmount={item.unUsedAmount || {}}
            probability={stage.probability}
          />
        );
      }

      return null;
    };

    return (
      <>
        <h5>
          {renderPriority(item.priority)}
          {item.name}
        </h5>

        <Details color="#63D2D6" items={products} />
        <Details color="#b49cf1" items={exProducts} />
        <Details color="#F7CE53" items={customers || []} />
        <Details color="#EA475D" items={companies || []} />
        <Details color="#FF6600" items={tags || []} />
        <Details
          color={colors.colorCoreOrange}
          items={customProperties || []}
        />

        <PriceContainer>
          {renderItemProductProbabilities()}

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
  }

  render() {
    const { item, portable, onClick } = this.props;

    if (portable) {
      return (
        <>
          <ItemContainer onClick={onClick}>
            {this.renderStatus(item.stage)}
            <Content>{this.renderContent()}</Content>
          </ItemContainer>
        </>
      );
    }

    return (
      <>
        <Labels labels={item.labels} indicator={true} />
        <Content onClick={onClick}>{this.renderContent()}</Content>
      </>
    );
  }
}

export default DealItem;
