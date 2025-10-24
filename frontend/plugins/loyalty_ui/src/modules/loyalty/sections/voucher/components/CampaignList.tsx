import List from './CampaignList';
import { useVoucherCampaign } from '~/modules/loyalty/sections/voucher/hooks/useVoucher';
import { Spinner } from 'erxes-ui';

type Props = { queryParams: any };

const CampaignList = () => {
  const { list, loading } = useVoucherCampaign();

  if (loading) {
    return <Spinner />;
  }

  return <List {...updatedProps} />;
};
export default CampaignList;
