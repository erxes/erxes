import { stored } from 'erxes-ui';
import { z } from 'zod';

export const onboardingStepState = stored({
  key: 'erxes:onboarding:step',
  schema: z.int().positive(),
  initial: 1,
});
