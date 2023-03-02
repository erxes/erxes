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
