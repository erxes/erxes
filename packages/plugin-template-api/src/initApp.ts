import * as bodyParser from 'body-parser';
import app from '@erxes/api-utils/src/app';
import { routeErrorHandling } from '@erxes/api-utils/src/requests';
import { buildFile } from './export';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolver';

const initApp = async () => {
    app.use(
        bodyParser.urlencoded({
            limit: '10mb',
            extended: true,
        }),
    );

    app.use(bodyParser.json({ limit: '10mb' }));

    app.use(bodyParser.raw({ limit: '10mb', type: '*/*' }));

    app.get(`/file-export`, routeErrorHandling(async (req, res) => {
        const { query } = req;

        const subdomain = getSubdomain(req);
        const models = await generateModels(subdomain);

        const result = await buildFile(models, subdomain, query);

        res.attachment(`${result.name}.json`);

        return res.send(result.response)
    }))

    app.post('/file-import', async (req, res) => {
        const data = req.body;

        const subdomain = getSubdomain(req);
        const models = await generateModels(subdomain);

        try {
            await models.Templates.createTemplate(data, subdomain);
            res.status(200).json({ success: true })
        } catch (error) {
            res.status(500).json({ success: false })
        }
    });
}

export default initApp