import { ErxesLogoIcon } from 'erxes-ui';
import { currentOrganizationState } from 'ui-modules';
import { useAtomValue } from 'jotai';
import { Button } from 'erxes-ui';
import { useUserConfirmInvitation } from '@/auth/hooks/useUserConfirmInvitation';
import { useQueryState } from 'erxes-ui';
import { useToast } from 'erxes-ui';
import { IconAlertCircle } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
export const ConfirmInvitationForm = () => {
  const navigate = useNavigate();
  const [token] = useQueryState<string>('token');
  const currentOrganization = useAtomValue(currentOrganizationState);
  const { confirmInvitation, loading } = useUserConfirmInvitation();
  const { toast } = useToast();

  const handleConfirmInvitation = () => {
    if (!token) return;

    confirmInvitation({
      variables: {
        token: token,
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
      onCompleted: () => {
        navigate('/');
      },
    });
  };

  if (!token) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md mx-auto shadow-xl px-8 pt-10 pb-12 rounded-3xl bg-background border border-border/50 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-6 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4, ease: 'easeOut' }}
              className="relative"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 bg-destructive/10 rounded-full blur-xl"
              />
              <div className="relative w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ delay: 0.5, duration: 0.5, ease: 'easeInOut' }}
                >
                  <IconAlertCircle className="w-12 h-12 text-destructive" />
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="space-y-3"
            >
              <h1 className="font-semibold text-2xl text-foreground">
                Invalid Invitation Link
              </h1>
              <p className="text-muted-foreground text-base">
                This invitation link is invalid or has expired. Please request a
                new invitation from your organization administrator.
              </p>
            </motion.div>
          </div>
        </motion.div>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="absolute bottom-8 text-sm text-muted-foreground/70"
        >
          © 2024 erxes
        </motion.footer>
      </>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md mx-auto shadow-xl px-8 pt-10 pb-12 rounded-3xl bg-background border border-border/50 backdrop-blur-sm"
      >
        <div className="flex flex-col items-center gap-6 mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4, ease: 'easeOut' }}
            className="relative"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 bg-primary/10 rounded-full blur-xl"
            />
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <ErxesLogoIcon className="relative w-24 h-24 text-primary drop-shadow-lg" />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-center space-y-2"
          >
            <h1 className="font-semibold text-2xl text-foreground">
              You've been invited!
            </h1>
            <p className="text-muted-foreground text-base">
              Join{' '}
              <span className="font-semibold text-foreground">
                {currentOrganization?.name || 'erxes'}
              </span>{' '}
              and start collaborating
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <Button
            onClick={handleConfirmInvitation}
            className="w-full text-base font-medium shadow-md hover:shadow-lg transition-all cursor-pointer"
            size="lg"
            disabled={loading}
          >
            Accept invitation
          </Button>
        </motion.div>
      </motion.div>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="absolute bottom-8 text-sm text-muted-foreground/70"
      >
        © 2024 erxes
      </motion.footer>
    </>
  );
};
