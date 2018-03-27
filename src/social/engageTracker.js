const overrideContentType = () => {
  return (req, res, next) => {
    if (req.headers['x-amz-sns-message-type']) {
      req.headers['content-type'] = 'application/json;charset=UTF-8';
    }

    next();
  };
};

export const trackEngages = expressApp => {
  expressApp.use(overrideContentType());

  expressApp.get(`/service/engage/tracker`, (req, res) => {
    console.log(req.header, req.body, req.rawBody);

    res.end('success');
  });

  expressApp.post(`/service/engage/tracker`, (req, res) => {
    console.log(req.header, req.body, req.rawBody);

    res.end('success');
  });
};
