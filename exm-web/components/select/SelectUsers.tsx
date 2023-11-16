"use client"

import { Input } from "@/components/ui/input"
import Select from "react-select"
import { useState } from "react"
import { useUsers } from "../hooks/useUsers"

const SelectUsers = ({
  field,
  userIds,
  onChange,
  className,
}: {
  field?: any
  onChange: (userIds: string[]) => void
  userIds: string[]
  className?: any
}) => {
  const [reload, setReload] = useState(false)

  const [searchValue, setSearchValue] = useState("")

  const { userOptions, loading } = useUsers({ userIds, reload, searchValue })

  const onChangeMultiValue = (datas: any) => {
    const ids = datas.map((data: any) => data.value)

    onChange(ids)
  }

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
          isMulti={true}
          options={userOptions}
          defaultValue={userOptions?.filter((userOption) =>
            userIds?.includes(userOption?.value)
          )}
          placeholder="Select users"
          isSearchable={true}
          onInputChange={setSearchValue}
          isClearable={false}
          onChange={(data) => {
            onChangeMultiValue(data)
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
