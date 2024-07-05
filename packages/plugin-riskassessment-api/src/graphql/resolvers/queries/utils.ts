import { sendCardsMessage } from '../../../messageBroker';
import { CardFilter, CardType } from '../types';

export const generateCardIds = async (
  subdomain: string,
  type: CardType,
  filters: CardFilter[]
) => {
  let cardFilter = {};

  for (const filter of filters) {
    const { name, value, values, regex, operator } = filter;

    cardFilter[name] = regex
      ? { $regex: new RegExp(`^${value}$`, 'i') }
      : value;

    if (!!values?.length) {
      cardFilter[name] = { $in: values };
    }
    
    if(operator){
       cardFilter[name] = { [operator]: value }
    }

  }

  const cards = await sendCardsMessage({
    subdomain,
    action: `${type}s.find`,
    data: cardFilter,
    isRPC: true,
    defaultValue: []
  });

  return cards.map(({ _id }) => _id);
};
