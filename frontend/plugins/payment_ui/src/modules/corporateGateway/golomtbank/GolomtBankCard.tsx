// frontend/plugins/payment_ui/src/modules/corporateGateway/GolomtBankCard.tsx

import { Button } from 'erxes-ui/components/button';
import { Card } from 'erxes-ui/components/card';

const GolomtBankCard = () => {
  return (
    <Card className="p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/static/images/payments/golomt.png"
            alt="Golomt Bank"
            className="h-10 w-10 rounded-md object-contain"
          />

          <div>
            <p className="font-semibold">Golomt E-Commerce</p>
            <p className="text-xs text-muted-foreground">
              ( Accepts MNT )
            </p>
          </div>
        </div>

        <Button variant="link" size="sm">
          + Add
        </Button>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground">
        Becoming an E-Commerce merchant for online sales and payment we offer
        products and services 24/7. Accepts most type of domestic and foreign card
        and provide opportunity to make and receive payment from anywhere
      </p>
    </Card>
  );
};

export default GolomtBankCard;
