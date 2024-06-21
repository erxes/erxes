module.exports = {
  beforeRow: 'yarn build plugin payment',
  additionalBuildSteps: [
    'cd erxes/packages/plugin-payment-api',
    'yarn install',
    'yarn build:client',
  ],
};
