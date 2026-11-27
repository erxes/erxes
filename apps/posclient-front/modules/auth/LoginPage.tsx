import { Card } from "@/components/ui/card"

import { ChooseConfig } from "./chooseConfig"
import { ClearSessionButton } from "./components/clearSessionButton"
import { Logo } from "./components/logo"
import { Polygons } from "./components/Polygons"
import { LoginContainer } from "./login"

export function LoginPage() {
  return (
    <main className="flex h-dvh w-full">
      <aside className="relative hidden h-full w-1/2 items-center justify-center overflow-hidden bg-[#1f1f22] px-10 lg:flex">
        <Polygons
          aria-hidden="true"
          className="pointer-events-none top-0 max-w-none"
        />
        <Logo className="absolute top-7 h-8 w-16 text-white" />
        <div className="relative flex w-full max-w-[500px] flex-col gap-2">
          <h2 className="text-2xl leading-7 font-semibold text-white">
            Grow your business better and faster
          </h2>
          <p className="text-base leading-6 font-medium text-zinc-400">
            A single XOS (experience operating system) enables to create unique
            and life-changing experiences that work for all types of businesses.
          </p>
        </div>
      </aside>

      <section className="relative h-full min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-[radial-gradient(#F0F1FE,#F7F8FA)] py-8 sm:pt-28 dark:bg-[radial-gradient(#0D0D0D,#161616)]">
        <div className="relative mx-auto flex w-full max-w-md flex-col gap-8 px-4 sm:px-6">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 hidden sm:block"
          >
            <Polygons
              variant="light"
              className="absolute -top-[18.5%] left-1/2 w-[170%] max-w-none -translate-x-1/2"
            />
          </div>
          <Logo className="relative mx-auto h-10 w-16 text-primary" />
          <div className="relative sm:min-h-144">
            <Card className="overflow-hidden rounded-xl bg-sidebar shadow-xl">
              <div className="relative -mx-px rounded-b-xl border border-t-0 bg-background p-6 pt-8">
                <header className="mb-6 flex flex-col items-center gap-3 text-center">
                  <h1 className="text-xl leading-none font-semibold">
                    Welcome
                  </h1>
                  <p className="text-sm text-zinc-400">
                    Please sign in to your account to continue
                  </p>
                </header>
                <ChooseConfig />
                <div className="mt-4">
                  <LoginContainer />
                </div>
                <div className="absolute top-2 right-2">
                  <ClearSessionButton />
                </div>
              </div>
              <footer className="flex flex-col space-y-1 px-4 py-5 text-center text-[13px] leading-4 text-zinc-400">
                <span>By signing in, you confirm that you accept our</span>
                <div>
                  <a
                    href="https://erxes.io/legal/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    Terms of use
                  </a>
                  {" and "}
                  <a
                    href="https://erxes.io/legal/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    Privacy policy
                  </a>
                </div>
              </footer>
            </Card>
          </div>
        </div>
      </section>
    </main>
  )
}
