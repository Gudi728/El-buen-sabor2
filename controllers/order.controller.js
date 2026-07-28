const orderService = require('../services/order.service');

async function createOrder(req, res) {
  const order = await orderService.createOrder(req.body || {});
  return res.status(201).json({ ok: true, data: order });
}

module.exports = {
  createOrder
};
