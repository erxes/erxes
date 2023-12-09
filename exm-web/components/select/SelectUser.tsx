"use client"

import { useState } from "react"
import Select from "react-select"

import { Input } from "@/components/ui/input"

import { useUsers } from "../hooks/useUsers"

const SelectUsers = ({
  field,
  userId,
  onChange,
}: {
  field?: any
  onChange: (userId: string) => void
  userId: string
}) => {
  const [reload, setReload] = useState(false)

  const [searchValue, setSearchValue] = useState("")

  const { userOptions, loading } = useUsers({
    userIds: [userId],
    reload,
    searchValue,
  })
  return (
    <>
      {loading && !reload && !searchValue ? (
        <Input
          disabled={true}
          placeholder="Loading..."
          className="sm:rounded-lg"
        />
      ) : (
        <Select
          className="sm:rounded-lg hide-user-remove-button"
          onMenuClose={() => setReload(false)}
          onMenuOpen={() => setReload(true)}
          isMulti={false}
          options={userOptions}
          defaultValue={userOptions?.filter((userOption) =>
            userId?.includes(userOption?.value)
          )}
          placeholder="Select user"
          isSearchable={true}
          onInputChange={setSearchValue}
          isClearable={false}
          onChange={(data) => {
            onChange((data || { value: "" }).value)
            if (field) {
              field.onChange(data)
            }
          }}
        />
      )}
    </>
  )
}

export default SelectUsers
