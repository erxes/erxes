import { Router } from 'express';
import { DacApi } from './api/dac';

const router = Router();

const api = new DacApi();

router.get('/customer', async (req, res) => {
  const { body, query } = req;

  const result = await api.sendRequestToDac({
    method: 'GET',
    path: 'customer',
    query,
    body
  });

  return res.json(result);
});

router.post('/customer', async (req, res) => {
  const { body, query } = req;
  const result = await api.sendRequestToDac({
    method: 'POST',
    path: 'customer',
    query,
    body
  });

  return res.json(result);
});

router.put('/customer', async (req, res) => {
  const { body, query } = req;
  const result = await api.sendRequestToDac({
    method: 'PUT',
    path: 'customer',
    query,
    body
  });

  return res.json(result);
});

router.put('/customer/pin', async (req, res) => {
  const { body, query } = req;
  const result = await api.sendRequestToDac({
    method: 'PUT',
    path: `customer/pin`,
    query,
    body
  });

  return res.json(result);
});

router.post('/vehicle/map', async (req, res) => {
  const { body, query } = req;
  const result = await api.sendRequestToDac({
    method: 'POST',
    path: 'vehicle/map',
    query,
    body
  });

  return res.json(result);
});

router.post('/vehicle', async (req, res) => {
  const { body, query } = req;
  const result = await api.sendRequestToDac({
    method: 'POST',
    path: 'vehicle',
    query,
    body
  });

  return res.json(result);
});

router.put('/vehicle', async (req, res) => {
  const { body, query } = req;
  const result = await api.sendRequestToDac({
    method: 'PUT',
    path: 'vehicle',
    query,
    body
  });

  return res.json(result);
});

router.get('/vehicle/style', async (req, res) => {
  const { body, query } = req;
  const result = await api.sendRequestToDac({
    method: 'GET',
    path: `vehicle/style`,
    query,
    body
  });

  return res.json(result);
});

router.get('/history/loyalty/:cardcode', async (req, res) => {
  const { body, query } = req;
  const result = await api.sendRequestToDac({
    method: 'GET',
    path: `history/loyalty/${req.params.cardcode}`,
    query,
    body
  });

  return res.json(result);
});

router.get('/history/workorder/:cardcode', async (req, res) => {
  const { body, query } = req;
  const result = await api.sendRequestToDac({
    method: 'GET',
    path: `history/workorder/${req.params.cardcode}`,
    query,
    body
  });

  return res.json(result);
});

router.get('/appointment', async (req, res) => {
  const { body, query } = req;
  const result = await api.sendRequestToDac({
    method: 'GET',
    path: `appointment`,
    query,
    body
  });

  return res.json(result);
});

router.post('/appointment', async (req, res) => {
  const { body, query } = req;
  const result = await api.sendRequestToDac({
    method: 'POST',
    path: `appointment`,
    query,
    body
  });

  return res.json(result);
});

router.put('/appointment/cancel', async (req, res) => {
  const { body, query } = req;
  const result = await api.sendRequestToDac({
    method: 'PUT',
    path: `appointment/cancel`,
    query,
    body
  });

  return res.json(result);
});

router.get('/mest', async (req, res) => {
  const { body, query } = req;
  const result = await api.sendRequestToDac({
    method: 'GET',
    path: `mest`,
    query,
    body
  });

  return res.json(result);
});

export default router;
