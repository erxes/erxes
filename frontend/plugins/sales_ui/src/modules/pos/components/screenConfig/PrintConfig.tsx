import { useState, useEffect } from 'react';
import { Label, Switch } from 'erxes-ui';

interface PrintConfigProps {
  kitchenIsPrint?: boolean;
  waitingIsPrint?: boolean;
  onChange: (data: {
    kitchenIsPrint: boolean;
    waitingIsPrint: boolean;
  }) => void;
}

export const PrintConfig: React.FC<PrintConfigProps> = ({
  kitchenIsPrint,
  waitingIsPrint,
  onChange,
}) => {
  const [kitchenPrint, setKitchenPrint] = useState(kitchenIsPrint ?? false);
  const [waitingPrint, setWaitingPrint] = useState(waitingIsPrint ?? false);

  useEffect(() => {
    setKitchenPrint(kitchenIsPrint ?? false);
    setWaitingPrint(waitingIsPrint ?? false);
  }, [kitchenIsPrint, waitingIsPrint]);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex gap-2 items-center">
        <Switch
          checked={kitchenPrint}
          onCheckedChange={(checked) => {
            setKitchenPrint(checked);
            onChange({ kitchenIsPrint: checked, waitingIsPrint: waitingPrint });
          }}
        />
        <Label>KITCHEN PRINT</Label>
      </div>

      <div className="flex gap-2 items-center">
        <Switch
          checked={waitingPrint}
          onCheckedChange={(checked) => {
            setWaitingPrint(checked);
            onChange({ kitchenIsPrint: kitchenPrint, waitingIsPrint: checked });
          }}
        />
        <Label>WAITING PRINT</Label>
      </div>
    </div>
  );
};
