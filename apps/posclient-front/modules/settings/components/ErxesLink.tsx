import Link from "next/link"

import { getEnv } from "@/lib/utils"

import SettingsButton from "./Button"

const ErxesLink = ({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) => {
  const env = getEnv()
  return (
    <SettingsButton
      Component={Link}
      href={env.NEXT_PUBLIC_SERVER_DOMAIN + href}
      target="_blank"
    >
      {children}
    </SettingsButton>
  )
}

export default ErxesLink
