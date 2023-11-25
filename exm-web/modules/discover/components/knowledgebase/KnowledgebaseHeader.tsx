import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { exmAtom } from "@/modules/JotaiProiveder"
import { useAtomValue } from "jotai"
import { Search } from "lucide-react"

import { useDiscover } from "../../hooks/useDiscover"

const KnowledgebaseHeader = () => {
  const exm = useAtomValue(exmAtom)

  const router = useRouter()
  const [searchValue, setSearchValue] = useState<string>("")

  const { topics } = useDiscover({ id: exm?.knowledgeBaseTopicId! })

  const onSubmit = () => {
    router.replace(`?searchValue=${searchValue}`)
  }

  const handleKeyDown = (e: any) => {
    if (e.keyCode === 13 && e.shiftKey === false) {
      e.preventDefault()
      onSubmit()
    }
  }

  const title = exm ? exm.webName : topics ? topics.title : "Exm"
  const description = exm
    ? exm.webDescription
    : topics
    ? topics.description
    : ""
  const color = exm
    ? exm.appearance.primaryColor
    : topics
    ? topics.color
    : "#4f46e5"

  console.log(color)

  return (
    <div
      className={`relative isolate p-9`}
      style={{
        backgroundColor: color,
      }}
    >
      <h1 className="text-[18px] font-bold tracking-tight text-gray-200">
        {title} User Guide
      </h1>
      <p className="mt-5 text-[14px] leading-5 text-gray-200 line-clamp-3">
        {description}
      </p>
      <div className="mt-5 flex items-center justify-center gap-x-6">
        <div className="w-full py-2.5 px-3.5 flex justify-between items-center text-gray-200 border rounded">
          <input
            type="text"
            placeholder="Search for articles"
            className="text-sm font-semibold pr-3.5 w-full bg-transparent"
            onChange={(e) => setSearchValue(e.target.value)}
            value={searchValue}
            onKeyDown={handleKeyDown}
          />
          <Search size={16} className="cursor-pointer" onClick={onSubmit} />
        </div>
      </div>
    </div>
  )
}

export default KnowledgebaseHeader
