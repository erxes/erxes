import { IPermissionConfig } from 'erxes-api-shared/core-types';

export const permissions: IPermissionConfig = {
  plugin: 'loyalty',

  modules: [
    {
      name: 'agent',
      description: 'Agent management',
      scopeField: null,
      ownerFields: [],

      scopes: [
        { name: 'own', description: 'Records user created' },
        { name: 'all', description: 'All records' },
      ],

      actions: [
        {
          title: 'View agents',
          name: 'agentView',
          description: 'View agent records',
          always: true,
        },
        {
          title: 'Create agent',
          name: 'agentCreate',
          description: 'Create agent records',
        },
        {
          title: 'Edit agent',
          name: 'agentUpdate',
          description: 'Edit agent records',
        },
        {
          title: 'Delete agent',
          name: 'agentRemove',
          description: 'Delete agent records',
        },
      ],
    },
    {
      name: 'assignment',
      description: 'Assignment management',
      scopeField: null,
      ownerFields: [],

      scopes: [
        { name: 'own', description: 'Records user created' },
        { name: 'all', description: 'All records' },
      ],

      actions: [
        {
          title: 'View assignments',
          name: 'assignmentView',
          description: 'View assignment records',
          always: true,
        },
        {
          title: 'Create assignment',
          name: 'assignmentCreate',
          description: 'Create assignment records',
        },
        {
          title: 'Delete assignment',
          name: 'assignmentRemove',
          description: 'Delete assignment records',
        },
      ],
    },
    {
      name: 'assignmentCampaign',
      description: 'Assignment campaign management',
      scopeField: null,
      ownerFields: [],

      scopes: [
        { name: 'own', description: 'Records user created' },
        { name: 'all', description: 'All records' },
      ],

      actions: [
        {
          title: 'View assignment campaigns',
          name: 'assignmentCampaignView',
          description: 'View assignment campaign records',
          always: true,
        },
        {
          title: 'Create assignment campaign',
          name: 'assignmentCampaignCreate',
          description: 'Create assignment campaign records',
        },
        {
          title: 'Edit assignment campaign',
          name: 'assignmentCampaignEdit',
          description: 'Edit assignment campaign records',
        },
        {
          title: 'Delete assignment campaign',
          name: 'assignmentCampaignRemove',
          description: 'Delete assignment campaign records',
        },
      ],
    },
    {
      name: 'config',
      description: 'Loyalty configuration',
      scopeField: null,
      ownerFields: [],

      scopes: [
        { name: 'own', description: 'Records user created' },
        { name: 'all', description: 'All records' },
      ],

      actions: [
        {
          title: 'View loyalty configs',
          name: 'loyaltyConfigView',
          description: 'View loyalty configuration',
          always: true,
        },
        {
          title: 'Update loyalty configs',
          name: 'loyaltyConfigUpdate',
          description: 'Update loyalty configuration',
        },
      ],
    },
    {
      name: 'loyalty',
      description: 'Loyalty operations',
      scopeField: null,
      ownerFields: [],

      scopes: [
        { name: 'own', description: 'Records user created' },
        { name: 'all', description: 'All records' },
      ],

      actions: [
        {
          title: 'View loyalty data',
          name: 'loyaltyView',
          description: 'View loyalty records',
          always: true,
        },
        {
          title: 'Check loyalty',
          name: 'loyaltyCheck',
          description: 'Check voucher eligibility',
        },
        {
          title: 'Share score',
          name: 'loyaltyShareScore',
          description: 'Share loyalty points between users',
        },
        {
          title: 'Confirm voucher sale',
          name: 'loyaltyConfirmVoucher',
          description: 'Confirm voucher usage in sale',
        },
      ],
    },
    {
      name: 'coupon',
      description: 'Coupon management',
      scopeField: null,
      ownerFields: [],

      scopes: [
        { name: 'own', description: 'Records user created' },
        { name: 'all', description: 'All records' },
      ],

      actions: [
        {
          title: 'View coupons',
          name: 'couponView',
          description: 'View coupon records',
          always: true,
        },
        {
          title: 'Create coupon',
          name: 'couponCreate',
          description: 'Create coupon records',
        },
        {
          title: 'Edit coupon',
          name: 'couponEdit',
          description: 'Edit coupon records',
        },
        {
          title: 'Delete coupon',
          name: 'couponRemove',
          description: 'Delete coupon records',
        },
      ],
    },
    {
      name: 'couponCampaign',
      description: 'Coupon campaign management',
      scopeField: null,
      ownerFields: [],

      scopes: [
        { name: 'own', description: 'Records user created' },
        { name: 'all', description: 'All records' },
      ],

      actions: [
        {
          title: 'View coupon campaigns',
          name: 'couponCampaignView',
          description: 'View coupon campaign records',
          always: true,
        },
        {
          title: 'Create coupon campaign',
          name: 'couponCampaignCreate',
          description: 'Create coupon campaign records',
        },
        {
          title: 'Edit coupon campaign',
          name: 'couponCampaignEdit',
          description: 'Edit coupon campaign records',
        },
        {
          title: 'Delete coupon campaign',
          name: 'couponCampaignRemove',
          description: 'Delete coupon campaign records',
        },
      ],
    },
    {
      name: 'donate',
      description: 'Donation management',
      scopeField: null,
      ownerFields: ['ownerId'], // Added for own-scope isolation

      scopes: [
        { name: 'own', description: 'Records user created' },
        { name: 'all', description: 'All records' },
      ],

      actions: [
        {
          title: 'View donations',
          name: 'donateView',
          description: 'View donation records',
          always: true,
        },
        {
          title: 'Create donation',
          name: 'donateCreate',
          description: 'Create donation records',
        },
        {
          title: 'Edit donation',
          name: 'donateEdit',
          description: 'Edit donation records',
        },
        {
          title: 'Delete donation',
          name: 'donateRemove',
          description: 'Delete donation records',
        },
      ],
    },
    {
      name: 'donateCampaign',
      description: 'Donation campaign management',
      scopeField: null,
      ownerFields: [],

      scopes: [
        { name: 'own', description: 'Records user created' },
        { name: 'all', description: 'All records' },
      ],

      actions: [
        {
          title: 'View donation campaigns',
          name: 'donateCampaignView',
          description: 'View donation campaign records',
          always: true,
        },
        {
          title: 'Create donation campaign',
          name: 'donateCampaignCreate',
          description: 'Create donation campaign records',
        },
        {
          title: 'Edit donation campaign',
          name: 'donateCampaignEdit',
          description: 'Edit donation campaign records',
        },
        {
          title: 'Delete donation campaign',
          name: 'donateCampaignRemove',
          description: 'Delete donation campaign records',
        },
      ],
    },
    {
      name: 'lottery',
      description: 'Lottery management',
      scopeField: null,
      ownerFields: [],

      scopes: [
        { name: 'own', description: 'Records user created' },
        { name: 'all', description: 'All records' },
      ],

      actions: [
        {
          title: 'View lotteries',
          name: 'lotteryView',
          description: 'View lottery records',
          always: true,
        },
        {
          title: 'Create lottery',
          name: 'lotteryCreate',
          description: 'Create lottery records',
        },
        {
          title: 'Edit lottery',
          name: 'lotteryEdit',
          description: 'Edit lottery records',
        },
        {
          title: 'Delete lottery',
          name: 'lotteryRemove',
          description: 'Delete lottery records',
        },
        {
          title: 'Buy lottery ticket',
          name: 'lotteryBuy',
          description: 'Purchase lottery ticket',
        },
      ],
    },
    {
      name: 'lotteryCampaign',
      description: 'Lottery campaign management',
      scopeField: null,
      ownerFields: [],

      scopes: [
        { name: 'own', description: 'Records user created' },
        { name: 'all', description: 'All records' },
      ],

      actions: [
        {
          title: 'View lottery campaigns',
          name: 'lotteryCampaignView',
          description: 'View lottery campaign records',
          always: true,
        },
        {
          title: 'Create lottery campaign',
          name: 'lotteryCampaignCreate',
          description: 'Create lottery campaign records',
        },
        {
          title: 'Edit lottery campaign',
          name: 'lotteryCampaignEdit',
          description: 'Edit lottery campaign records',
        },
        {
          title: 'Delete lottery campaign',
          name: 'lotteryCampaignRemove',
          description: 'Delete lottery campaign records',
        },
        {
          title: 'Perform lottery draw',
          name: 'lotteryCampaignDo',
          description: 'Execute lottery draw',
        },
      ],
    },
    {
      name: 'pricing',
      description: 'Pricing management',
      scopeField: null,
      ownerFields: [],

      scopes: [
        { name: 'own', description: 'Records user created' },
        { name: 'all', description: 'All records' },
      ],

      actions: [
        {
          title: 'View pricing',
          name: 'pricingView',
          description: 'View pricing records',
          always: true,
        },
        {
          title: 'Create pricing',
          name: 'pricingCreate',
          description: 'Create pricing records',
        },
        {
          title: 'Edit pricing',
          name: 'pricingUpdate',
          description: 'Edit pricing records',
        },
        {
          title: 'Delete pricing',
          name: 'pricingRemove',
          description: 'Delete pricing records',
        },
      ],
    },
    {
      name: 'pricingPlan',
      description: 'Pricing plan management',
      scopeField: null,
      ownerFields: [],

      scopes: [
        { name: 'own', description: 'Records user created' },
        { name: 'all', description: 'All records' },
      ],

      actions: [
        {
          title: 'View pricing plans',
          name: 'pricingPlanView',
          description: 'View pricing plan records',
          always: true,
        },
        {
          title: 'Create pricing plan',
          name: 'pricingPlanCreate',
          description: 'Create pricing plan records',
        },
        {
          title: 'Edit pricing plan',
          name: 'pricingPlanUpdate',
          description: 'Edit pricing plan records',
        },
        {
          title: 'Delete pricing plan',
          name: 'pricingPlanRemove',
          description: 'Delete pricing plan records',
        },
      ],
    },
    {
      name: 'scoreCampaign',
      description: 'Score campaign management',
      scopeField: null,
      ownerFields: [],

      scopes: [
        { name: 'own', description: 'Records user created' },
        { name: 'all', description: 'All records' },
      ],

      actions: [
        {
          title: 'View score campaigns',
          name: 'scoreCampaignView',
          description: 'View score campaign records',
          always: true,
        },
        {
          title: 'Create score campaign',
          name: 'scoreCampaignCreate',
          description: 'Create score campaign records',
        },
        {
          title: 'Edit score campaign',
          name: 'scoreCampaignUpdate',
          description: 'Edit score campaign records',
        },
        {
          title: 'Delete score campaign',
          name: 'scoreCampaignRemove',
          description: 'Delete score campaign records',
        },
        {
          title: 'Refund loyalty score',
          name: 'scoreRefund',
          description: 'Refund points to user',
        },
      ],
    },
    {
      name: 'scoreLog',
      description: 'Score log management',
      scopeField: null,
      ownerFields: ['ownerId'], // Added for own-scope isolation

      scopes: [
        { name: 'own', description: 'Records user created' },
        { name: 'all', description: 'All records' },
      ],

      actions: [
        {
          title: 'View score logs',
          name: 'scoreLogView',
          description: 'View score log records',
          always: true,
        },
        {
          title: 'Change score',
          name: 'scoreLogChange',
          description: 'Manually adjust user score',
        },
      ],
    },
    {
      name: 'spin',
      description: 'Spin management',
      scopeField: null,
      ownerFields: [],

      scopes: [
        { name: 'own', description: 'Records user created' },
        { name: 'all', description: 'All records' },
      ],

      actions: [
        {
          title: 'View spins',
          name: 'spinView',
          description: 'View spin records',
          always: true,
        },
        {
          title: 'Create spin',
          name: 'spinCreate',
          description: 'Create spin records',
        },
        {
          title: 'Edit spin',
          name: 'spinEdit',
          description: 'Edit spin records',
        },
        {
          title: 'Delete spin',
          name: 'spinRemove',
          description: 'Delete spin records',
        },
        {
          title: 'Buy spin',
          name: 'spinBuy',
          description: 'Purchase a spin',
        },
        {
          title: 'Execute spin',
          name: 'spinDo',
          description: 'Perform a spin',
        },
      ],
    },
    {
      name: 'spinCampaign',
      description: 'Spin campaign management',
      scopeField: null,
      ownerFields: [],

      scopes: [
        { name: 'own', description: 'Records user created' },
        { name: 'all', description: 'All records' },
      ],

      actions: [
        {
          title: 'View spin campaigns',
          name: 'spinCampaignView',
          description: 'View spin campaign records',
          always: true,
        },
        {
          title: 'Create spin campaign',
          name: 'spinCampaignCreate',
          description: 'Create spin campaign records',
        },
        {
          title: 'Edit spin campaign',
          name: 'spinCampaignEdit',
          description: 'Edit spin campaign records',
        },
        {
          title: 'Delete spin campaign',
          name: 'spinCampaignRemove',
          description: 'Delete spin campaign records',
        },
      ],
    },
    {
      name: 'voucher',
      description: 'Voucher management',
      scopeField: null,
      ownerFields: [],

      scopes: [
        { name: 'own', description: 'Records user created' },
        { name: 'all', description: 'All records' },
      ],

      actions: [
        {
          title: 'View vouchers',
          name: 'voucherView',
          description: 'View voucher records',
          always: true,
        },
        {
          title: 'Create voucher',
          name: 'voucherCreate',
          description: 'Create voucher records',
        },
        {
          title: 'Edit voucher',
          name: 'voucherEdit',
          description: 'Edit voucher records',
        },
        {
          title: 'Delete voucher',
          name: 'voucherRemove',
          description: 'Delete voucher records',
        },
        {
          title: 'Buy voucher',
          name: 'voucherBuy',
          description: 'Purchase a voucher',
        },
      ],
    },
    {
      name: 'voucherCampaign',
      description: 'Voucher campaign management',
      scopeField: null,
      ownerFields: [],

      scopes: [
        { name: 'own', description: 'Records user created' },
        { name: 'all', description: 'All records' },
      ],

      actions: [
        {
          title: 'View voucher campaigns',
          name: 'voucherCampaignView',
          description: 'View voucher campaign records',
          always: true,
        },
        {
          title: 'Create voucher campaign',
          name: 'voucherCampaignCreate',
          description: 'Create voucher campaign records',
        },
        {
          title: 'Edit voucher campaign',
          name: 'voucherCampaignEdit',
          description: 'Edit voucher campaign records',
        },
        {
          title: 'Delete voucher campaign',
          name: 'voucherCampaignRemove',
          description: 'Delete voucher campaign records',
        },
      ],
    },
  ],

  defaultGroups: [
    {
      id: 'loyalty:admin',
      name: 'Loyalty Admin',
      description: 'Full access to Loyalty plugin',
      permissions: [
        {
          plugin: 'loyalty',
          module: 'agent',
          actions: ['agentView', 'agentCreate', 'agentUpdate', 'agentRemove'],
          scope: 'all',
        },
        {
          plugin: 'loyalty',
          module: 'assignment',
          actions: ['assignmentView', 'assignmentCreate', 'assignmentRemove'],
          scope: 'all',
        },
        {
          plugin: 'loyalty',
          module: 'assignmentCampaign',
          actions: [
            'assignmentCampaignView',
            'assignmentCampaignCreate',
            'assignmentCampaignEdit',
            'assignmentCampaignRemove',
          ],
          scope: 'all',
        },
        {
          plugin: 'loyalty',
          module: 'config',
          actions: ['loyaltyConfigView', 'loyaltyConfigUpdate'],
          scope: 'all',
        },
        {
          plugin: 'loyalty',
          module: 'loyalty',
          actions: [
            'loyaltyView',
            'loyaltyCheck',
            'loyaltyShareScore',
            'loyaltyConfirmVoucher',
          ],
          scope: 'all',
        },
        {
          plugin: 'loyalty',
          module: 'coupon',
          actions: [
            'couponView',
            'couponCreate',
            'couponEdit',
            'couponRemove',
          ],
          scope: 'all',
        },
        {
          plugin: 'loyalty',
          module: 'couponCampaign',
          actions: [
            'couponCampaignView',
            'couponCampaignCreate',
            'couponCampaignEdit',
            'couponCampaignRemove',
          ],
          scope: 'all',
        },
        {
          plugin: 'loyalty',
          module: 'donate',
          actions: ['donateView', 'donateCreate', 'donateEdit', 'donateRemove'],
          scope: 'all',
        },
        {
          plugin: 'loyalty',
          module: 'donateCampaign',
          actions: [
            'donateCampaignView',
            'donateCampaignCreate',
            'donateCampaignEdit',
            'donateCampaignRemove',
          ],
          scope: 'all',
        },
        {
          plugin: 'loyalty',
          module: 'lottery',
          actions: [
            'lotteryView',
            'lotteryCreate',
            'lotteryEdit',
            'lotteryRemove',
            'lotteryBuy',
          ],
          scope: 'all',
        },
        {
          plugin: 'loyalty',
          module: 'lotteryCampaign',
          actions: [
            'lotteryCampaignView',
            'lotteryCampaignCreate',
            'lotteryCampaignEdit',
            'lotteryCampaignRemove',
            'lotteryCampaignDo',
          ],
          scope: 'all',
        },
        {
          plugin: 'loyalty',
          module: 'pricing',
          actions: [
            'pricingView',
            'pricingCreate',
            'pricingUpdate',
            'pricingRemove',
          ],
          scope: 'all',
        },
        {
          plugin: 'loyalty',
          module: 'pricingPlan',
          actions: [
            'pricingPlanView',
            'pricingPlanCreate',
            'pricingPlanUpdate',
            'pricingPlanRemove',
          ],
          scope: 'all',
        },
        {
          plugin: 'loyalty',
          module: 'scoreCampaign',
          actions: [
            'scoreCampaignView',
            'scoreCampaignCreate',
            'scoreCampaignUpdate',
            'scoreCampaignRemove',
            'scoreRefund',
          ],
          scope: 'all',
        },
        {
          plugin: 'loyalty',
          module: 'scoreLog',
          actions: ['scoreLogView', 'scoreLogChange'],
          scope: 'all',
        },
        {
          plugin: 'loyalty',
          module: 'spin',
          actions: [
            'spinView',
            'spinCreate',
            'spinEdit',
            'spinRemove',
            'spinBuy',
            'spinDo',
          ],
          scope: 'all',
        },
        {
          plugin: 'loyalty',
          module: 'spinCampaign',
          actions: [
            'spinCampaignView',
            'spinCampaignCreate',
            'spinCampaignEdit',
            'spinCampaignRemove',
          ],
          scope: 'all',
        },
        {
          plugin: 'loyalty',
          module: 'voucher',
          actions: [
            'voucherView',
            'voucherCreate',
            'voucherEdit',
            'voucherRemove',
            'voucherBuy',
          ],
          scope: 'all',
        },
        {
          plugin: 'loyalty',
          module: 'voucherCampaign',
          actions: [
            'voucherCampaignView',
            'voucherCampaignCreate',
            'voucherCampaignEdit',
            'voucherCampaignRemove',
          ],
          scope: 'all',
        },
      ],
    },
    {
      id: 'loyalty:user',
      name: 'Loyalty User',
      description: 'Standard loyalty user',
      permissions: [
        {
          plugin: 'loyalty',
          module: 'agent',
          actions: ['agentView'],
          scope: 'all',
        },
        {
          plugin: 'loyalty',
          module: 'assignment',
          actions: ['assignmentView'],
          scope: 'all',
        },
        {
          plugin: 'loyalty',
          module: 'assignmentCampaign',
          actions: ['assignmentCampaignView'],
          scope: 'all',
        },
        {
          plugin: 'loyalty',
          module: 'loyalty',
          actions: ['loyaltyView', 'loyaltyCheck', 'loyaltyShareScore'],
          scope: 'all',
        },
        {
          plugin: 'loyalty',
          module: 'coupon',
          actions: ['couponView'],
          scope: 'all',
        },
        {
          plugin: 'loyalty',
          module: 'donate',
          actions: ['donateView', 'donateCreate'],
          scope: 'own',
        },
        {
          plugin: 'loyalty',
          module: 'lottery',
          actions: ['lotteryView', 'lotteryBuy'],
          scope: 'all',
        },
        {
          plugin: 'loyalty',
          module: 'scoreCampaign',
          actions: ['scoreCampaignView'],
          scope: 'all',
        },
        {
          plugin: 'loyalty',
          module: 'scoreLog',
          actions: ['scoreLogView'],
          scope: 'own',
        },
        {
          plugin: 'loyalty',
          module: 'spin',
          actions: ['spinView', 'spinBuy', 'spinDo'],
          scope: 'all',
        },
        {
          plugin: 'loyalty',
          module: 'voucher',
          actions: ['voucherView', 'voucherBuy'],
          scope: 'all',
        },
        {
          plugin: 'loyalty',
          module: 'voucherCampaign',
          actions: ['voucherCampaignView'],
          scope: 'all',
        },
      ],
    },
    {
      id: 'loyalty:viewer',
      name: 'Loyalty Viewer',
      description: 'Read-only access',
      permissions: [
        {
          plugin: 'loyalty',
          module: 'agent',
          actions: ['agentView'],
          scope: 'all',
        },
        {
          plugin: 'loyalty',
          module: 'assignment',
          actions: ['assignmentView'],
          scope: 'all',
        },
        {
          plugin: 'loyalty',
          module: 'assignmentCampaign',
          actions: ['assignmentCampaignView'],
          scope: 'all',
        },
        {
          plugin: 'loyalty',
          module: 'loyalty',
          actions: ['loyaltyView'],
          scope: 'all',
        },
        {
          plugin: 'loyalty',
          module: 'coupon',
          actions: ['couponView'],
          scope: 'all',
        },
        {
          plugin: 'loyalty',
          module: 'couponCampaign',
          actions: ['couponCampaignView'],
          scope: 'all',
        },
        {
          plugin: 'loyalty',
          module: 'donate',
          actions: ['donateView'],
          scope: 'all',
        },
        {
          plugin: 'loyalty',
          module: 'donateCampaign',
          actions: ['donateCampaignView'],
          scope: 'all',
        },
        {
          plugin: 'loyalty',
          module: 'lottery',
          actions: ['lotteryView'],
          scope: 'all',
        },
        {
          plugin: 'loyalty',
          module: 'lotteryCampaign',
          actions: ['lotteryCampaignView'],
          scope: 'all',
        },
        {
          plugin: 'loyalty',
          module: 'pricing',
          actions: ['pricingView'],
          scope: 'all',
        },
        {
          plugin: 'loyalty',
          module: 'pricingPlan',
          actions: ['pricingPlanView'],
          scope: 'all',
        },
        {
          plugin: 'loyalty',
          module: 'scoreCampaign',
          actions: ['scoreCampaignView'],
          scope: 'all',
        },
        {
          plugin: 'loyalty',
          module: 'scoreLog',
          actions: ['scoreLogView'],
          scope: 'all',
        },
        {
          plugin: 'loyalty',
          module: 'spin',
          actions: ['spinView'],
          scope: 'all',
        },
        {
          plugin: 'loyalty',
          module: 'spinCampaign',
          actions: ['spinCampaignView'],
          scope: 'all',
        },
        {
          plugin: 'loyalty',
          module: 'voucher',
          actions: ['voucherView'],
          scope: 'all',
        },
        {
          plugin: 'loyalty',
          module: 'voucherCampaign',
          actions: ['voucherCampaignView'],
          scope: 'all',
        },
      ],
    },
  ],
};