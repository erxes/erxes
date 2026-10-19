import { WelcomeOnboardingCard } from 'ui-modules/modules/notifications/components/WelcomeOnboardingCard';
import type { WelcomeOnboardingGridProps } from 'ui-modules/modules/notifications/types/welcome';

export const WelcomeOnboardingGrid = ({
  items,
}: WelcomeOnboardingGridProps) => {
  const count = items.length;

  if (count === 3) {
    return (
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {items.slice(0, 2).map((item) => (
            <WelcomeOnboardingCard key={item.id} item={item} />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-2">
          {items.slice(2, 3).map((item) => (
            <WelcomeOnboardingCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    );
  }

  if (count === 4) {
    return (
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {items.slice(0, 2).map((item) => (
            <WelcomeOnboardingCard key={item.id} item={item} />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {items.slice(2, 4).map((item) => (
            <WelcomeOnboardingCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    );
  }

  if (count === 5) {
    return (
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {items.slice(0, 3).map((item) => (
            <WelcomeOnboardingCard key={item.id} item={item} />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {items.slice(3, 5).map((item) => (
            <WelcomeOnboardingCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {items.map((item) => (
        <WelcomeOnboardingCard key={item.id} item={item} />
      ))}
    </div>
  );
};
