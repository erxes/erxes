import { generatePaginationParams } from '@erxes/ui/src/utils/router';

export const generateParams = queryParams => ({
  ...generatePaginationParams(queryParams || {}),
  startDate: queryParams.startDate,
  endDate: queryParams.endDate,
  userIds: queryParams.userIds,
  departmentIds: queryParams.departmentIds,
  branchIds: queryParams.branchIds
});

export const returnDeviceTypes = deviceType => {
  let checkInDevice;
  let checkOutDevice;
  const getDeviceNames = deviceType && deviceType.split('x');

  if (getDeviceNames) {
    if (getDeviceNames.length === 2) {
      checkInDevice = getDeviceNames[0];
      checkOutDevice = getDeviceNames[1];
    } else {
      checkInDevice = getDeviceNames[0];
      checkOutDevice = getDeviceNames[0];
    }
  }

  return [checkInDevice, checkOutDevice];
};
