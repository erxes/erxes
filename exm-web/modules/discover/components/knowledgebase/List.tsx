import React from "react"
import Link from "next/link"
import { MenuSquare, User } from "lucide-react"

import { Button } from "@/components/ui/button"

type Props = {}

const List = (props: Props) => {
  return (
    <div className="flex flex-col px-20 py-10">
      {[1, 2].map((i) => (
        <div key={i} className="flex flex-col gap-3">
          <h1 className="text-[22px] font-semibold">Getting Started</h1>
          <h3 className="text-[16px] font-normal">
            Must do settings required for all features and future use cases
          </h3>

          <div className="grid grid-cols-3 gap-7 p-5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((n) => (
              <article
                key={n}
                className="bg-white p-[30px] flex flex-col gap-3"
              >
                <div className="text-[22px] font-semibold"> Initial setup</div>
                <p className="text-[16px] font-normal line-clamp-4">
                  Coordinate and manage all your customer interactions with an
                  all in one crm system and managing design
                </p>
                <div className="flex justify-between text-[14px] font-medium">
                  <p className="flex gap-1 items-start">
                    <MenuSquare size={16} /> 4 Articles
                  </p>
                  <p className="flex gap-1 items-start">
                    <User size={16} /> 2 Authors
                  </p>
                </div>
                <Button>Read More</Button>
              </article>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default List
