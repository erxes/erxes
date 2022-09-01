const ModifiedElasticSearchDriver = require('./driver.js');

module.exports = {
  driverFactory: ({ dataSource }) => {
    return new ModifiedElasticSearchDriver({
      xpack: true,
      dataSource
    });
  }
};
