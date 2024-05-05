import { router, Tabs, TabTitle } from "@erxes/ui/src";
import { Button, ModalTrigger } from "@erxes/ui/src/components";
import { Wrapper } from "@erxes/ui/src/layout";
import { MainStyleTitle as Title } from "@erxes/ui/src/styles/eindex";
import React, { useState } from "react";
import {
  ILotteryCampaign,
  LotteryCampaignDetailQueryResponse,
} from "../../../configs/lotteryCampaign/types";
import { TriggerTabs } from "../../../styles";
import AwardContent from "../containers/award/content";
import AwardDetail from "../containers/award/detail";
import Sidebar from "./Sidebar";
import { useLocation, useNavigate } from "react-router-dom";

interface IProps {
  loading: boolean;
  queryParams: any;
  lotteryCampaignDetailQuery: LotteryCampaignDetailQueryResponse;
  lotteryCampaign?: ILotteryCampaign;
  loadVoucherCampaingDetail: (variables: string) => any;
  voucherDetail: any;
  doLotteries: (variables: object) => any;
  multipledoLottery: (variables: object) => any;
  winners: any;
  winnerCount: number;
}

const VouchersAward = (props: IProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState("");
  const [currentAwardId, setCurrentAwardId] = useState("");
  const [potentailAwardCount, setPotentailAwardCount] = useState(0);
  const [currentAwardCount, setCurrentAwardCount] = useState(0);
  const [multiple, setMultiple] = useState(0);
  const [isOpenNextChar, setIsOpenNextChar] = useState(false);

  const onClick = (currentTab: any) => {
    setCurrentTab(currentTab);
    router.setParams(navigate, location, { awardId: currentTab._id });
  };

  const { loading, queryParams, lotteryCampaignDetailQuery } = props;
  const lotteryCampaign = lotteryCampaignDetailQuery.lotteryCampaignDetail;

  const actionBarLeft = <Title>{"Lottery Award"} </Title>;

  const detailBtn = (
    <Button btnStyle="success" size="small" icon="plus-circle">
      Detail
    </Button>
  );

  const Modalcontent = () => {
    const ids: string[] = [];

    for (const award of lotteryCampaign?.awards || []) {
      award?.voucherCampaignId && ids.push(award?.voucherCampaignId);
    }

    const updatedProps = {
      lotteryCampaign,
      queryParams: { ids },
    };

    return <AwardDetail {...updatedProps} />;
  };

  const actionBarRight = () => {
    return (
      <ModalTrigger
        title="Lottery Detail"
        trigger={detailBtn}
        autoOpenKey="showVoucherModal"
        content={Modalcontent}
        backDrop="static"
      />
    );
  };

  const updatedProps = {
    queryParams: { ...props.queryParams, awardId: currentTab._id },
    nextChar: "",
    currentTab,
    lotteryCampaign,
  };

  const content = (
    <div style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
      <TriggerTabs>
        <Tabs full={true}>
          {lotteryCampaign?.awards &&
            lotteryCampaign?.awards.map((p) => (
              <TabTitle
                className={currentTab?._id === p._id ? "active" : ""}
                onClick={onClick.bind(this, p)}
                key={p._id}
              >
                {p.name}
              </TabTitle>
            ))}
        </Tabs>
      </TriggerTabs>
      {queryParams.awardId && currentTab._id === queryParams.awardId && (
        <>
          <AwardContent {...updatedProps} />
        </>
      )}
    </div>
  );
  const actionBar = (
    <Wrapper.ActionBar left={actionBarLeft} right={actionBarRight()} />
  );
  return (
    <Wrapper
      actionBar={actionBar}
      leftSidebar={
        <Sidebar
          loadingMainQuery={loading}
          queryParams={queryParams}
          isAward={false}
        />
      }
      content={content}
    />
  );
};
export default VouchersAward;
