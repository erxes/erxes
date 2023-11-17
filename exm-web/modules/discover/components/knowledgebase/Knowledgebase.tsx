import React from "react"

import { ScrollArea } from "@/components/ui/scroll-area"

import Breadcrumb from "./Breadcrumb"
import Header from "./Header"
import List from "./List"
import ArticleList from "./article/ArticleList"
import CategoryList from "./category/CategoryList"

type Props = {}

const Knowledgebase = (props: Props) => {
  return (
    <ScrollArea className="h-[calc(100vh-66px)]">
      <Header />
      <List />
      <div>
        <Breadcrumb />
        <div className="flex">
          <CategoryList />
          <ArticleList />
        </div>
      </div>
    </ScrollArea>
  )
}

export default Knowledgebase
