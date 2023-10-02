"use client"

import dynamic from "next/dynamic"

const Apollo = dynamic(() => import("./apolloClient"))

const Provider = ({ children }: { children: React.ReactNode }) => {
  return <Apollo>{children}</Apollo>
}

export default Provider
