import { getSubdomain } from '@erxes/api-utils/src/core';
import * as dotenv from 'dotenv';
dotenv.config()


import { generateModels } from "../connectionResolver";

const widgetsMiddleware = async (req, res) => {
  const { WIDGETS_DOMAIN } = process.env;

  const domain = WIDGETS_DOMAIN || 'http://localhost:3200'

  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);

  const script = await models.Scripts.findOne({ _id: req.query.id });

  if (!script) {
    return res.end('Not found');
  }

  const generateScript = type => {
    return `
      (function() {
        var script = document.createElement('script');
        script.src = "${domain}/build/${type}Widget.bundle.js";
        script.async = true;
        
        var entry = document.getElementsByTagName('script')[0];
        entry.parentNode.insertBefore(script, entry);
      })();
    `;
  };

  let erxesSettings = '{';
  let includeScripts = '';

  if (script.messengerBrandCode) {
    erxesSettings += `messenger: { brand_id: "${script.messengerBrandCode}" },`;
    includeScripts += generateScript('messenger');
  }

  if (script.kbTopicId) {
    erxesSettings += `knowledgeBase: { topic_id: "${script.kbTopicId}" },`;
    includeScripts += generateScript('knowledgebase');
  }

  if (script.leadMaps) {
    erxesSettings += 'forms: [';

    script.leadMaps.forEach(map => {
      erxesSettings += `{ brand_id: "${map.brandCode}", form_id: "${map.formCode}" },`;
      includeScripts += generateScript('form');
    });

    erxesSettings += '],';
  }

  erxesSettings = `${erxesSettings}}`;

  res.end(`window.erxesSettings=${erxesSettings};${includeScripts}`);
};

export default widgetsMiddleware;
