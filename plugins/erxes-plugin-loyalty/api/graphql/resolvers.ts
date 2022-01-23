import donate from './resolvers/donate';
import donateCompaign from './resolvers/donateCompaign';
import lottery from './resolvers/lottery';
import lotteryCompaign from './resolvers/lotteryCompaign';
import spin from './resolvers/spin';
import spinCompaign from './resolvers/spinCompaign';
import voucher from './resolvers/voucher';
import voucherCompaign from './resolvers/voucherCompaign';

const resolvers = [
  ...voucherCompaign,
  ...voucher,
  ...donateCompaign,
  ...donate,
  ...spinCompaign,
  ...spin,
  ...lotteryCompaign,
  ...lottery,
]

export default resolvers;