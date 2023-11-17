import React, { useState } from "react"

type Props = {}

const Breadcrumb = (props: Props) => {
  const navigations = [
    { id: "1", name: "Getting Started" },
    { id: "2", name: "Initial Setup" },
    { id: "3", name: "Getting Started" },
  ]

  const [active, setActive] = useState(false)

  const navigation = navigations.map((nav, index) => (
    <p
      key={index}
      className={`${active ? "text-[#000]" : "text-gray-600 text-opacity-50"}`}
    >
      {nav.name}
    </p>
  ))

  return <div className={`w-full px-10 py-5 flex`}>{navigation}</div>
}

export default Breadcrumb
