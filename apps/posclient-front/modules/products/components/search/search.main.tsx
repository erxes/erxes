import React from "react"
import { searchAtom } from "@/store"
import { searchPopoverAtom } from "@/store/ui.store"
import { useAtom, useSetAtom } from "jotai"
import { SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

const Search: React.FC = () => {
  const setFocused = useSetAtom(searchPopoverAtom)
  const [search, setSearch] = useAtom(searchAtom)

  return (
    <div className="relative w-full max-w-72 sm:w-60">
      <SearchIc className="pointer-events-none left-2.5 z-10 size-3.5 text-muted-foreground" />
      <Input
        type="search"
        aria-label="Бараа хайх"
        placeholder="Бараа хайх…"
        className="h-7 rounded-sm border-0 bg-background pl-8 text-[13px] shadow-xs placeholder:text-muted-foreground/70 focus-visible:shadow-focus"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(event) => setSearch(event.target.value)}
        value={search}
      />
    </div>
  )
}

export const SearchIc = ({ className }: { className?: string }) => (
  <SearchIcon
    className={cn(
      "absolute left-2 top-1/2 h-4 w-4 -translate-y-2/4 text-muted-foreground",
      className
    )}
    strokeWidth={2}
  />
)

export default Search
