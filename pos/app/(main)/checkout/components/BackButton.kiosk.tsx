import Link from "next/link"
import { ChevronLeftIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

const BackButton = () => {
  return (
    <Button
      className="font-extrabold p-3 h-auto"
      variant={"secondary"}
      size="sm"
      Component={Link}
      href={"/home"}
    >
      <ChevronLeftIcon className="h-5 w-5 -ml-1 " strokeWidth={2} />
      Буцах
    </Button>
  )
}

export default BackButton
