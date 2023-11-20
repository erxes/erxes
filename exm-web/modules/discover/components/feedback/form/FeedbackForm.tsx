import React, { useState } from "react"

import FeedbackTabs from "./FeedbackTabs"

type Props = {}

const FeedbackForm = (props: Props) => {
  const [tab, setTab] = useState("feedback")

  let selectedTab

  if (tab === "feedback") {
    selectedTab = "Санал хүсэлт"
  }
  if (tab === "application") {
    selectedTab = "Өргөдөл"
  }
  if (tab === "complaint") {
    selectedTab = "Гомдол"
  }

  return (
    <div className="h-[calc(100vh-66px)]">
      <div className="h-full px-20 py-10 flex flex-col items-center justify-evenly">
        <div className="w-[400px]">Stepper</div>
        <div className="w-full">
          <h2 className="text-[24px] font-semibold">{selectedTab} илгээх</h2>
          <p className="text-[14px] font-normal mt-2">
            Танд тулгарсан асуудлыг бид шийдвэрлэж өгье.
          </p>
        </div>

        <div className="w-full">
          <p className="text-[14px] font-normal mb-5">
            Та санал хүсэлт илгээх төрлөө сонгоно уу.
          </p>
          <FeedbackTabs tab={tab} setTab={setTab} />
        </div>
      </div>
    </div>
  )
}

export default FeedbackForm
