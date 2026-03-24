import { useUserEdit } from '@/settings/team-member/hooks/useUserEdit';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Input, Upload, useToast } from 'erxes-ui';
import { motion } from 'framer-motion';
import { useAtomValue } from 'jotai';
import { useForm } from 'react-hook-form';
import { currentUserState } from 'ui-modules';
import { z } from 'zod';
const formSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  avatar: z.string().optional(),
});

type UserMoreInfoFormData = z.infer<typeof formSchema>;

export const UserMoreInfoForm = ({
  onContinue,
}: {
  onContinue: () => void;
}) => {
  const currentUser = useAtomValue(currentUserState);
  const { usersEdit } = useUserEdit();
  const { toast } = useToast();
  const form = useForm<UserMoreInfoFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
    },
  });

  const onSubmit = (data: UserMoreInfoFormData) => {
    usersEdit({
      variables: {
        _id: currentUser?._id,
        details: {
          firstName: data.firstName,
          lastName: data.lastName,
          fullName: `${data.firstName} ${data.lastName}`,
          avatar: data.avatar,
        },
      },
      onCompleted: () => {
        onContinue();
      },
      onError: (error) => {
        toast({
          title: 'Error updating user',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="grid gap-5 shadow-sm px-5 pt-7 pb-10 rounded-2xl bg-background h-fit max-sm:mx-2 sm:min-w-sm -translate-y-10"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col gap-2 text-center mb-2"
      >
        <h2 className="text-2xl font-semibold text-foreground">
          Complete your profile
        </h2>
        <p className="text-sm text-muted-foreground">
          Add your details to personalize your experience
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
            <Form.Field
              control={form.control}
              name="avatar"
              render={({ field }: { field: any }) => (
                <Form.Item className="mb-2">
                  <Form.Control>
                    <div className="flex items-start gap-4">
                      <Upload.Root
                        {...field}
                        onChange={(fileInfo: any) =>
                          field.onChange(fileInfo?.url)
                        }
                      >
                        <Upload.Preview className="shrink-0" />
                        <div className="flex flex-col gap-2 flex-1">
                          <div className="flex gap-2">
                            <Upload.Button
                              size="sm"
                              variant="outline"
                              type="button"
                            />
                            <Upload.RemoveButton
                              size="sm"
                              variant="outline"
                              type="button"
                            />
                          </div>
                          <Form.Description className="text-xs">
                            Upload a profile picture to help identify you.
                          </Form.Description>
                        </div>
                      </Upload.Root>
                    </div>
                  </Form.Control>
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <Form.Item>
                  <Form.Control>
                    <Input
                      type="text"
                      placeholder="Enter first name"
                      autoFocus
                      {...field}
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <Form.Item>
                  <Form.Control>
                    <Input
                      type="text"
                      placeholder="Enter last name"
                      {...field}
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Button type="submit" className="w-full" size="lg">
              Continue
            </Button>
          </form>
        </Form>
      </motion.div>
    </motion.div>
  );
};
