import { usePromoCode } from '../../../organizations';
import { IContext } from '../../../connectionResolver';

const promoMutations = {
  async usePromoCode(
    _root,
    { code }: { code: string },
    { subdomain, models }: IContext,
  ) {
    const promoCode = await usePromoCode({ subdomain, code, models });

    return promoCode;
  },
};

export default promoMutations;
