import { Box, Icon, Tip } from "@erxes/ui/src/components";
import EmptyState from "@erxes/ui/src/components/EmptyState";
import { TabTitle, Tabs } from "@erxes/ui/src/components/tabs";
import { __ } from "@erxes/ui/src/utils";
import React from "react";
import { Link } from "react-router-dom";
import { BoxContainer, FilterContainer } from "../../styles";
import { IDonate } from "../donates/types";
import { ILottery } from "../lotteries/types";
import { ISpin } from "../spins/types";
import { IOwnerVoucher } from "../vouchers/types";

type IProps = {
  ownerId?: string;
  ownerType?: string;
  ownerVouchers: IOwnerVoucher[];
  spins: ISpin[];
  donates: IDonate[];
  lotteries: ILottery[];
  scoreLogs: any;
};

interface State {
  currentTab: string;
  availableTabs: { value: string; label: string; icon: string }[];
}

const LOYALTY_TABS = [
  { value: "voucher", label: "Voucher", icon: "ticket" },
  { value: "spin", label: "Spin", icon: "process" },
  { value: "donate", label: "Donate", icon: "heart-2" },
  { value: "lottery", label: "Lottery", icon: "swatchbook" },
  { value: "score", label: "Score", icon: "star-1" },
];

class LoyaltySection extends React.Component<IProps, State> {
  constructor(props) {
    super(props);

    const { ownerVouchers, spins, donates, lotteries, scoreLogs } = props;

    const tabConditions = {
      voucher: ownerVouchers,
      spin: spins,
      donate: donates,
      lottery: lotteries,
      score: scoreLogs,
    };

    const availableTabs = LOYALTY_TABS.filter(
      (tab) => tabConditions[tab.value]?.length
    );

    this.state = {
      currentTab: availableTabs.length ? availableTabs[0].value : "",
      availableTabs,
    };
  }

  setCurrentTab(tab) {
    this.setState({
      currentTab: tab,
    });
  }

  renderVouchers() {
    const { ownerId, ownerType, ownerVouchers } = this.props;

    if (!ownerVouchers?.length) {
      return "";
    }

    return (
      <BoxContainer className="no-link">
        {(ownerVouchers || []).map((ownerVoucher) => {
          const { campaign, count } = ownerVoucher || {};

          return (
            <Link
              to={`/vouchers?ownerId=${ownerId}&ownerType=${ownerType}&campaignId=${campaign._id}`}
            >
              <li>
                <Icon icon="star" />
                {campaign?.title || ""} ({count})
              </li>
            </Link>
          );
        })}
      </BoxContainer>
    );
  }

  renderSpins() {
    const { ownerId, ownerType, spins } = this.props;
    if (!spins.length) {
      return "";
    }

    return (
      <BoxContainer className="no-link">
        <Link to={`/spins?ownerId=${ownerId}&ownerType=${ownerType}`}>
          <li>
            <Icon icon="star" />
            {`Spins`} ({spins.length})
          </li>
        </Link>
      </BoxContainer>
    );
  }

  renderLotteries() {
    const { ownerId, ownerType, lotteries } = this.props;
    if (!lotteries.length) {
      return "";
    }

    return (
      <BoxContainer className="no-link">
        <Link to={`/lotteries?ownerId=${ownerId}&ownerType=${ownerType}`}>
          <li>
            <Icon icon="star" />
            {`Lotteries`} ({lotteries.length})
          </li>
        </Link>
      </BoxContainer>
    );
  }

  renderDonates() {
    const { ownerId, ownerType, donates } = this.props;
    if (!donates.length) {
      return "";
    }

    return (
      <BoxContainer className="no-link">
        <Link to={`/donates?ownerId=${ownerId}&ownerType=${ownerType}`}>
          <li>
            <Icon icon="star" />
            {`Donates`} ({donates.length})
          </li>
        </Link>
      </BoxContainer>
    );
  }

  renderScoreLog() {
    const { ownerId, ownerType, scoreLogs } = this.props;

    if (!scoreLogs.length) {
      return "";
    }

    const status = {
      earned: 0,
      redeemed: 0,
      refunded: 0,
      balance: 0,
    };

    (scoreLogs || []).forEach((scoreLog) => {
      const { action, changeScore } = scoreLog;

      const finalAction = action ?? (changeScore > 0 ? "add" : "subtract");

      if (finalAction === "add") {
        status.earned += Math.abs(changeScore);
      } else if (finalAction === "subtract") {
        status.redeemed += Math.abs(changeScore);
      } else if (finalAction === "refund") {
        status.refunded += Math.abs(changeScore);
        status.earned += Math.abs(changeScore);
      }
    });

    status.balance = status.earned - status.redeemed;

    return (
      <BoxContainer className="no-link">
        <li>Earned: {status.earned}</li>
        <li>Redeemed: {status.redeemed}</li>
        <li>Refunded: {status.refunded}</li>
        <li>Balance: {status.balance}</li>
        <Link to={`/score?ownerId=${ownerId}&ownerType=${ownerType}`}>
          <li>See more</li>
        </Link>
      </BoxContainer>
    );
  }

  renderEmpty() {
    const { ownerVouchers, spins, donates, lotteries } = this.props;

    if (
      !ownerVouchers.length &&
      !spins.length &&
      !lotteries.length &&
      !donates.length
    ) {
      return <EmptyState icon="folder-2" text="Empty" size="small" />;
    }

    return "";
  }

  renderTabContent() {
    const { currentTab } = this.state;

    switch (currentTab) {
      case "voucher":
        return this.renderVouchers();
      case "lottery":
        return this.renderLotteries();
      case "spin":
        return this.renderSpins();
      case "donate":
        return this.renderDonates();
      case "score":
        return this.renderScoreLog();
      default:
        return <></>;
    }
  }

  render() {
    const { availableTabs, currentTab } = this.state;

    if (!availableTabs?.length) {
      return this.renderEmpty();
    }

    return (
      <Box title={__("Loyalty")} name="Loyalties" isOpen={true}>
        <FilterContainer style={{ paddingTop: 0 }}>
          <Tabs full={true}>
            {availableTabs.map((tab) => (
              <Tip text={tab.label} key={tab.value} placement="top">
                <TabTitle
                  onClick={() => this.setCurrentTab(tab.value)}
                  className={`compact ${currentTab === tab.value ? "active" : ""}`}
                >
                  <Icon icon={tab.icon} />
                </TabTitle>
              </Tip>
            ))}
          </Tabs>
          {this.renderTabContent()}
        </FilterContainer>
      </Box>
    );
  }
}
export default LoyaltySection;
