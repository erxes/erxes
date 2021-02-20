import * as mongoose from 'mongoose';
import * as os from 'os';
import { Configs, Pipelines, Stages } from '../../../db/models';
import { DEFAULT_CONSTANT_VALUES } from '../../../db/models/definitions/constants';
import { fetchElk } from '../../../elasticsearch';
import { moduleRequireLogin } from '../../permissions/wrappers';
import { getEnv, getErxesSaasDomain, readFile, sendRequest } from '../../utils';

const doSearch = async (index, value, fields) => {
  const highlightFields = {};

  fields.forEach(field => {
    highlightFields[field] = {};
  });

  const fetchResults = await fetchElk('search', index, {
    query: {
      multi_match: {
        query: value,
        fields
      }
    },
    size: 10,
    highlight: {
      fields: highlightFields
    }
  });

  const results = fetchResults.hits.hits.map(result => {
    return {
      source: {
        _id: result._id,
        ...result._source
      },
      highlight: result.highlight
    };
  });

  return results;
};

const configQueries = {
  /**
   * Config object
   */
  configs(_root) {
    return Configs.find({});
  },

  async configsGetVersion(_root, { releaseNotes }) {
    const result = {
      version: '-',
      isUsingRedis: Boolean(process.env.REDIS_HOST),
      isUsingRabbitMQ: Boolean(process.env.RABBITMQ_HOST),
      isUsingElkSyncer: Boolean(process.env.ELK_SYNCER !== 'false'),
      isLatest: false,
      releaseInfo: {}
    };

    const erxesDomain = getEnv({ name: 'MAIN_APP_DOMAIN' });

    const erxesVersion = await sendRequest({
      url: `${erxesDomain}/version.json`,
      method: 'GET'
    });

    result.version = erxesVersion.packageVersion || '-';

    const response = await sendRequest({
      url: `${process.env.CORE_URL || 'https://erxes.io'}/git-release-info`,
      method: 'GET'
    });

    result.isLatest = result.version === response.tag_name;

    if (releaseNotes) {
      result.releaseInfo = response;
    }

    return result;
  },

  async configsStatus(_root, _args) {
    const status: any = {
      erxesApi: {},
      erxesIntegration: {}
    };

    const { version, storageEngine } = await mongoose.connection.db.command({
      serverStatus: 1
    });

    status.erxesApi.os = {
      type: os.type(),
      platform: os.platform(),
      arch: os.arch(),
      release: os.release(),
      uptime: os.uptime(),
      loadavg: os.loadavg(),
      totalmem: os.totalmem(),
      freemem: os.freemem(),
      cpuCount: os.cpus().length
    };

    status.erxesApi.process = {
      nodeVersion: process.version,
      pid: process.pid,
      uptime: process.uptime()
    };

    status.erxesApi.mongo = {
      version,
      storageEngine: storageEngine.name
    };

    return status;
  },

  configsGetEnv(_root) {
    return {
      USE_BRAND_RESTRICTIONS: process.env.USE_BRAND_RESTRICTIONS
    };
  },

  configsConstants(_root) {
    return {
      allValues: Configs.constants(),
      defaultValues: DEFAULT_CONSTANT_VALUES
    };
  },

  async configsCheckActivateInstallation(_root, args: { hostname: string }) {
    try {
      return await sendRequest({
        method: 'POST',
        url: `${getErxesSaasDomain()}/check-activate-installation`,
        body: args
      });
    } catch (e) {
      throw new Error(e.message);
    }
  },

  configsGetEmailTemplate(_root, { name }: { name?: string }) {
    return readFile(name || 'base');
  },

  async search(_root, { value }: { value: string }) {
    const searchBoardItems = async index => {
      const items = await doSearch(index, value, ['name', 'description']);

      const updatedItems: any = [];

      for (const item of items) {
        const stage = (await Stages.findOne({ _id: item.source.stageId })) || {
          pipelineId: ''
        };
        const pipeline = (await Pipelines.findOne({
          _id: stage.pipelineId
        })) || { boardId: '' };

        item.source.pipelineId = stage.pipelineId;
        item.source.boardId = pipeline.boardId;

        updatedItems.push(item);
      }

      return updatedItems;
    };

    const results = [
      {
        module: 'conversationMessages',
        items: await doSearch('conversation_messages', value, ['content'])
      },
      {
        module: 'contacts',
        items: await doSearch('customers', value, [
          'code',
          'firstName',
          'lastName',
          'primaryPhone',
          'primaryEmail'
        ])
      },
      {
        module: 'companies',
        items: await doSearch('companies', value, [
          'primaryName',
          'industry',
          'plan',
          'primaryEmail',
          'primaryPhone',
          'businessType',
          'description',
          'website',
          'code'
        ])
      },
      {
        module: 'tasks',
        items: await searchBoardItems('tasks')
      },
      {
        module: 'tickets',
        items: await searchBoardItems('tickets')
      },
      {
        module: 'deals',
        items: await searchBoardItems('deals')
      },
      {
        module: 'stages',
        items: await doSearch('stages', value, ['name'])
      },
      {
        module: 'pipelines',
        items: await doSearch('pipelines', value, ['name'])
      },
      {
        module: 'engageMessages',
        items: await doSearch('engage_messages', value, ['title'])
      }
    ];

    return results;
  }
};

moduleRequireLogin(configQueries);

export default configQueries;
