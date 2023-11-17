import React, { useState } from "react"
import { useCategory } from "@/modules/discover/hooks/useCategory"

type Props = {}

const CategoryList = (props: Props) => {
  const { category, loading } = useCategory({
    id: "rWgiSJ6LPMFijp3SP",
  })

  const [isActive, setIsActive] = useState(true)

  return (
    <div className="w-3/12 px-10 py-5 flex flex-col gap-5">
      {[1, 2, 3, 4].map((n) => (
        <div key={n}>
          <h6 className="text-[16px] font-medium">{n}. Getting Started</h6>
          <ul className="pl-8 pt-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <li
                key={i}
                className={`flex justify-between py-2 ${
                  isActive ? "#551A8B" : ""
                }`}
              >
                <p>Initial setup</p>
                <p>1</p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export default CategoryList
