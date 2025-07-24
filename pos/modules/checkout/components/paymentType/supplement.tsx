"use client"

import { forwardRef } from "react"
import UserInfo from "./userInfo"

const PrintableSupplement = forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <div ref={ref} className="text-gray-900 p-6 max-w-full mx-auto bg-white shadow-lg rounded-lg my-8">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <UserInfo />
        </div>
    </div>
  )
})

PrintableSupplement.displayName = "PrintableSupplement"

export default PrintableSupplement
