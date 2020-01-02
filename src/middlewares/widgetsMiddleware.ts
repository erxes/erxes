import { connectionInstance } from '../db/connection';

const widgetsMiddleware = async (req, res) => {
  const { WIDGETS_DOMAIN } = process.env;

  const script = await connectionInstance.connection.db.collection('scripts').findOne({ _id: req.query.id });

  if (!script) {
    res.end('Not found');
  }

  const generateScript = type => {
    return `
      (function() {
        var script = document.createElement('script');
        script.src = "${WIDGETS_DOMAIN}/build/${type}Widget.bundle.js";
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
