import { router } from '../routes';

jest.mock('@/integrations/whatsapp/controller/webhook', () => ({
  receiveWhatsappWebhook: jest.fn(),
  verifyWhatsappWebhook: jest.fn(),
}));

type RouteLayer = {
  route?: { path: string | string[]; methods: Record<string, boolean> };
};

const routes = (router.stack as RouteLayer[]).flatMap(({ route }) =>
  route
    ? [{ path: route.path, methods: Object.keys(route.methods).sort() }]
    : [],
);

describe('WhatsApp webhook routes', () => {
  it('serves only /receive, like the other integrations', () => {
    expect(routes).toEqual([
      { path: '/receive', methods: ['get'] },
      { path: '/receive', methods: ['post'] },
    ]);
  });
});
