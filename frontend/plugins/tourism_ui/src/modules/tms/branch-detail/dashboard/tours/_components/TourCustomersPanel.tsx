import { IconUsers } from '@tabler/icons-react';

// interface Props {
//   tourId: string;
// }

export const TourCustomersPanel = () => {
  return (
    <div className="flex flex-col gap-3 justify-center items-center px-4 h-full text-center">
      <IconUsers className="w-8 h-8 text-muted-foreground" />

      <h3 className="text-base font-semibold">No customers yet</h3>

      <p className="max-w-xs text-sm text-muted-foreground">
        This tour doesn’t have any orders yet. Once customers place an order,
        they will appear here.
      </p>
    </div>
  );
};
