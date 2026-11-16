import { validateTemplate } from 'erxes-api-shared/core-modules';
import { templates } from '../index';

describe('sales templates', () => {
  it.each(templates.map((template) => [template.id, template]))(
    '%s is sound',
    (_id, template) => {
      expect(validateTemplate(template)).toEqual([]);
    },
  );
});
