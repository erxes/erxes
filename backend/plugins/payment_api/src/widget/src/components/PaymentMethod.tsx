import { Button } from './ui/button';

type Props = {
  kind: string;
  name: string;
  iconUrl   : string;
  onClick?: () => void;
};

const PaymentMethod = (props: Props) => {
  const { kind, name, iconUrl } = props;
  return (
    <Button
      className="h-auto justify-start px-2 gap-2 text-left"
      variant="outline"
      onClick={props.onClick}
    >
      <img
        src={iconUrl}
        alt={''}
        height={48}
        width={48}
        className="flex-none p-1"
      />
      <div className="flex-1">
        <h5 className="font-medium capitalize">{kind}</h5>
        <div className="text-neutral-500 text-xs font-normal line-clamp-1 capitalize">
          {name}
        </div>
      </div>
      <span className="h-4 w-4 border-2 rounded-full mr-2"></span>
    </Button>
  );
};

export default PaymentMethod;
