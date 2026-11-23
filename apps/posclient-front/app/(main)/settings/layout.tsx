"use client"

import { Fragment, Suspense } from "react"
import Link from "next/link"
import { useSettingsSections } from "@/modules/settings/useSettingsSections"
import { ChevronLeftIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const navItemClass =
  "flex h-8 flex-none items-center gap-2 rounded-sm px-2 text-left text-[13px] font-medium transition-colors hover:bg-accent focus-visible:shadow-focus focus-visible:outline-hidden [&>svg]:size-4 [&>svg]:flex-none"

const SettingsNavigation = () => {
  const { sections, active, setSection } = useSettingsSections()

  return (
    <aside className="flex w-full flex-none flex-col border-b bg-sidebar md:w-60 md:border-b-0 md:border-r">
      <div className="hidden h-10 flex-none items-center px-4 text-[13px] font-medium md:flex">
        Тохиргоо
      </div>
      <nav
        aria-label="Тохиргоо"
        className="flex gap-1 overflow-x-auto p-2 md:flex-col md:overflow-visible md:pt-0"
      >
        <Link href="/" className={cn(navItemClass, "text-foreground")}>
          <ChevronLeftIcon aria-hidden="true" />
          Тохиргооноос гарах
        </Link>
        {sections.map((item, index) => {
          const isActive = item.value === active.value
          const startsGroup =
            index === 0 || sections[index - 1].group !== item.group

          return (
            <Fragment key={item.value}>
              {startsGroup && <div className="hidden h-2 md:block" />}
              <button
                type="button"
                aria-current={isActive ? "page" : undefined}
                onClick={() => setSection(item.value)}
                className={cn(
                  navItemClass,
                  isActive
                    ? "bg-primary/10 text-primary hover:bg-primary/10"
                    : "[&>svg]:text-muted-foreground"
                )}
              >
                <item.icon aria-hidden="true" />
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            </Fragment>
          )
        })}
      </nav>
    </aside>
  )
}

const SettingsHeader = () => {
  const { active } = useSettingsSections()

  return (
    <div className="flex h-10 flex-none items-center gap-2 border-b bg-background px-4 text-[13px] font-medium">
      <active.icon className="size-4 flex-none" aria-hidden="true" />
      <span className="truncate">{active.label}</span>
    </div>
  )
}

const Layout = ({ children }: { children?: React.ReactNode }) => (
  <Suspense fallback={null}>
    <div className="flex h-screen w-screen flex-col bg-background md:flex-row">
      <SettingsNavigation />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col">
        <SettingsHeader />
        <div className="min-h-0 flex-auto overflow-y-auto">{children}</div>
      </main>
    </div>
  </Suspense>
)

export default Layout
