import { generateModels } from '@/connectionResolver';
import { getSubdomain } from 'erxes-api-shared/utils';
import { Request, Response } from 'express';

export const incomingWebhookHealthHandler = async (
  req: Request,
  res: Response,
) => {
  const { id } = req.params;

  try {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    const automation = await models.Automations.findOne({
      _id: id,
      status: 'active',
    })
      .select('_id status name')
      .lean();

    if (!automation) {
      return res.status(404).json({
        success: false,
        message: 'Webhook not found or inactive',
      });
    }

    return res.json({
      success: true,
      status: 'active',
      automation: {
        id: automation._id,
        name: automation.name,
        status: automation.status,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 'error',
    });
  }
};
