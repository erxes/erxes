import { activeCategoryAtom, searchAtom } from "@/store"
import { useAtom, useSetAtom } from "jotai"

import { Input } from "@/components/ui/input"

import { SearchIc } from "./search.main"

const Search = () => {
  const [search, setSearch] = useAtom(searchAtom)
  const setActiveCat = useSetAtom(activeCategoryAtom)

  return (
    <div className="relative flex-1">
      <SearchIc className="h-4 w-4" />
      <Input
        className="pl-8"
        placeholder="Барааний нэр, баркод, код"
        onFocus={() => {
          setActiveCat("")
        }}
        onChange={(e) => setSearch(e.target.value)}
        value={search}
      />
    </div>
  )
}

export default Search
