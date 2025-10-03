import { Logo } from '@/auth/components/Logo';
import { Polygons } from './Polygons';

interface AuthenticationLayoutProps {
  children: React.ReactNode;
}
export const AuthenticationLayout = ({
  children,
}: AuthenticationLayoutProps) => {
  return (
    <div className="relative overflow-hidden lg:w-1/2 lg:flex-none flex-1 flex flex-col sm:pt-28 py-8 h-dvh bg-[radial-gradient(#F0F1FE,#F7F8FA)]">
      <div className="px-1 sm:px-6 mx-auto w-full max-w-md flex flex-col gap-8 relative">
        <div className="absolute inset-0 hidden sm:block">
          <Polygons
            variant="light"
            className="absolute left-1/2 -translate-x-1/2 w-[170%] -top-[18.5%]"
          />
        </div>
        <Logo className="h-10 mx-auto text-primary relative hidden sm:block" />
        <div className="relative sm:min-h-[36rem]">
          <div className="rounded-xl shadow-xl overflow-hidden bg-sidebar">
            <div className="overflow-hidden">
              <div className="w-auto h-full bg-background p-6 pt-8 border border-t-0 rounded-b-xl -mx-px space-y-6">
                {children}
              </div>
              <div className="flex flex-col text-accent-foreground space-y-1 py-5 w-full m-0 px-0">
                <span className="text-sm text-center">
                  By signing in, you confirm that you accept our
                </span>
                <span className="text-sm text-center inline-flex gap-1 justify-center">
                  <a
                    className="text-primary font-medium hover:underline"
                    href="#"
                  >
                    Terms of use
                  </a>
                  and
                  <a
                    className="text-primary font-medium hover:underline"
                    href="#"
                  >
                    Privacy policy
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-auto text-center text-accent-foreground">© 2024 erxes</p>
    </div>
  );
};
