const { tableSchema } = require('../tablePrefix');

cube(`Cars`, {
  sql: `SELECT * FROM ${tableSchema()}.cars`,

  preAggregations: {
    // Pre-Aggregations definitions go here
    // Learn more here: https://cube.dev/docs/caching/pre-aggregations/getting-started
  },

  joins: {
    CarCategories: {
      sql: `${CUBE}.categoryId = ${CarCategories}._id`,
      relationship: `belongsTo`
    },
    Conformities: {
      sql: `${CUBE}._id = ${Conformities}.relTypeId or ${CUBE}._id = ${Conformities}.mainTypeId `,
      relationship: `belongsTo`
    }
  },

  measures: {
    count: {
      type: `count`
    }
  },

  dimensions: {
    _id: {
      sql: `${CUBE}.\`_id\``,
      type: `string`,
      primaryKey: true
    },

    bowtype: {
      sql: `${CUBE}.\`bowType\``,
      type: `string`,
      title: 'Bow Type'
    },

    braketype: {
      sql: `${CUBE}.\`brakeType\``,
      type: `string`,
      title: 'Brake Type'
    },

    carmodel: {
      sql: `${CUBE}.\`carModel\``,
      type: `string`,
      title: 'Car Model'
    },

    categoryid: {
      sql: `${CarCategories}.\`name\``,
      type: `string`,
      title: 'Category'
    },

    drivingclassification: {
      sql: `${CUBE}.\`drivingClassification\``,
      type: `string`
    },

    enginecapacity: {
      sql: `${CUBE}.\`engineCapacity\``,
      type: `string`
    },

    fueltype: {
      sql: `${CUBE}.\`fuelType\``,
      type: `string`,
      title: 'Fuel Type'
    },

    intervalvalue: {
      sql: `${CUBE}.\`intervalValue\``,
      type: `string`
    },

    manufacture: {
      sql: `manufacture`,
      type: `string`,
      title: 'Manufacture'
    },

    mark: {
      sql: `mark`,
      type: `string`
    },

    ownerby: {
      sql: `${CUBE}.\`ownerBy\``,
      type: `string`
    },

    platenumber: {
      sql: `${CUBE}.\`plateNumber\``,
      type: `string`
    },

    steeringaxis: {
      sql: `${CUBE}.\`steeringAxis\``,
      type: `string`
    },

    totalaxis: {
      sql: `${CUBE}.\`totalAxis\``,
      type: `string`
    },

    trailertype: {
      sql: `${CUBE}.\`trailerType\``,
      type: `string`,
      title: 'Trailer Type'
    },

    transmission: {
      sql: `transmission`,
      type: `string`,
      title: 'Transmission'
    },

    type: {
      sql: `type`,
      type: `string`,
      title: 'Type'
    },

    reltypecustomer: {
      sql: `${Conformities.reltypecustomer}`,
      type: `string`,
      title: 'Rel-Type Customer'
    },

    vinnumber: {
      sql: `${CUBE}.\`vinNumber\``,
      type: `string`
    },

    createdat: {
      sql: `${CUBE}.\`createdAt\``,
      type: `time`,
      title: 'Created Date'
    },

    modifiedat: {
      sql: `${CUBE}.\`modifiedAt\``,
      type: `time`,
      title: 'Modified Date'
    }
  },

  dataSource: `default`
});
