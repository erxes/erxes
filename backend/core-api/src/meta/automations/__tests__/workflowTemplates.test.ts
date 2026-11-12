import { materializeBuiltInTemplate } from 'erxes-api-shared/core-modules';
import { CORE_AUTOMATION_WORKFLOW_TEMPLATES } from '../workflowTemplates';

const email = { subject: 'Ours', content: '<p>Ours</p>', html: '<p>Ours</p>' };

describe('core workflow templates', () => {
  it.each(CORE_AUTOMATION_WORKFLOW_TEMPLATES.map((item) => [item.id, item]))(
    '%s fills real steps and every email waits for its wording',
    (_id, template) => {
      const requirements = template.requirements || [];
      const orders = template.flow.map(({ order }) => order);
      const emailOrders = template.flow
        .filter(({ type }) => type === 'sendEmail')
        .map(({ order }) => order);

      for (const { fills = [] } of requirements) {
        for (const { order } of fills) {
          expect(orders).toContain(order);
        }
      }

      expect(
        requirements
          .filter(({ kind }) => kind === 'core:emails.content')
          .map(({ fills }) => fills?.[0]?.order),
      ).toEqual(emailOrders);

      const answers = Object.fromEntries(
        requirements.map(({ key, kind }) => [
          key,
          kind === 'core:emails.content'
            ? email
            : { value: 'shop@example.mn', name: 'Shop' },
        ]),
      );
      const { actions, unanswered } = materializeBuiltInTemplate(template, {
        answers,
      });

      expect(unanswered).toEqual([]);
      for (const action of actions.filter(({ type }) => type === 'sendEmail')) {
        expect(action.config.subject).toBe('Ours');
      }
    },
  );
});
