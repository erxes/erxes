"use client"

import React, { useContext } from "react"
import { useAtomValue } from "jotai"

import Loader from "@/components/ui/loader"

import { useDiscover } from "../../hooks/useDiscover"
import KnowledgebaseList from "../knowledgebase/KnowledgebaseList"
import { KnowledgebaseContext } from "./KnowledgebaseProvider"

type Props = {}

const Knowledgebase = (props: Props) => {
  const { knowledgebase } = useContext(KnowledgebaseContext)

  if (!knowledgebase) {
    return <Loader />
  }

  return <KnowledgebaseList topics={knowledgebase} />
}

export default Knowledgebase
