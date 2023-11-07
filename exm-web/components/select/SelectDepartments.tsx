"use client"

import { useState } from "react"
import Select from "react-select"

import { Input } from "@/components/ui/input"

import { useDepartments } from "../hooks/useDepartments"

const SelectDepartments = ({
  field,
  departmentIds,
  onChange,
}: {
  field?: any
  onChange: (departmentIds: string[]) => void
  departmentIds: string[]
}) => {
  const [reload, setReload] = useState(false)

  const [searchValue, setSearchValue] = useState("")

  const { departmentsOption, loading } = useDepartments({
    departmentIds,
    reload,
    searchValue,
  })

  const onChangeMultiValue = (datas: any) => {
    const ids = datas.map((data: any) => data.value)

    onChange(ids)
  }

  return (
    <>
      {loading && !reload && !searchValue ? (
        <Input disabled={true} placeholder="Loading..." />
      ) : (
        <Select
          onMenuClose={() => setReload(false)}
          onMenuOpen={() => setReload(true)}
          isMulti={true}
          options={departmentsOption}
          defaultValue={departmentsOption?.filter((departmentOption) =>
            departmentIds?.includes(departmentOption?.value)
          )}
          placeholder="Select departments"
          isSearchable={true}
          onInputChange={setSearchValue}
          onChange={(data) => {
            onChangeMultiValue(data)
          }}
        />
      )}
    </>
  )
}

export default SelectDepartments
