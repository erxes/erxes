export const coverFields = `
  _id
  status
  beginDate
  endDate
  description
  details {
    _id
    paidType
    paidDetail
    paidSummary { _id amount kind kindOfVal value }
    terminalResults { _id bank response createdAt }
  }
`
