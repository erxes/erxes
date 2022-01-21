import voucher from "./resolvers/voucher";
import voucherCompaign from "./resolvers/voucherCompaign";

const resolvers = [
  ...voucherCompaign,
  ...voucher,
]

export default resolvers;