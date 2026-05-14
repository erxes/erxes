import { searchAtom } from "@/store"
import { useAtom } from "jotai"

import { Input } from "@/components/ui/input"

import { SearchIc } from "./search.main"

const Search = () => {
  const [search, setSearch] = useAtom(searchAtom)

  return (
    <div className="relative flex-1">
      <SearchIc className="w-4 h-4" />
      <Input
        className="pl-8"
        placeholder="Барааний нэр, баркод, код"
        onChange={(e) => setSearch(e.target.value)}
        value={search}
      />
    </div>
  )
}

export default Search
