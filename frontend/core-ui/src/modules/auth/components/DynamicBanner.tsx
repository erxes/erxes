import { Polygons } from '../components/Polygons';
import { useAtomValue } from 'jotai';
import { currentOrganizationState } from 'ui-modules';
import { Logo } from './Logo';

export const DynamicBanner = () => {
  const organization = useAtomValue(currentOrganizationState);

  return (
    <div className="hidden lg:block lg:w-1/2 h-dvh relative overflow-hidden z-10 bg-foreground dark:bg-background">
      <Polygons />
      <div className="w-full h-full flex flex-col items-center justify-center text-primary-foreground">
        <div className="absolute top-7">
          <Logo organizationLogo={organization?.orgLogo} />
        </div>
        <div className="max-w-[500px] flex-col flex justify-center gap-2">
          <h1 className="text-2xl font-semibold leading-7 text-background dark:text-foreground">
            {organization?.orgLoginText ||
              'Grow your business better and faster'}
          </h1>
          <p className="text-lg font-medium leading-6 text-muted-foreground">
            {organization?.orgLoginDescription ||
              'A single XOS (experience operating system) enables to create unique and life-changing experiences that work for all types of businesses.'}
          </p>
        </div>
      </div>
    </div>
  );
};
