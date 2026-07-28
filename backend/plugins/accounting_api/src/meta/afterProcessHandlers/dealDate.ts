type DealDateFields = {
  createdAt?: string | Date;
  stageChangedDate?: string | Date;
  closeDate?: string | Date;
};

type DealDateRule = 'alwaysNow' | 'syncedDateOrNow';

const toDate = (value?: string | Date) => {
  if (!value) {
    return;
  }

  const date = value instanceof Date ? value : new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date;
};

const getDefaultDate = ({
  dateRule,
  existingDate,
}: {
  dateRule: DealDateRule;
  existingDate?: Date;
}) => {
  if (dateRule === 'syncedDateOrNow' && existingDate) {
    return existingDate;
  }

  return new Date();
};

export const getDealAccountingDate = ({
  deal,
  dateRule,
  dateType,
  existingDate,
}: {
  deal: DealDateFields;
  dateRule: DealDateRule;
  dateType?: string;
  existingDate?: Date;
}) => {
  const fallbackDate = getDefaultDate({ dateRule, existingDate });
  const createdDate = toDate(deal.createdAt);
  const stageChangedDate = toDate(deal.stageChangedDate);
  const closeDate = toDate(deal.closeDate);

  if (!dateType) {
    return fallbackDate;
  }

  switch (dateType) {
    case 'now':
      return new Date();
    case 'created':
      return createdDate || fallbackDate;
    case 'lastMove':
      return stageChangedDate || fallbackDate;
    case 'closeOrCreated':
      return closeDate || createdDate || fallbackDate;
    case 'closeOrMove':
      return closeDate || stageChangedDate || fallbackDate;
    case 'firstOrMove':
      return existingDate || stageChangedDate || fallbackDate;
    case 'firstOrCreated':
      return existingDate || createdDate || fallbackDate;
    default:
      return fallbackDate;
  }
};
