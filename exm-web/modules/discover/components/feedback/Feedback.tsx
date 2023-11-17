import React, { useState } from "react"

import FeedbackTabs from "./FeedbackTabs"
import Stepper from "./Stepper"

type Props = {}

const Feedback = (props: Props) => {
  const [tab, setTab] = useState("feedback")
  const [step, setStep] = useState(1)

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
        <div className="w-[400px]">
          <Stepper step={step} />
        </div>
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
          <FeedbackTabs
            tab={tab}
            setTab={setTab}
            step={step}
            setStep={setStep}
          />
        </div>
      </div>
    </div>
  )
}

export default Feedback
