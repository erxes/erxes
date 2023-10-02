import Link from "next/link"
import { ChevronLeftIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

const BackButton = () => {
  return (
    <Button
      className="font-extrabold px-2"
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
