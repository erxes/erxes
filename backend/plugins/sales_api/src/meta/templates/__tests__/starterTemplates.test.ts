import {
  materializeTemplate,
  templateGroupOf,
  validateTemplate,
} from 'erxes-api-shared/core-modules';
import { bigDealApprovalTemplate } from '../bigDealApproval';
import { dealLostTemplate } from '../dealLost';
import { dealRoundRobinTemplate } from '../dealRoundRobin';
import { posReviewTemplate } from '../posReview';
import { staleDealTemplate } from '../staleDeal';

const PART_IDS = { stale: 's1', active: 's2', big: 's3', rating: 'f1' };
const PART_REFS = { rating: { formId: 'f1', ratingFieldId: 'fld1' } };

const materialize = (
  template: Parameters<typeof materializeTemplate>[0],
  answers: Record<string, unknown>,
) =>
  materializeTemplate(template, {
    answers,
    partIds: PART_IDS,
    partRefs: PART_REFS,
  });

const SENDER = { value: 'hello@example.com', name: 'Support' };

describe('sales starter templates', () => {
  it.each([
    dealLostTemplate,
    staleDealTemplate,
    dealRoundRobinTemplate,
    bigDealApprovalTemplate,
    posReviewTemplate,
  ])('$id is valid', (template) => {
    expect(validateTemplate(template)).toEqual([]);
  });

  it('Groups each by its journeys', () => {
    expect(templateGroupOf(dealLostTemplate)).toBe('automation');
    expect(templateGroupOf(posReviewTemplate)).toBe('solution');
  });

  it('Asks a lost deal for a reason by email, editable in the builder', () => {
    const [{ actions, triggers }] = materialize(dealLostTemplate, {
      team: '[[ user.u1 ]]',
      sender: SENDER,
    }).automations;

    expect(triggers[0].config).toEqual({ probability: 'Lost' });
    expect(actions.find(({ type }) => type === 'sendEmail')?.config).toMatchObject(
      { contentFormat: 'maily', replyToEmail: 'hello@example.com' },
    );
  });

  it('Watches the stale segment as a membership trigger', () => {
    const [{ triggers }] = materialize(staleDealTemplate, {}).automations;

    expect(triggers[0].config).toEqual({
      event: 'segmentMembership',
      segmentId: 's1',
    });
  });

  it('Assigns the picked member to the deal', () => {
    const [{ actions }] = materialize(dealRoundRobinTemplate, {
      team: '[[ user.u1 ]], [[ user.u2 ]]',
      fallback: '[[ user.u3 ]]',
    }).automations;
    const pick = actions.find(({ type }) => type === 'pickMember');
    const assign = actions.find(({ type }) => type === 'setProperty');

    expect(pick?.config).toMatchObject({
      candidateIds: '[[ user.u1 ]], [[ user.u2 ]]',
      fallbackUserId: '[[ user.u3 ]]',
    });
    expect(assign?.config.rules[0].value).toBe(
      `{{ actions.${pick?.id}.userId }}`,
    );
  });

  it('Puts the approval limit into the segment', () => {
    const { parts } = materialize(bigDealApprovalTemplate, {
      limit: '5000000',
      approvers: '[[ user.u1 ]]',
    });
    const big = parts.find(({ key }) => key === 'big');

    expect(big?.doc.root.children[3]).toMatchObject({
      fieldKey: 'totalAmount',
      operator: 'numberigt',
      value: '5000000',
    });
  });

  it('Alerts on a rating of 1 or 2 from its own form', () => {
    const low = materialize(posReviewTemplate, {
      sender: SENDER,
      team: '[[ user.u1 ]]',
    }).automations.find(({ journey }) => journey === 'low');

    expect(low?.triggers[0].config).toMatchObject({
      formId: 'f1',
      conditions: [
        { fieldId: 'fld1', value: '1' },
        { fieldId: 'fld1', value: '2' },
      ],
    });
  });
});
