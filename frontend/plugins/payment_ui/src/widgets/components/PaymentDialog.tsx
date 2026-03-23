import { usePayment } from '../hooks/use-payment';
import QrPayment from './payments/QrPayment';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { useIsMobile } from '../hooks/use-mobile';
import { cn } from '../lib/utils';
import CheckPayment from './CheckPayment';
import CloseButton from './CloseButton';
import Minupay from './payments/Minupay';
import StorePay from './payments/StorePay';
import Stripe from './payments/Stripe';
import KhanbankForm from './payments/KhanbankForm';
import GolomtForm from './payments/GolomtForm';

const Content = () => {
  const isMobile = useIsMobile();
  const {
    isOpen,
    onClose,
    kind = 'default',
    apiDomain,
    invoiceDetail,
  } = usePayment();

  if (!isOpen) return null;

  const renderBody = () => {
    switch (kind) {
      case 'minupay':
        return <Minupay />;
      case 'golomt':
        return <GolomtForm />;
      case 'stripe':
        return <Stripe />;
      case 'khanbank':
        return <KhanbankForm />;
      default:
        return (
          <>
            <QrPayment />
            <StorePay />
          </>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          'overflow-y-auto',
          isMobile ? 'max-h-screen' : 'max-h-[80vh]',
        )}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <img
              src={`${apiDomain}/pl:payment/static/images/payments/${kind}.png`}
              alt={kind}
              className="w-8 h-8 rounded-md"
            />
            <h2 className="font-semibold text-lg leading-snug">{kind}</h2>
          </DialogTitle>
        </DialogHeader>
        {renderBody()}
        <div className="sticky -bottom-4 bg-white -mx-4 px-4 pb-4 mt-4 -mb-4">
          <CheckPayment />
          <CloseButton />
        </div>
        {invoiceDetail.warningText && (
          <DialogDescription>{invoiceDetail.warningText}</DialogDescription>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Content;
