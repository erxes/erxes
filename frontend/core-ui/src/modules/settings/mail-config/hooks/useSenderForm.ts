import { useVerifySender } from '@/settings/mail-config/hooks/useVerifiedSenders';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const SENDER_SCHEMA = z.object({
  name: z.string().min(1, 'Sender name is required'),
  email: z.string().email('Enter a valid email'),
});

export type TSenderForm = z.infer<typeof SENDER_SCHEMA>;

export const useSenderForm = ({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void;
}) => {
  const { verifySender, loading } = useVerifySender();

  const form = useForm<TSenderForm>({
    resolver: zodResolver(SENDER_SCHEMA),
    defaultValues: { name: '', email: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await verifySender(values, {
      onCompleted: () => {
        toast({
          title: 'Confirmation sent',
          description: `Ask the owner of ${values.email} to open the link and confirm.`,
          variant: 'success',
        });

        form.reset();
        onOpenChange(false);
      },
    });
  });

  return { form, onSubmit, loading };
};
