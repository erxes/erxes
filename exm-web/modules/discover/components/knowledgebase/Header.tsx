import React, { useState } from "react"
import { Search } from "lucide-react"

import { useArticle } from "../../hooks/useArticle"

type Props = {}

const Header = (props: Props) => {
  const [searchValue, setSearchValue] = useState("")

  const { articles, loading } = useArticle({
    id: "rWgiSJ6LPMFijp3SP",
    searchValue,
  })

  const handleSearchInput = (e: any) => {
    setSearchValue(e.target.value)
  }

  return (
    <div className="flex flex-col bg-[#4F33AF] h-[216px] px-20 text-[#fff] justify-evenly">
      <div className="text-[26px] font-normal leading-7">
        <span className="text-[#A251E1] font-medium">Exm </span>
        Гарын авлагууд
      </div>
      <div className="font-normal  text-[20px] leading-6">
        A knowledge-sharing help center designed specially for the erxes
        community
      </div>
      <div className="flex justify-between items-center px-5 py-3 border border-white rounded-md w-4/5">
        <input
          type="text"
          placeholder="Search for articles"
          className="bg-transparent w-full"
          onChange={handleSearchInput}
        />
        <Search color="#fff" size={16} />
      </div>
    </div>
  )
}

export default Header
