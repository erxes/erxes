import { Document, Schema } from 'mongoose';

import { AGENT_STATUSES } from './constants';
import { field } from './utils';

export interface IProductRule {
    categoryIds?: string[];
    excludeCategoryIds?: string[];
    productIds?: string[];
    excludeProductIds?: string[];
    tagIds?: string[];
    excludeTagIds?: string[];
}

enum AgentStatus {
    Active = 'active',
    Draft = 'draft',
    Archived = 'archived'
};

export interface IAgent extends Document {
    number: string;
    customerIds: string[];
    companyIds: string[];
    status: AgentStatus;
    startDate?: Date;
    endDate?: Date;
    startMonth?: Date;
    endMonth?: Date;
    startDay?: Date;
    endDay?: Date;
    hasReturn: boolean;
    productRule?: IProductRule;
    returnAmount?: number;
    returnPercent?: number;
    prepaidPercent?: number;
    discountPercent?: number;
}

export interface IAgentDocument extends IAgent {
    _id: string;
}

const productRuleSchema = new Schema({
    categoryIds: field({ type: [String], label: 'When using specific product categories' }),
    excludeCategoryIds: field({ type: [String], label: 'When excluding specific categories' }),
    productIds: field({ type: [String], label: 'When including specific products' }),
    excludeProductIds: field({ type: [String], label: 'When excluding specific products' }),
    tagIds: field({ type: [String], label: 'When including specific products with tags' }),
    excludeTagIds: field({ type: [String], label: 'When excluding specific products with tags' }),
}, { _id: false });

export const agentSchema = new Schema({
    _id: field({ pkey: true }),
    number: field({ type: String, unique: true }),
    customerIds: field({ type: [String] }),
    companyIds: field({ type: [String] }),
    status: field({ type: String, enum: AGENT_STATUSES.ALL, default: AGENT_STATUSES.DRAFT }),
    startDate: field({ type: Date }),
    endDate: field({ type: Date }),
    startMonth: field({ type: Date }),
    endMonth: field({ type: Date }),
    startDay: field({ type: Date }),
    endDay: field({ type: Date }),
    hasReturn: field({ type: Boolean, label: 'Whether agent returns money or not' }),
    // if hasReturn === true
    returnAmount: field({ type: Number, min: 0 }),
    // returnAmount will override returnPercent
    returnPercent: field({ type: Number, min: 0, max: 100 }),
    // if hasReturn === false
    prepaidPercent: field({ type: Number, min: 0, max: 100 }),
    discountPercent: field({ type: Number, min: 0, max: 100 }),
    productRule: field({ type: productRuleSchema, label: 'Product specific rules' })
});
