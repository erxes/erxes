import { useMemo } from 'react'

const printTheme = {
  colors: {
    primary: '#374151',
    secondary: '#6b7280', 
    text: '#111827',
    background: '#f9fafb',
    border: '#d1d5db',
    tableBorder: '#374151',
    danger: '#dc2626',
    success: '#059669',
    headerBg: '#f3f4f6',
  },
  spacing: {
    xs: '4px',
    sm: '8px', 
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  typography: {
    small: '12px',
    base: '14px',
    lg: '18px',
    xl: '28px',
  },
} as const

export const usePrintStyles = () => {
  return useMemo(() => ({
    // UserInfo component styles
    userInfo: {
      container: {
        padding: printTheme.spacing.sm,
        backgroundColor: 'white',
        color: printTheme.colors.text,
      },
      
      heading: {
        fontSize: printTheme.typography.lg,
        fontWeight: 'bold' as const,
        color: printTheme.colors.primary,
        marginBottom: printTheme.spacing.md,
      },
      
      userInfoSection: {
        marginBottom: printTheme.spacing.md,
      },
      
      userInfoItem: {
        marginBottom: printTheme.spacing.sm,
        fontSize: printTheme.typography.base,
      },
      
      totalAmount: {
        fontSize: printTheme.typography.lg,
        fontWeight: 'bold' as const,
        marginTop: printTheme.spacing.md,
      },
      
      sectionDivider: {
        borderTop: `1px solid ${printTheme.colors.border}`,
        paddingTop: printTheme.spacing.md,
        marginBottom: printTheme.spacing.md,
      },
      
      emptyCart: {
        textAlign: 'center' as const,
        padding: printTheme.spacing.lg,
        color: printTheme.colors.secondary,
      },
      
      infoSection: {
        backgroundColor: printTheme.colors.background,
        padding: printTheme.spacing.md,
        color: printTheme.colors.primary,
        lineHeight: '1.6',
        fontSize: printTheme.typography.base,
        marginBottom: printTheme.spacing.md,
      },
      
      dateSection: {
        backgroundColor: printTheme.colors.background,
        padding: printTheme.spacing.md,
        fontSize: printTheme.typography.base,
        color: printTheme.colors.primary,
        marginBottom: printTheme.spacing.md,
      },
      
      dateGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: printTheme.spacing.lg,
      },
      
      dateLabel: {
        fontWeight: 'bold' as const,
        color: printTheme.colors.primary,
        marginBottom: printTheme.spacing.sm,
      },
      
      dateValue: {
        fontWeight: '500' as const,
        marginBottom: '4px',
      },
      
      dateTime: {
        fontSize: printTheme.typography.small,
        color: printTheme.colors.secondary,
      },
      
      deadlineDate: {
        color: printTheme.colors.danger,
        fontWeight: 'bold' as const,
        marginBottom: '4px',
      },
      
      deadlineNote: {
        fontSize: printTheme.typography.small,
        color: printTheme.colors.danger,
      },
      
      signatureSection: {
        borderTop: `1px solid ${printTheme.colors.border}`,
        paddingTop: printTheme.spacing.md,
        fontSize: printTheme.typography.base,
        color: printTheme.colors.primary,
      },
      
      signatureLabel: {
        fontWeight: 'bold' as const,
        marginBottom: printTheme.spacing.sm,
      },
      
      signatureLine: {
        width: '192px',
        height: '24px',
        borderBottom: `1px solid ${printTheme.colors.secondary}`,
        marginBottom: printTheme.spacing.sm,
      },
      
      signatureNote: {
        fontSize: printTheme.typography.small,
        color: printTheme.colors.secondary,
      },
    },

    // Table component styles  
    table: {
      container: {
        width: '100%',
        border: `1px solid ${printTheme.colors.tableBorder}`,
        marginTop: printTheme.spacing.md,
        marginBottom: printTheme.spacing.md,
      },
      
      table: {
        width: '100%',
        borderCollapse: 'collapse' as const,
        fontSize: printTheme.typography.base,
      },
      
      header: {
        backgroundColor: printTheme.colors.headerBg,
      },
      
      headerCell: {
        border: `1px solid ${printTheme.colors.tableBorder}`,
        padding: `${printTheme.spacing.md} ${printTheme.spacing.sm}`,
        fontWeight: 'bold' as const,
      },
      
      headerCellCenter: {
        border: `1px solid ${printTheme.colors.tableBorder}`,
        padding: `${printTheme.spacing.md} ${printTheme.spacing.sm}`,
        textAlign: 'center' as const,
        fontWeight: 'bold' as const,
      },
      
      headerCellRight: {
        border: `1px solid ${printTheme.colors.tableBorder}`,
        padding: `${printTheme.spacing.md} ${printTheme.spacing.sm}`,
        textAlign: 'right' as const,
        fontWeight: 'bold' as const,
      },
      
      cell: {
        border: `1px solid ${printTheme.colors.tableBorder}`,
        padding: `10px ${printTheme.spacing.sm}`,
      },
      
      cellCenter: {
        border: `1px solid ${printTheme.colors.tableBorder}`,
        padding: `10px ${printTheme.spacing.sm}`,
        textAlign: 'center' as const,
        fontWeight: '500' as const,
      },
      
      cellRight: {
        border: `1px solid ${printTheme.colors.tableBorder}`,
        padding: `10px ${printTheme.spacing.sm}`,
        textAlign: 'right' as const,
      },
      
      cellRightBold: {
        border: `1px solid ${printTheme.colors.tableBorder}`,
        padding: `10px ${printTheme.spacing.sm}`,
        textAlign: 'right' as const,
        fontWeight: '500' as const,
      },
      
      productName: {
        fontWeight: '500' as const,
        marginBottom: '4px',
      },
      
      takeAwayLabel: {
        fontSize: printTheme.typography.small,
        color: printTheme.colors.success,
        fontWeight: '500' as const,
      },
    },

    // PrintableSupplement component styles
    supplement: {
      container: {
        color: printTheme.colors.text,
        padding: printTheme.spacing.lg,
        maxWidth: '100%',
        margin: '0 auto',
        backgroundColor: 'white',
        border: `2px solid ${printTheme.colors.border}`,
        borderRadius: '8px',
        marginTop: printTheme.spacing.xl,
        marginBottom: printTheme.spacing.xl,
        fontFamily: 'Arial, sans-serif',
      },
      
      headerSection: {
        borderBottom: `3px solid ${printTheme.colors.primary}`,
        paddingBottom: printTheme.spacing.md,
        marginBottom: printTheme.spacing.lg,
      },
      
      title: {
        fontSize: printTheme.typography.xl,
        fontWeight: 'bold' as const,
        textAlign: 'center' as const,
        marginBottom: printTheme.spacing.sm,
        color: printTheme.colors.primary,
      },
      
      contentWrapper: {
        backgroundColor: printTheme.colors.background,
        padding: printTheme.spacing.md,
        borderRadius: '8px',
        border: `1px solid ${printTheme.colors.border}`,
      },
    },

    // Column widths
    columnWidths: {
      index: '60px',
      quantity: '120px', 
      unitPrice: '140px',
      totalPrice: '140px',
    },

    // Theme access for custom styling
    theme: printTheme,
  }), [])
}