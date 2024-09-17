import React, { useEffect, useState } from 'react'
import { PivotTable, ScrollWrapper } from '../../styles'

type Props = {
    dataset: any
}

const PivotTableRenderer = (props: Props) => {

    const { dataset } = props

    const { headers = [], body = [] } = dataset || {}

    const [tableHeaders, setTableHeaders] = useState<any[]>([])
    const [tableBody, setTableBody] = useState<any[]>([])

    useEffect(() => {
        setTableHeaders(headers)
        setTableBody(body)
    }, [headers?.length, body?.length])

    return (
        <ScrollWrapper>
            <PivotTable $bordered={true} $striped={true} $condensed={true}>
                <thead>
                    {(tableHeaders || []).map((headerRow, headerRowIndex) => (
                        <tr key={headerRowIndex}>
                            {(headerRow || []).map((header, headerIndex) => {
                                if (header.rowspan === 0 || header.colspan === 0) {
                                    return null
                                }

                                return (
                                    <th
                                        rowSpan={header.rowspan || undefined}
                                        colSpan={header.colspan || undefined}
                                    >
                                        {header.content}
                                    </th>
                                )
                            })}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {(tableBody || []).map((bodyRow, bodyRowIndex) => (
                        <tr key={bodyRowIndex}>
                            {(bodyRow || []).map((cell, cellIndex) => {
                                if (cell.rowspan === 0 || cell.colspan === 0) {
                                    return <td style={{ display: 'none' }} />
                                }

                                return (
                                    <td
                                        rowSpan={cell.rowspan || undefined}
                                        colSpan={cell.colspan || undefined}
                                        className={cell.className || ''}
                                    >
                                        {cell.content}
                                    </td>
                                )
                            })}
                        </tr>
                    ))}
                </tbody>
            </PivotTable>
        </ScrollWrapper>
    )
}

export default PivotTableRenderer