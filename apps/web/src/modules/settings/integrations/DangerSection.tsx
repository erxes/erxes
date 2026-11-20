import { Button, Spinner, useConfirm } from 'erxes-ui';

export const DangerSection = ({
  title,
  description,
  confirmMessage,
  confirmDescription,
  label,
  pending,
  onConfirm,
}: {
  title: string;
  description: string;
  confirmMessage: string;
  confirmDescription?: string;
  label: string;
  pending: boolean;
  onConfirm: () => void;
}) => {
  const { confirm } = useConfirm();

  return (
    <section className="flex flex-wrap items-center gap-4 rounded-lg border border-destructive/30 p-4">
      <div className="min-w-0 flex-1 space-y-1">
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Button
        variant="destructive"
        disabled={pending}
        onClick={() =>
          void confirm({
            message: confirmMessage,
            options: { description: confirmDescription },
          }).then(onConfirm)
        }
      >
        {pending ? <Spinner size="sm" /> : label}
      </Button>
    </section>
  );
};
