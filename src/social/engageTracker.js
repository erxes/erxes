export const trackEngages = expressApp => {
  expressApp.get(`/service/engage/tracker`, (req, res) => {
    console.log(req.header, req.body);

    res.end('success');
  });

  expressApp.post(`/service/engage/tracker`, (req, res) => {
    console.log(req.header, req.body);

    res.end('success');
  });
};
