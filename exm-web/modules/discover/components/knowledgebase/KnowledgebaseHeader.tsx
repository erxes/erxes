import React, { useState } from "react"

import { Search } from "lucide-react"
import { exmAtom } from "@/modules/JotaiProiveder"
import { useAtomValue } from "jotai"
import { useDiscover } from "../../hooks/useDiscover"
import { useRouter } from "next/navigation"

const KnowledgebaseHeader = () => {
  const exm = useAtomValue(exmAtom)

  const router = useRouter()
  const [searchValue, setSearchValue] = useState<string>("")
  const [toggleBar, setToggleBar] = useState(false)

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

  const renderSearchBar = () => {
    return (
      <div className="mt-3 w-full py-2.5 px-3.5 flex justify-between items-center text-gray-300 border rounded">
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
    )
  }

  const title = exm ? exm.webName : topics ? topics.title : "Exm"
  const description = exm
    ? exm.webDescription
    : topics
    ? topics.description
    : ""
  const color = exm
    ? exm.appearance?.primaryColor
    : topics
    ? topics.color
    : "#4f46e5"

  return (
    <div
      className={`relative isolate p-9 shadow-lg`}
      style={{
        backgroundColor: color,
        backgroundImage: 'url("/images/knowledgebase-header.svg")',
        backgroundSize: "fit",
        backgroundPosition: "right 36px center ",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="lg:max-w-5xl">
        <h1 className="text-[18px] font-bold tracking-tight text-gray-200">
          {title} Employee Guide
        </h1>
        <p className="mt-5 text-[14px] leading-5 text-gray-200 line-clamp-3">
          {description}
        </p>

        {renderSearchBar()}
      </div>
    </div>
  )
}

export default KnowledgebaseHeader
