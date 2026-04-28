import { usePayment } from '../hooks/use-payment';
import { Button } from './ui/button';

const CloseButton = () => {
  const { onClose } = usePayment();

  return (
    <Button className="w-full" variant="outline" onClick={onClose}>
      Go back
    </Button>
  );
};

export default CloseButton;
