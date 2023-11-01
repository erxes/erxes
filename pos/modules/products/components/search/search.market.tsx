import Products from "@/modules/products/products.market"
import { searchAtom } from "@/store"
import { searchPopoverAtom } from "@/store/ui.store"
import { AnimatePresence, motion } from "framer-motion"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { SearchIcon } from "lucide-react"

import useKeyEvent from "@/lib/useKeyEvent"
import { Button } from "@/components/ui/button"
import { Command, CommandInput } from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const Content = motion(PopoverContent)

const Search = () => {
  const [open, setOpen] = useAtom(searchPopoverAtom)
  useKeyEvent(() => setOpen(true), "F6")

  return (
    <SearchTrigger>
      <Popover open={open} onOpenChange={(op) => setOpen(op)} modal>
        <PopoverTrigger className="absolute -top-4 h-0 w-full" />
        <AnimatePresence>
          {open && (
            <Content
              className="flex flex-col border-none p-3"
              animateCss={false}
              variants={itemVariants}
              initial="initial"
              animate="animate"
              exit="initial"
              transition={{
                duration: 0.3,
              }}
              style={{
                width: "calc(var(--radix-popper-anchor-width) + 1.5rem)",
              }}
            >
              <Command shouldFilter={false}>
                <SearchInput />
                <Products />
              </Command>
            </Content>
          )}
        </AnimatePresence>
      </Popover>
    </SearchTrigger>
  )
}

const SearchInput = () => {
  const [search, setSearch] = useAtom(searchAtom)
  const setOpen = useSetAtom(searchPopoverAtom)

  return (
    <div className="relative">
      <CommandInput
        placeholder="Бараа хайх F6"
        value={search}
        onValueChange={(value) => setSearch(value)}
      />
      <AnimatePresence>
        <Button
          className="ml-3 px-3 text-black/60 hover:text-black/60 absolute top-1/2 right-0 -translate-y-1/2"
          size="sm"
          variant="ghost"
          onClick={() => setTimeout(() => setOpen(false))}
        >
          Esc
        </Button>
      </AnimatePresence>
    </div>
  )
}

const SearchTrigger = ({ children }: { children: React.ReactNode }) => {
  const searchValue = useAtomValue(searchAtom)
  const setOpen = useSetAtom(searchPopoverAtom)
  return (
    <div className="relative" onClick={() => setOpen(true)}>
      <div className="py-3 h-11 flex relative pl-3 text-popover-foreground/70 items-center leading-none">
        <SearchIcon className={"h-4 w-4 mr-2"} strokeWidth={2} />
        <span className="border-t-2 border-white">
          {searchValue || "Бараа хайх F6"}
        </span>
      </div>
      {children}
    </div>
  )
}

const itemVariants = {
  animate: {
    opacity: 1,
    height: "80vh",
  },
  initial: {
    height: "40vh",
    opacity: 0,
  },
}

export default Search
