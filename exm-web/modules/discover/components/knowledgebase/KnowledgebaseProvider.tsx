"use client"

import React, { createContext, useEffect, useState } from "react"

import { toast } from "@/components/ui/use-toast"

import { useDiscover } from "../../hooks/useDiscover"

export const KnowledgebaseContext = createContext<{
  knowledgebase: any
}>({
  knowledgebase: null,
})

const KnowledgebaseProvider = ({ children }: { children: JSX.Element }) => {
  const [knowledgebase, setKnowledgebase] = useState(null)

  const { topic, loading, error } = useDiscover({ id: "-WK9kACSlXMqIoS8-Qqdy" })

  if (error) {
    toast({
      description: error.message,
      title: `Get Knowledgebase`,
      variant: "destructive",
    })
  }

  useEffect(() => {
    setKnowledgebase(topic)
  }, [topic])

  return (
    <KnowledgebaseContext.Provider value={{ knowledgebase }}>
      {children}
    </KnowledgebaseContext.Provider>
  )
}

export default KnowledgebaseProvider
