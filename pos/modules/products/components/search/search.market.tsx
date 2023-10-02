"use client"

import Products from "@/modules/products/products.market"
import { searchAtom } from "@/store"
import { searchPopoverAtom } from "@/store/ui.store"
import { AnimatePresence, motion } from "framer-motion"
import { useAtom } from "jotai"
import { SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input, InputProps } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const Content = motion(PopoverContent)

const Search = () => {
  const [open, setOpen] = useAtom(searchPopoverAtom)

  return (
    <SearchTrigger onClick={() => setOpen(true)}>
      <Popover open={open} onOpenChange={() => setOpen((prev) => !prev)} modal>
        <PopoverTrigger className="absolute -top-4 h-0 w-full" asChild>
          <div />
        </PopoverTrigger>
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
              <div className="flex items-center">
                <SearchInput className="flex-auto" />
                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "auto" }}
                    >
                      <Button
                        className="ml-3 px-3 text-black/60 hover:text-black/60"
                        variant="outline"
                        onClick={() => setOpen(false)}
                      >
                        Esc
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <Products />
            </Content>
          )}
        </AnimatePresence>
      </Popover>
    </SearchTrigger>
  )
}

const SearchInput = ({ onClick, className, ...rest }: InputProps) => {
  const [search, setSearch] = useAtom(searchAtom)
  return (
    <div className={cn("relative", className)}>
      <Input
        {...rest}
        className="h-10 pl-8"
        placeholder="1062 - Төмс (Монгол)"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onClick={onClick}
      />
      <SearchIc />
    </div>
  )
}

const SearchTrigger = ({
  onClick,
  children,
}: {
  onClick?: () => void
  children: React.ReactNode
}) => {
  const [search] = useAtom(searchAtom)
  return (
    <div className="relative">
      <div className="flex h-10 w-full items-center rounded-md border border-input bg-transparent py-2 pl-8 text-transparent">
        1062 - Төмс (Монгол)
      </div>
      <SearchIcon className="absolute left-2 top-1/2 h-4 w-4 -translate-y-2/4 text-black/40 " />
      <div
        className={cn(
          "absolute left-[33px] top-[13px]  xl:top-[20%]",
          !!search ? "text-black" : "text-muted-foreground"
        )}
      >
        {search || "1062 - Төмс (Монгол)"}
      </div>
      <div className="absolute inset-0" onClick={onClick}></div>
      {children}
    </div>
  )
}

export const SearchIc = ({ className }: { className?: string }) => (
  <SearchIcon
    className={cn(
      "absolute left-2 top-1/2 h-4 w-4 -translate-y-2/4 text-black/40",
      className
    )}
    strokeWidth={2}
  />
)

const itemVariants = {
  animate: {
    opacity: 1,
    height: "80vh",
  },
  initial: {
    height: 0,
    opacity: 0,
  },
}

export default Search
