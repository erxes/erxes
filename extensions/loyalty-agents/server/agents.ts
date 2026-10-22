// Loyalty agents, ported from loyalty_api/src/modules/agent.
import { mutation, query } from 'erxes-sdk/server';
import * as z from 'zod';
import { Agent, AgentStatus } from './schema';

// The rules the loyalty_api model checked before every write.
const AgentInput = Agent.superRefine((agent, ctx) => {
  if (agent.hasReturn && !(agent.returnAmount || agent.returnPercent)) {
    ctx.addIssue({
      code: 'custom',
      message: 'Either return amount or percent must be > 0',
    });
  }

  if (!agent.hasReturn && !(agent.prepaidPercent || agent.discountPercent)) {
    ctx.addIssue({
      code: 'custom',
      message: 'Either prepaid or discount percent must be > 0',
    });
  }

  if (agent.customerIds.length > 0 && agent.companyIds.length > 0) {
    ctx.addIssue({
      code: 'custom',
      message: 'Choose only customers or companies, not both',
    });
  }
});

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** List agents, newest first. Filter by part of the number and by status. */
export const list = query({
  permission: 'agents.view',
  input: z.object({
    number: z.string().optional(),
    status: AgentStatus.optional(),
    page: z.number().int().min(1).default(1),
    perPage: z.number().int().min(1).max(100).default(20),
  }),
  async handler({ db }, { number, status, page, perPage }) {
    const filter = {
      ...(number && { number: { $regex: escapeRegex(number), $options: 'i' } }),
      ...(status && { status }),
    };

    const [list, totalCount] = await Promise.all([
      db.agents.find(filter, {
        sort: { createdAt: -1 },
        skip: (page - 1) * perPage,
        limit: perPage,
      }),
      db.agents.count(filter),
    ]);

    return { list, totalCount };
  },
});

/** Agents that include this customer. */
export const forCustomer = query({
  permission: 'agents.view',
  input: z.object({ customerId: z.string() }),
  async handler({ db }, { customerId }) {
    return db.agents.find({ customerIds: customerId }, { limit: 20 });
  },
});

/** Create an agent. The number must be unique. */
export const add = mutation({
  permission: 'agents.manage',
  input: AgentInput,
  async handler({ db }, agent) {
    if (await db.agents.findOne({ number: agent.number })) {
      throw new Error(`Agent number ${agent.number} is taken`);
    }

    return db.agents.insertOne(agent);
  },
});

/** Replace every field of an agent. Send the whole agent, not a patch. */
export const edit = mutation({
  permission: 'agents.manage',
  input: z.object({ _id: z.string(), agent: AgentInput }),
  async handler({ db }, { _id, agent }) {
    const taken = await db.agents.findOne({
      number: agent.number,
      _id: { $ne: _id },
    });

    if (taken) {
      throw new Error(`Agent number ${agent.number} is taken`);
    }

    const updated = await db.agents.updateOne({ _id }, agent);

    if (!updated) {
      throw new Error('Agent not found');
    }

    return updated;
  },
});

/** Delete an agent. */
export const remove = mutation({
  permission: 'agents.manage',
  input: z.object({ _id: z.string() }),
  async handler({ db }, { _id }) {
    if (!(await db.agents.deleteOne({ _id }))) {
      throw new Error('Agent not found');
    }

    return { _id };
  },
});
