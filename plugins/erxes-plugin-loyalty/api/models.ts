import { Loyalty, loyaltySchema } from "./models/Loyalties";
import { LoyaltyConfig, loyaltyConfigSchema } from "./models/LoyaltyConfig";


export default [
  {
    name: 'LoyaltyConfigs',
    schema: loyaltyConfigSchema,
    klass: LoyaltyConfig
  },
  {
    name: 'VoucherRules',
    schema: loyaltyConfigSchema,
    klass: LoyaltyConfig
  },
  {
    name: 'Loyalties',
    schema: loyaltySchema,
    klass: Loyalty
  },
];
