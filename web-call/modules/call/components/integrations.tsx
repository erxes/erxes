import React from "react"

import { Button } from "@/components/ui/button"

import { IHandleCall } from "../containers/Call"
import "./List.css"
import { useState } from "react"
import Alert from "@/modules/utils/Alert"

const Integrations = ({
  loading,
  integrations,
  call,
}: {
  loading: boolean
  integrations: any
  call: IHandleCall
}) => {
  const [integrationId, setIntegrationId] = useState("")

  const onSubmit = () => {
    if (!integrationId) {
      return Alert.error("Please choose an integration")
    } else {
      call({ integrationId: integrationId })
    }
  }

  const handleClick = (integrationId: string) => {
    setIntegrationId(integrationId)
  }
  return (
    <div>
      <h2 className="text-[#673FBD] text-3xl font-bold mb-4">{"Web call"}</h2>

      <div className="list-container">
        <ul className="list">
          {integrations?.map((item: any) => (
            <li
              key={item._id}
              className={`list-item ${
                integrationId === item.erxesApiId ? "active" : ""
              }`}
              onClick={() => handleClick(item.erxesApiId)}
            >
              {item.name}
            </li>
          ))}
        </ul>
      </div>
      <Button
        loading={loading}
        type="submit"
        className="w-full font-bold uppercase"
        onClick={onSubmit}
      >
        Залгах
      </Button>
    </div>
  )
}

export default Integrations
