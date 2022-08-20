import { router, Tabs, TabTitle } from '@erxes/ui/src';
import { Button, ModalTrigger } from '@erxes/ui/src/components';
import { Wrapper } from '@erxes/ui/src/layout';
import { MainStyleTitle as Title } from '@erxes/ui/src/styles/eindex';
import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import {
  ILotteryCampaign,
  LotteryCampaignDetailQueryResponse
} from '../../../configs/lotteryCampaign/types';
import { TriggerTabs } from '../../../styles';
import AwardContent from '../containers/award/content';
import AwardDetail from '../containers/award/detail';
import Sidebar from './Sidebar';

interface IProps extends IRouterProps {
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
  history: any;
}
type State = {
  searchValue?: string;
  currentTab?: any;
  currentAwardId?: string;
  currentAwardCount?: number;
  isOpenNextChar?: boolean;
  multiple?: number;
  potentailAwardCount?: number;
};
class VouchersAward extends React.Component<IProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: '',
      currentAwardId: '',
      potentailAwardCount: 0,
      currentAwardCount: 0,
      isOpenNextChar: false,
      multiple: 0
    };
  }
  onClick(currentTab: any) {
    this.setState({
      currentTab
    });
    router.setParams(this.props.history, { awardId: currentTab._id });
  }

  render() {
    const { loading, queryParams, lotteryCampaignDetailQuery } = this.props;
    const { currentTab } = this.state;
    const lotteryCampaign = lotteryCampaignDetailQuery.lotteryCampaignDetail;

    const actionBarLeft = <Title>{'Lottery Award'} </Title>;

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
        queryParams: { ids }
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
      queryParams: { ...this.props.queryParams, awardId: currentTab._id },
      nextChar: '',
      currentTab,
      lotteryCampaign
    };

    const content = (
      <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
        <TriggerTabs>
          <Tabs full={true}>
            {lotteryCampaign?.awards &&
              lotteryCampaign?.awards.map(p => (
                <TabTitle
                  className={currentTab?._id === p._id ? 'active' : ''}
                  onClick={this.onClick.bind(this, p)}
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
            history={history}
            isAward={false}
          />
        }
        content={content}
      />
    );
  }
}
export default VouchersAward;
