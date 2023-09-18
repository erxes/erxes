import React, { useState } from "react"
import { searchAtom } from "@/store"
import { motion } from "framer-motion"
import { useAtom } from "jotai"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

import { SearchIc } from "./search.market"

const Search: React.FC = () => {
  const [focused, setFocused] = useState(false)
  const [search, setSearch] = useAtom(searchAtom)

  return (
    <motion.div
      animate={{
        width: focused ? 270 : "2.5rem",
        borderRadius: focused ? 8 : 24,
      }}
      className="relative mr-3 flex flex-none border"
    >
      <SearchIc className="h-5 w-5 text-black/75" />
      <Input
        className={cn("z-1 relative border-none", focused && "pl-9")}
        onFocus={() => setFocused(true)}
        onBlur={() => !search && setFocused(false)}
        onChange={(e) => setSearch(e.target.value)}
        value={search}
        placeholder={focused ? "Хайх.." : ""}
      />
    </motion.div>
  )
}

export default Search
