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

  traverseAggregations(aggregations) {
    const fields = Object.keys(aggregations).filter(
      k => k !== 'key' && k !== 'doc_count'
    );
    if (fields.find(f => aggregations[f].hasOwnProperty('value'))) {
      return [
        fields
          .map(f => ({ [f]: aggregations[f].value }))
          .reduce((a, b) => ({ ...a, ...b }))
      ];
    }
    if (fields.length === 0) {
      return [{}];
    }
    if (fields.length !== 1) {
      throw new Error(`Unexpected multiple fields at ${fields.join(', ')}`);
    }
    const dimension = fields[0];
    if (!aggregations[dimension].buckets) {
      throw new Error(
        `Expecting buckets at dimension ${dimension}: ${aggregations[dimension]}`
      );
    }
    return aggregations[dimension].buckets
      .map(b =>
        this.traverseAggregations(b).map(innerRow => ({
          ...innerRow,
          [dimension]: b.key
        }))
      )
      .reduce((a, b) => a.concat(b), []);
  }

  async tablesSchema() {
    const indices = await this.client.cat.indices({
      format: 'json'
    });

    const schema = (
      await Promise.all(
        indices.body.map(async i => {
          const props =
            (await this.client.indices.getMapping({ index: i.index })).body[
              i.index
            ].mappings.properties || {};
          return {
            [i.index]: Object.keys(props)
              .map(p => ({ name: p, type: props[p].type }))
              .filter(c => !!c.type)
          };
        })
      )
    ).reduce((a, b) => ({ ...a, ...b }));

    return {
      main: schema
    };
  }
}

module.exports = ModifiedElasticSearchDriver;
