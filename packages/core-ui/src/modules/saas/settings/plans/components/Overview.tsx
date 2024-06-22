import {
  ControlWrapper,
  FlexRow,
  InfoBox,
  StatusBox,
  StatusTitle,
} from "../styles";
import { IOrganization, chargeItemWithCountResponse } from "../types";
import { __, getEnv } from "@erxes/ui/src/utils";

import Button from "@erxes/ui/src/components/Button";
import ChargeItem from "./ChargeItem";
import { IUser } from "modules/auth/types";
import Icon from "@erxes/ui/src/components/Icon";
import React from "react";
import Table from "modules/common/components/table";
import Tip from "@erxes/ui/src/components/Tip";
import Title from "./Title";
import withChargeItems from "../containers/withChargeItems";

type Props = {
  currentOrganization: IOrganization;
  usersTotalCount: number;
  currentUser: IUser;
  chargeItems: chargeItemWithCountResponse[];
};

class PlanOverview extends React.Component<Props> {
  renderChargeDetail(chargeItem: chargeItemWithCountResponse) {
    const { currentOrganization } = this.props;

    const promoCodes = currentOrganization.promoCodes || [];

    const { remainingAmount, freeAmount } = chargeItem.usage;

    if (
      (remainingAmount === 0 && freeAmount === 0) ||
      (promoCodes.length > 0 && chargeItem.type === "brand")
    ) {
      return null;
    }

    return (
      <ChargeItem
        key={chargeItem.name}
        name={chargeItem.name || chargeItem.title}
        unit={chargeItem.unit}
        usage={chargeItem.usage}
        bottomSpace={10}
        isBold={chargeItem.type === "twitter-dm"}
        comingSoon={chargeItem.comingSoon}
        unLimited={chargeItem.unLimited}
      >
        {this.renderInfo(chargeItem.type)}
      </ChargeItem>
    );
  }

  renderInfo = (type: string) => {
    let text = "";

    switch (type) {
      case "emailVerification":
      case "phoneVerification":
      case "emailSend":
      case "sms": {
        text = "Limit resets monthly";

        break;
      }
      case "twitter-dm": {
        text = "Paid Integration";

        break;
      }
      default: {
        return;
      }
    }

    return (
      <Tip text={__(text)}>
        <Icon icon="info-circle" />
      </Tip>
    );
  };

  render() {
    const { chargeItems, currentOrganization } = this.props;


    return (
      <StatusBox largePadding={true} largeMargin={true}>
        <StatusTitle>
          <Title currentOrganization={currentOrganization} />
        </StatusTitle>
        <FlexRow>
          <ControlWrapper>
            <Table
              $whiteSpace="nowrap"
              $hover={true}
              $bordered={true}
              $striped={true}
            >
              <thead>
                <tr>
                  <th>{__('Name')}</th>
                  <th>{__('Used')}</th>
                  <th>{__('Remaining')}</th>
                  <th>{__('Free')}</th>
                  {/* <th>{__("Promo Code")}</th> */}
                  <th>{__('Purchased')}</th>
                  <th className="odd">{__('Total')}</th>
                </tr>
              </thead>
              <tbody>
                {chargeItems.map((item) => this.renderChargeDetail(item))}
              </tbody>
            </Table>
          </ControlWrapper>
        </FlexRow>
        <br />
        <InfoBox>
          <span>
            <Icon icon="info-circle" />
            <strong>Choose</strong> a plan that fits your needs
          </span>
          <a
            target="_blank"
            href={`https://erxes.io/organizations`}
            rel="noopener noreferrer"
          >
            <Button btnStyle="primary" icon="clipboard-notes" uppercase={false}>
              Manage plan
            </Button>
          </a>
        </InfoBox>
      </StatusBox>
    );
  }
}

export default withChargeItems(PlanOverview);
