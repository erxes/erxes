import { gql } from '@apollo/client';

export const GET_TICKET_SOURCE = gql`
  query ReportTicketSource($filters: TicketReportFilter) {
    reportTicketSource(filters: $filters) {
      _id
      name
      count
      percentage
    }
  }
`;

export const GET_TICKET_TAGS = gql`
  query ReportTicketTags($filters: TicketReportFilter) {
    reportTicketTags(filters: $filters) {
      _id
      name
      count
      percentage
      colorCode
    }
  }
`;

export const GET_TICKET_DATE = gql`
  query ReportTicketDate($filters: TicketReportFilter) {
    reportTicketDate(filters: $filters) {
      date
      count
    }
  }
`;

export const GET_TICKET_OPEN = gql`
  query ReportTicketOpen($filters: TicketReportFilter) {
    reportTicketOpen(filters: $filters) {
      count
      percentage
    }
  }
`;

export const GET_TICKET_LIST = gql`
  query ReportTicketList($filters: TicketReportFilter) {
    reportTicketList(filters: $filters) {
      list {
        _id
        name
        statusId
        state
        priority
        assigneeId
        createdAt
        targetDate
        startDate
        tagIds
        pipelineId
      }
      page
      totalCount
      totalPages
    }
  }
`;

export const GET_TICKET_TOTAL_COUNT = gql`
  query ReportTicketTotalCount($filters: TicketReportFilter) {
    reportTicketTotalCount(filters: $filters)
  }
`;

export const GET_TICKET_STATUS_SUMMARY = gql`
  query ReportTicketStatusSummary($filters: TicketReportFilter) {
    reportTicketStatusSummary(filters: $filters) {
      statusType
      name
      color
      count
      percentage
    }
  }
`;

export const GET_TICKET_PRIORITY = gql`
  query ReportTicketPriority($filters: TicketReportFilter) {
    reportTicketPriority(filters: $filters) {
      priority
      name
      color
      count
      percentage
    }
  }
`;
