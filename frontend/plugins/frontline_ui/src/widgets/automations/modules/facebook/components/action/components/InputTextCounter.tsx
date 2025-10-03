import { Badge, Label } from 'erxes-ui';

export const InputTextCounter = ({
  count,
  limit,
}: {
  count: number;
  limit: number;
}) => {
  return (
    <Badge variant={count >= limit ? 'destructive' : 'secondary'}>
      <Label>
        {count}/{limit}
      </Label>
    </Badge>
  );
};
