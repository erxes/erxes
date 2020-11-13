const SqlString = require('sqlstring');
const ElasticSearchDriver = require('@cubejs-backend/elasticsearch-driver');

class ModifiedElasticSearchDriver extends ElasticSearchDriver {
  constructor(config) {
    super({
      url: process.env.CUBEJS_DB_URL,
      openDistro: false,
      ...config
    });
  }

  async query(query, values) {
    try {
      const result = (
        await this.sqlClient.sql.query({
          // TODO cursor
          body: {
            query: SqlString.format(query, values)
          }
        })
      ).body;

      // TODO: Clean this up, will need a better identifier than the cloud setting
      if (this.config.xpack) {
        const compiled = result.rows.map(r =>
          result.columns.reduce(
            (prev, cur, idx) => ({ ...prev, [cur.name]: r[idx] }),
            {}
          )
        );

        return compiled;
      }
    } catch (e) {
      if (e.body) {
        throw new Error(JSON.stringify(e.body, null, 2));
      }

      throw e;
    }
  }
}

module.exports = ModifiedElasticSearchDriver;
