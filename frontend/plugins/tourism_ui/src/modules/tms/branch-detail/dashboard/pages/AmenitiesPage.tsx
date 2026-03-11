import { IBranch } from '@/tms/types/branch';

export const AmenitiesPage = ({ branch }: { branch: IBranch }) => {
  return (
    <div className="p-4">
      <div className="p-4 rounded-md border bg-background">
        <h3 className="text-base font-semibold">Amenities</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Maintain amenity catalog for{' '}
          <span className="font-medium">{branch.name}</span>.
        </p>
      </div>
    </div>
  );
};
