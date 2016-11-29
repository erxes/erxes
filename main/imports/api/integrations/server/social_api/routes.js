import { Picker } from 'meteor/meteorhacks:picker';

Picker.route('/service/oauth/twitter_callback', (params, req, res) => {
  const url = req.url.replace('service/', '');

  res.writeHead(301, { Location: `/settings/integrations${url}` });
  res.end();
});

Picker.route('/service/oauth/facebook_callback', (params, req, res) => {
  const url = req.url.replace('service/', '');

  res.writeHead(301, { Location: `/settings/integrations${url}` });
  res.end();
});
