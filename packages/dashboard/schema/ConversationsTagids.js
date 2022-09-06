cube(`ConversationsTagids`, {
  sql: `SELECT * FROM erxes.\`conversations_tagIds\``,
  
  preAggregations: {
    // Pre-Aggregations definitions go here
    // Learn more here: https://cube.dev/docs/caching/pre-aggregations/getting-started  
  },
  
  joins: {
    
  },
  
  measures: {
    count: {
      type: `count`,
      drillMembers: [tagids]
    }
  },
  
  dimensions: {
    tagids: {
      sql: `${CUBE}.\`tagIds\``,
      type: `string`
    }
  },
  
  dataSource: `default`
});
