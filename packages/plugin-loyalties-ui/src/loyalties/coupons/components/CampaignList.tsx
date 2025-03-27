import { colors } from '@erxes/ui/src';
import { Box, DataWithLoader, Icon } from '@erxes/ui/src/components';
import Dropdown from '@erxes/ui/src/components/Dropdown';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import Tip from '@erxes/ui/src/components/Tip';
import { SidebarList } from '@erxes/ui/src/layout';
import { __, router } from '@erxes/ui/src/utils';
import queryString from 'query-string';
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ICouponCampaign } from '../../../configs/couponCampaign/types';
import { ExtraButtons } from '../../../styles';

interface IProps {
  queryParams: any;
  couponCampaigns: ICouponCampaign[];
  loading: boolean;
}

const CampaignList = (props: IProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const { queryParams, couponCampaigns, loading } = props;

  const clearCategoryFilter = () => {
    router.removeParams(navigate, location, 'campaignId');
  };

  const isActive = (id: string) => {
    const currentGroup = queryParams?.campaignId || '';

    return currentGroup === id;
  };

  const renderContent = () => {
    const otherParams = { ...queryParams };
    delete otherParams.campaignId;
    const qryString = queryString.stringify(otherParams);

    const result: React.ReactNode[] = [];

    for (const campaign of couponCampaigns || []) {
      const name = `${campaign.title} `;

      result.push(
        <li key={campaign._id}>
          <Link
            to={`?${qryString}&campaignId=${campaign._id}`}
            className={isActive(campaign?._id || '') ? 'active' : ''}
            style={{ color: colors.linkPrimary, fontWeight: 500 }}
          >
            {name}
          </Link>
        </li>,
      );
    }

    return <SidebarList>{result}</SidebarList>;
  };

  const extraButtons = (
    <ExtraButtons>
      {queryParams['campaignId'] && (
        <Tip text={'Clear Filter'}>
          <Icon icon="times-circle" onClick={() => clearCategoryFilter()} />
        </Tip>
      )}
      <Dropdown as={DropdownToggle} toggleComponent={<Icon icon="cog" />}>
        <Link
          to={`/erxes-plugin-loyalty/settings/coupon`}
          style={{ color: colors.linkPrimary, fontWeight: 500 }}
        >
          {__('Manage Coupon Campaigns')}
        </Link>
      </Dropdown>
    </ExtraButtons>
  );

  return (
    <Box title="Filter by Coupon Campaign" extraButtons={extraButtons} isOpen>
      <DataWithLoader
        data={renderContent()}
        loading={loading}
        emptyText="There is no Coupon Campaigns"
        emptyIcon="folder-2"
        size="small"
      />
    </Box>
  );
};

export default CampaignList;
