import { sendCommonMessage } from '../../../messageBroker';
import { CardFilter, CardType } from '../types';

export const generateCardIds = async (
  subdomain: string,
  type: CardType,
  filters: CardFilter[]
) => {
  let cardFilter = {};

  for (const filter of filters) {
    const { name, value, values, regex, operator } = filter;
    if (operator) {
      cardFilter[name] = { [operator]: value };
      continue;
    }

    if (!!values?.length) {
      cardFilter[name] = {
        $in: regex ? values.map(value => new RegExp(`${value}`, 'i')) : values,
      };
      continue;
    }

    cardFilter[name] = regex
      ? { $regex: new RegExp(`^${value}$`, 'i') }
      : value;
  }

  const cards = await sendCommonMessage({
    serviceName: `${type}s`,
    subdomain,
    action: `${type}s.find`,
    data: cardFilter,
    isRPC: true,
    defaultValue: [],
  });

  return cards.map(({ _id }) => _id);
};
