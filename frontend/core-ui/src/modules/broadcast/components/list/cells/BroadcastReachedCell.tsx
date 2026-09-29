import { Badge, RecordTableInlineCell, Tooltip } from 'erxes-ui';

/** How much of the audience the campaign actually got to. */
export const BroadcastReachedCell = ({
  reached = 0,
  targeted = 0,
}: {
  reached?: number;
  targeted?: number;
}) => {
  const percentage = targeted > 0 ? (reached / targeted) * 100 : 0;

  return (
    <RecordTableInlineCell>
      <Tooltip.Provider>
        <Tooltip delayDuration={500}>
          <Tooltip.Trigger asChild>
            <Badge variant="secondary">
              {Number.isInteger(percentage)
                ? percentage
                : percentage.toFixed(2)}
              %
            </Badge>
          </Tooltip.Trigger>
          {!!targeted && (
            <Tooltip.Content className="max-w-96" side="right" align="start">
              {`${reached} of ${targeted} were reached`}
            </Tooltip.Content>
          )}
        </Tooltip>
      </Tooltip.Provider>
    </RecordTableInlineCell>
  );
};
