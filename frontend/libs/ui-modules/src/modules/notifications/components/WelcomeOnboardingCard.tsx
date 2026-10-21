import { Button } from 'erxes-ui';
import { IconArrowRight } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import type { WelcomeOnboardingCardProps } from 'ui-modules/modules/notifications/types/welcome';

export const WelcomeOnboardingCard = ({ item }: WelcomeOnboardingCardProps) => (
  <div className="border rounded-2xl p-4 flex flex-col gap-3 bg-background min-h-[200px]">
    <div className="flex flex-col gap-3 flex-1">
      <div className="p-[10px] rounded-md text-primary bg-primary/10 w-min">
        {item.icon}
      </div>
      <h3 className="font-semibold text-primary text-lg wrap-break-word">
        {item.title}
      </h3>
      <p className="text-base text-muted-foreground wrap-break-word flex-1">
        {item.description}
      </p>
    </div>
    {item.action.to ? (
      <Button asChild size="sm" variant="ghost" className="self-start mt-auto">
        <Link to={item.action.to} className="hover:bg-background">
          <span className="text-primary font-semibold text-base flex items-center gap-1 wrap-break-word">
            <span className="truncate">{item.action.label}</span>
            <IconArrowRight className="size-4 shrink-0" />
          </span>
        </Link>
      </Button>
    ) : (
      <span className="text-muted-foreground/70 font-semibold text-base flex items-center gap-1 wrap-break-word truncate ">
        {item.action.label}
      </span>
    )}
  </div>
);
