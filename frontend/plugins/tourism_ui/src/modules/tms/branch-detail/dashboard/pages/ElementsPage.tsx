import { IBranch } from '@/tms/types/branch';

export const ElementsPage = ({ branch }: { branch: IBranch }) => {
  return (
    <div className="p-4">
      <div className="rounded-md border bg-background p-4">
        <h3 className="text-base font-semibold">Elements</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Manage reusable tour elements for{' '}
          <span className="font-medium">{branch.name}</span>.
        </p>
      </div>
    </div>
  );
};
