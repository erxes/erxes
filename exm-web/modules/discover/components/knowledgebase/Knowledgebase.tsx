"use client"

import React from "react"

import { useDiscover } from "../../hooks/useDiscover"
import KnowledgebaseList from "../knowledgebase/KnowledgebaseList"

type Props = {}

const Knowledgebase = (props: Props) => {
  const { config, topic, loading } = useDiscover({
    id: "-WK9kACSlXMqIoS8-Qqdy",
  })

  return <KnowledgebaseList configs={config} topics={topic} />
}

export default Knowledgebase
