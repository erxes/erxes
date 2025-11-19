import { ConfirmInvitationForm } from '@/auth/components/ConfirmInvitationForm';

const UserConfirmInvitationPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen px-4  bg-[radial-gradient(ellipse_at_top,#F0F1FE_0%,#F7F8FA_100%)] dark:bg-[radial-gradient(ellipse_at_top,#0D0D0D_0%,#161616_100%)]">
      <ConfirmInvitationForm />
    </div>
  );
};

export default UserConfirmInvitationPage;
