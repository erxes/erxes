import { atom } from 'jotai'
import { z } from 'zod'

// Base schemas for reusable types
export const brandSchema = z.object({
  id: z.string(),
  name: z.string(),
  isSelected: z.boolean().default(false)
})

export const branchSchema = z.object({
  id: z.string(),
  name: z.string(),
  isSelected: z.boolean().default(false)
})

export const allowTypeSchema = z.object({
  value: z.string(),
  label: z.string(),
  isSelected: z.boolean().default(false)
})

// Overview step - category selection
export const overviewFormSchema = z.object({
  category: z.enum(['ecommerce', 'restaurant']).optional(),
  selectedAt: z.date().optional()
})

// Properties step - basic information
export const propertiesFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  allowTypes: z.array(z.string()).min(1, 'At least one type must be selected'),
  scopeBrandIds: z.array(z.string()).default([]),
  allowBranchIds: z.array(z.string()).default([])
})

// Slot configuration (restaurant only)
export const slotFormSchema = z.object({
  slots: z.array(z.object({
    id: z.string(),
    name: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    isActive: z.boolean().default(true),
    days: z.array(z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])).default([])
  })).default([])
})

// Payment configuration
export const paymentMethodSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['cash', 'card', 'mobile', 'bank_transfer', 'crypto']),
  isEnabled: z.boolean().default(false),
  config: z.record(z.any()).optional() // For method-specific configuration
})

export const paymentsFormSchema = z.object({
  methods: z.array(paymentMethodSchema).default([]),
  defaultMethod: z.string().optional(),
  allowMultiple: z.boolean().default(true),
  minimumAmount: z.number().min(0).optional(),
  maximumAmount: z.number().min(0).optional()
})

// Permission configuration
export const permissionFormSchema = z.object({
  roles: z.array(z.object({
    id: z.string(),
    name: z.string(),
    permissions: z.array(z.string()).default([])
  })).default([]),
  defaultRole: z.string().optional(),
  requireAuthentication: z.boolean().default(true)
})

// Product and service configuration
export const productFormSchema = z.object({
  categories: z.array(z.object({
    id: z.string(),
    name: z.string(),
    isActive: z.boolean().default(true),
    sortOrder: z.number().default(0)
  })).default([]),
  enableInventoryTracking: z.boolean().default(false),
  enableVariants: z.boolean().default(false),
  enableDiscounts: z.boolean().default(true),
  taxRate: z.number().min(0).max(100).default(0)
})

// Appearance configuration
export const appearanceFormSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']).default('light'),
  primaryColor: z.string().default('#3B82F6'),
  secondaryColor: z.string().default('#6B7280'),
  logo: z.object({
    url: z.string().optional(),
    width: z.number().optional(),
    height: z.number().optional()
  }).optional(),
  customCss: z.string().optional(),
  layout: z.enum(['grid', 'list', 'card']).default('grid')
})

// Screen configuration
export const screenFormSchema = z.object({
  displayMode: z.enum(['fullscreen', 'windowed']).default('windowed'),
  resolution: z.object({
    width: z.number().default(1920),
    height: z.number().default(1080)
  }),
  orientation: z.enum(['portrait', 'landscape']).default('landscape'),
  touchEnabled: z.boolean().default(true),
  keyboardShortcuts: z.boolean().default(true)
})

// Ebarimt configuration (receipt/invoice)
export const ebarimtFormSchema = z.object({
  enabled: z.boolean().default(false),
  companyName: z.string().optional(),
  companyTaxId: z.string().optional(),
  registerNumber: z.string().optional(),
  printerConfig: z.object({
    type: z.enum(['thermal', 'inkjet', 'laser']).optional(),
    width: z.number().optional(),
    autocut: z.boolean().default(false)
  }).optional(),
  template: z.string().optional()
})

// Finance configuration
export const financeFormSchema = z.object({
  currency: z.string().default('USD'),
  taxSettings: z.object({
    inclusive: z.boolean().default(false),
    rate: z.number().min(0).max(100).default(0),
    name: z.string().default('Tax')
  }),
  reportingPeriod: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
  enableMultiCurrency: z.boolean().default(false),
  supportedCurrencies: z.array(z.string()).default(['USD'])
})

// Delivery configuration
export const deliveryFormSchema = z.object({
  enabled: z.boolean().default(false),
  methods: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['pickup', 'delivery', 'shipping']),
    cost: z.number().min(0).default(0),
    estimatedTime: z.string().optional(),
    isActive: z.boolean().default(true)
  })).default([]),
  freeDeliveryThreshold: z.number().min(0).optional(),
  maxDeliveryDistance: z.number().min(0).optional(),
  trackingEnabled: z.boolean().default(false)
})

// Sync configuration
export const syncFormSchema = z.object({
  enabled: z.boolean().default(false),
  frequency: z.enum(['realtime', 'hourly', 'daily']).default('hourly'),
  endpoints: z.array(z.object({
    id: z.string(),
    name: z.string(),
    url: z.string().url(),
    method: z.enum(['GET', 'POST', 'PUT', 'PATCH']).default('POST'),
    headers: z.record(z.string()).optional(),
    isActive: z.boolean().default(true)
  })).default([]),
  retryAttempts: z.number().min(0).max(10).default(3),
  timeout: z.number().min(1000).default(30000)
})

// Complete form state schema
export const posFormStateSchema = z.object({
  overview: overviewFormSchema,
  properties: propertiesFormSchema,
  slot: slotFormSchema,
  payments: paymentsFormSchema,
  permission: permissionFormSchema,
  product: productFormSchema,
  appearance: appearanceFormSchema,
  screen: screenFormSchema,
  ebarimt: ebarimtFormSchema,
  finance: financeFormSchema,
  delivery: deliveryFormSchema,
  sync: syncFormSchema
})

// TypeScript types derived from schemas
export type Brand = z.infer<typeof brandSchema>
export type Branch = z.infer<typeof branchSchema>
export type AllowType = z.infer<typeof allowTypeSchema>
export type OverviewFormData = z.infer<typeof overviewFormSchema>
export type PropertiesFormData = z.infer<typeof propertiesFormSchema>
export type SlotFormData = z.infer<typeof slotFormSchema>
export type PaymentsFormData = z.infer<typeof paymentsFormSchema>
export type PermissionFormData = z.infer<typeof permissionFormSchema>
export type ProductFormData = z.infer<typeof productFormSchema>
export type AppearanceFormData = z.infer<typeof appearanceFormSchema>
export type ScreenFormData = z.infer<typeof screenFormSchema>
export type EbarimtFormData = z.infer<typeof ebarimtFormSchema>
export type FinanceFormData = z.infer<typeof financeFormSchema>
export type DeliveryFormData = z.infer<typeof deliveryFormSchema>
export type SyncFormData = z.infer<typeof syncFormSchema>
export type PosFormStateData = z.infer<typeof posFormStateSchema>

// Default values
const defaultPosFormState: PosFormStateData = {
  overview: {},
  properties: {
    name: '',
    description: '',
    allowTypes: [],
    scopeBrandIds: [],
    allowBranchIds: []
  },
  slot: { slots: [] },
  payments: { methods: [], allowMultiple: true },
  permission: { roles: [], requireAuthentication: true },
  product: { 
    categories: [], 
    enableInventoryTracking: false, 
    enableVariants: false, 
    enableDiscounts: true,
    taxRate: 0
  },
  appearance: {
    theme: 'light',
    primaryColor: '#3B82F6',
    secondaryColor: '#6B7280',
    layout: 'grid'
  },
  screen: {
    displayMode: 'windowed',
    resolution: { width: 1920, height: 1080 },
    orientation: 'landscape',
    touchEnabled: true,
    keyboardShortcuts: true
  },
  ebarimt: { enabled: false },
  finance: {
    currency: 'USD',
    taxSettings: { inclusive: false, rate: 0, name: 'Tax' },
    reportingPeriod: 'daily',
    enableMultiCurrency: false,
    supportedCurrencies: ['USD']
  },
  delivery: { enabled: false, methods: [] },
  sync: { 
    enabled: false, 
    frequency: 'hourly', 
    endpoints: [], 
    retryAttempts: 3, 
    timeout: 30000 
  }
}

// Improved atom with proper typing
export const posFormStateAtom = atom<PosFormStateData>(defaultPosFormState)

// Helper atoms for individual sections
export const overviewAtom = atom(
  (get) => get(posFormStateAtom).overview,
  (get, set, newValue: OverviewFormData) => {
    const current = get(posFormStateAtom)
    set(posFormStateAtom, { ...current, overview: newValue })
  }
)

export const propertiesAtom = atom(
  (get) => get(posFormStateAtom).properties,
  (get, set, newValue: PropertiesFormData) => {
    const current = get(posFormStateAtom)
    set(posFormStateAtom, { ...current, properties: newValue })
  }
)

export const paymentsAtom = atom(
  (get) => get(posFormStateAtom).payments,
  (get, set, newValue: PaymentsFormData) => {
    const current = get(posFormStateAtom)
    set(posFormStateAtom, { ...current, payments: newValue })
  }
)

// Add similar atoms for other sections as needed...

// Validation helper functions
export const validateFormStep = (step: keyof PosFormStateData, data: any): { success: boolean; errors?: string[] } => {
  try {
    switch (step) {
      case 'overview':
        overviewFormSchema.parse(data)
        break
      case 'properties':
        propertiesFormSchema.parse(data)
        break
      case 'payments':
        paymentsFormSchema.parse(data)
        break
      case 'slot':
        slotFormSchema.parse(data)
        break
      case 'permission':
        permissionFormSchema.parse(data)
        break
      case 'product':
        productFormSchema.parse(data)
        break
      case 'appearance':
        appearanceFormSchema.parse(data)
        break
      case 'screen':
        screenFormSchema.parse(data)
        break
      case 'ebarimt':
        ebarimtFormSchema.parse(data)
        break
      case 'finance':
        financeFormSchema.parse(data)
        break
      case 'delivery':
        deliveryFormSchema.parse(data)
        break
      case 'sync':
        syncFormSchema.parse(data)
        break
      default:
        throw new Error(`Unknown step: ${step}`)
    }
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      }
    }
    return { success: false, errors: ['Validation failed'] }
  }
}

// Reset helper
export const resetFormStateAtom = atom(null, (get, set) => {
  set(posFormStateAtom, defaultPosFormState)
})