import { Button, cn, formatPhoneNumber, Input } from 'erxes-ui';
import { callNumberState } from '@/integrations/call/states/callWidgetStates';
import { IconBackspace } from '@tabler/icons-react';
import { useAtom, useSetAtom } from 'jotai';
import { useSip } from '@/integrations/call/components/SipProvider';

export const CallNumberInput = () => {
  const [number, setNumber] = useAtom(callNumberState);
  const { startCall } = useSip();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(number);
    if (number.length === 0) return;
    startCall(number);
  };

  return (
    <div className="flex items-center flex-col mt-2">
      <form onSubmit={handleSubmit} className="w-full">
        <Input
          className="text-center"
          value={formatPhoneNumber({ value: number, defaultCountry: 'MN' })}
          onChange={(e) => setNumber(e.target.value.replace(' ', ''))}
        />
        <button className="sr-only" type="submit" />
      </form>
      <div className="pt-3 pb-6 gap-1 grid grid-cols-12 w-full">
        <CallNumberInputButton value="1" />
        <CallNumberInputButton value="2" />
        <CallNumberInputButton value="3" />
        <CallNumberInputButton value="4" />
        <CallNumberInputButton value="5" />
        <CallNumberInputButton value="6" />
        <CallNumberInputButton value="7" />
        <CallNumberInputButton value="8" />
        <CallNumberInputButton value="9" />
        <CallNumberInputButton value="0" />
        <CallNumberInputButton className="col-span-3" value="+" />
        <CallNumberInputButton className="col-span-3" value="#" />
        <CallNumberInputButton className="col-span-3" value="*" />
        <CallNumberInputButton className="col-span-3 [&>svg]:size-5" remove>
          <IconBackspace />
        </CallNumberInputButton>
      </div>
    </div>
  );
};

export const CallNumberInputButton = ({
  children,
  value,
  remove,
  className,
}: {
  children?: React.ReactNode;

  value?: string;
  remove?: boolean;
  className?: string;
}) => {
  const setNumber = useSetAtom(callNumberState);

  const handleClick = () => {
    if (remove) {
      setNumber((prev) => prev.slice(0, -1));
    } else {
      setNumber((prev) => prev + value);
    }
  };

  return (
    <Button
      variant="secondary"
      className={cn(
        'col-span-4 h-11',
        value === '0' && 'col-span-12',
        className,
      )}
      onClick={handleClick}
    >
      {children || value}
    </Button>
  );
};
