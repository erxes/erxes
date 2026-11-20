import React from "react"
import { searchAtom } from "@/store"
import { searchPopoverAtom } from "@/store/ui.store"
import { motion } from "framer-motion"
import { useAtom } from "jotai"
import { SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

const Search: React.FC = () => {
  const [focused, setFocused] = useAtom(searchPopoverAtom)
  const [search, setSearch] = useAtom(searchAtom)

  const show = focused || search

  return (
    <motion.div
      animate={{
        width: show ? 270 : "2.5rem",
        borderRadius: show ? 8 : 24,
      }}
      className="relative my-2 mr-3 flex h-10 flex-none overflow-hidden bg-background shadow-xs transition-shadow focus-within:shadow-focus"
    >
      <SearchIc className="left-3 h-4 w-4 text-muted-foreground" />
      <Input
        className={cn(
          "z-1 relative h-10 border-none bg-transparent focus-visible:shadow-none",
          focused && "pl-9"
        )}
        onFocus={() => setFocused(true)}
        onBlur={() => !search && setFocused(false)}
        onChange={(e) => setSearch(e.target.value)}
        value={search}
        placeholder={focused ? "Хайх.." : ""}
      />
    </motion.div>
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
