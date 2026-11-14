import { Form } from 'erxes-ui';
import { AutomationTemplateRequirementProps } from 'ui-modules';
import { SelectLoyaltyAccountType } from '~/modules/loyalties/settings/account-type/components/SelectLoyaltyAccountType';
import { useLoyaltyTemplateRequirement } from '../../hooks/useLoyaltyTemplateRequirement';

/**
 * Answers a template's loyalty prerequisites while it is installed: which
 * wallet (account type) its tier trigger watches.
 */
export const LoyaltyTemplateRequirement = (
  props: AutomationTemplateRequirementProps,
) => {
  const { isAccountType, form, select } = useLoyaltyTemplateRequirement(props);

  if (!isAccountType) {
    return null;
  }

  return (
    <Form {...form}>
      <Form.Field
        control={form.control}
        name="accountTypeId"
        render={({ field }) => (
          <Form.Item>
            <SelectLoyaltyAccountType
              value={field.value}
              onValueChange={select}
            />
          </Form.Item>
        )}
      />
    </Form>
  );
};
