type ReportLocation = {
  pathname: string;
  search: string;
};

const queryParamByGroup: Record<string, string> = {
  accountCategoryId: 'accountCategoryId',
  accountId: 'accountIds',
  branchId: 'branchId',
  departmentId: 'departmentId',
  customerId: 'customerId',
  productId: 'productIds',
  fixedAssetId: 'fixedAssetIds',
  journal: 'journal',
  createdBy: 'createdUserId',
  contentId: 'contentId',
  contentType: 'contentType',
  ptrId: 'ptrId',
};

const getDatePart = (value: string) => {
  const isoDate = value.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  if (isoDate) {
    return isoDate;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getReportGroupsFromAttr = (attr: string) =>
  attr
    .split(/[,*]/)
    .map((entry) => {
      const separatorIndex = entry.indexOf('+');
      if (separatorIndex < 1) {
        return { group: '', id: '' };
      }

      return {
        group: entry.slice(0, separatorIndex),
        id: entry.slice(separatorIndex + 1),
      };
    })
    .filter(({ group, id }) => group && id);

export const buildDetailedReportPath = (
  location: ReportLocation,
  report: string,
  attr: string,
) => {
  const params = new URLSearchParams(location.search);

  params.set('report', report);
  params.set('isMore', 'true');

  getReportGroupsFromAttr(attr).forEach(({ group, id }) => {
    if (group === 'date') {
      const datePart = getDatePart(id);
      if (datePart) {
        params.set('fromDate', `${datePart} 00:00:00`);
        params.set('toDate', `${datePart} 23:59:59.999`);
      }
      return;
    }

    const queryParam = queryParamByGroup[group];
    if (queryParam) {
      params.set(queryParam, id);
    }
  });

  return `${location.pathname}?${params.toString()}`;
};
