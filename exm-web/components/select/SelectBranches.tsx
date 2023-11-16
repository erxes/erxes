"use client"

import { useState } from "react"
import Select from "react-select"

import { Input } from "@/components/ui/input"

import { useBranches } from "../hooks/useBranches"

const SelectBranches = ({
  field,
  branchIds,
  onChange,
}: {
  field?: any
  onChange: (branchIds: string[]) => void
  branchIds: string[]
}) => {
  const [reload, setReload] = useState(false)

  const [searchValue, setSearchValue] = useState("")

  const { branchesOption, loading } = useBranches({
    branchIds,
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
          options={branchesOption}
          defaultValue={branchesOption?.filter((branchOption) =>
            branchIds?.includes(branchOption?.value)
          )}
          placeholder="Select Branches"
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

export default SelectBranches
