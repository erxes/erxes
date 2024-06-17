import app from '@erxes/api-utils/src/app';

// controller for golomtbank
const init = async () => {
  app.get('/login', async (req, res) => {
    res.send("login")
  });
  
  app.post('/receive', async (req, res, next) => {
    try {
      // write receive code here

      res.send("Successfully receiving message");
    } catch (e) {
      return next(new Error(e));
    }

    res.sendStatus(200);
  });

};

export default init;
