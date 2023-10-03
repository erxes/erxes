import Link from "next/link"

import Image from "@/components/ui/image"

const Welcome = () => {
  return (
    <Link href={"/choose-type"} className="h-screen relative block">
      <Image
        src={"/kiosk-welcome.png"}
        alt=""
        quality={100}
        sizes="100vw"
        className="object-cover"
      />
    </Link>
  )
}

export default Welcome
