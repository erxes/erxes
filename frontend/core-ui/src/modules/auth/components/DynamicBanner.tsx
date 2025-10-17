import { Polygons } from '../components/Polygons';
import { Logo } from '@/auth/components/Logo';
export const DynamicBanner = () => {
  return (
    <div className="hidden lg:block lg:w-1/2 h-dvh relative overflow-hidden z-10 bg-foreground dark:bg-background">
      <Polygons />
      <div className="w-full h-full flex flex-col items-center justify-center text-primary-foreground">
        <div className="absolute top-7">
          <Logo />
        </div>
        <div className="max-w-[500px] flex-col flex justify-center gap-2">
          <h1 className="text-2xl font-semibold leading-7 text-background dark:text-foreground">
            Grow your business better and faster
          </h1>
          <p className="text-lg font-medium leading-6 text-muted-foreground">
            A single XOS (experience operating system) enables to create unique
            and life-changing experiences that work for all types of businesses.
          </p>
        </div>
      </div>
    </div>
  );
};
