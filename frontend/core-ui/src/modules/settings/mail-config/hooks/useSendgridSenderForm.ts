import { useVerifySender } from '@/settings/mail-config/hooks/useVerifiedSenders';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const SENDGRID_SENDER_SCHEMA = z.object({
  name: z.string().min(1, 'From name is required'),
  email: z.string().email('Enter a valid email'),
  replyTo: z.string().email('Enter a valid email').or(z.literal('')).optional(),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
});

export type TSendgridSenderForm = z.infer<typeof SENDGRID_SENDER_SCHEMA>;

export const useSendgridSenderForm = ({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void;
}) => {
  const { verifySender, loading } = useVerifySender();

  const form = useForm<TSendgridSenderForm>({
    resolver: zodResolver(SENDGRID_SENDER_SCHEMA),
    defaultValues: {
      name: '',
      email: '',
      replyTo: '',
      address: '',
      city: '',
      country: '',
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await verifySender(
      { ...values, replyTo: values.replyTo || values.email },
      {
        onCompleted: () => {
          toast({
            title: 'Verification sent',
            description: `Ask the owner of ${values.email} to open the confirmation link.`,
            variant: 'success',
          });

          form.reset();
          onOpenChange(false);
        },
      },
    );
  });

  return { form, onSubmit, loading };
};
