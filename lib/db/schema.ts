import { boolean, date, integer, jsonb, numeric, pgTable, text, timestamp, unique, uniqueIndex, uuid } from 'drizzle-orm/pg-core'

export const attendance = pgTable('attendance', {
  id: uuid('id').defaultRandom().primaryKey(), employeeId: text('employee_id').notNull(), attendanceDate: date('attendance_date', { mode: 'string' }).notNull(), signInTime: timestamp('sign_in_time', { withTimezone: true }).notNull(), status: text('status').notNull(), photoPath: text('photo_path'), photoExpiresAt: timestamp('photo_expires_at', { withTimezone: true }), createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
export const attendanceFailedAttempts = pgTable('attendance_failed_attempts', { id: uuid('id').defaultRandom().primaryKey(), employeeId: text('employee_id').notNull(), attemptedAt: timestamp('attempted_at', { withTimezone: true }).notNull().defaultNow(), ipAddress: text('ip_address') })
export const attendanceSettings = pgTable('attendance_settings', { id: uuid('id').defaultRandom().primaryKey(), officialStartTime: text('official_start_time').notNull().default('08:00'), gracePeriodMinutes: integer('grace_period_minutes').notNull().default(60), createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow() })
export const attendanceExceptions = pgTable('attendance_exceptions', { id: uuid('id').defaultRandom().primaryKey(), employeeId: text('employee_id').notNull(), exceptionType: text('exception_type').notNull(), startsOn: date('starts_on', { mode: 'string' }).notNull(), endsOn: date('ends_on', { mode: 'string' }).notNull(), note: text('note'), createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow() })
export const attendanceHolidays = pgTable('attendance_holidays', { id: uuid('id').defaultRandom().primaryKey(), holidayDate: date('holiday_date', { mode: 'string' }).notNull(), name: text('name').notNull(), createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow() })

export const employees = pgTable('employees', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  fullName: text('full_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  department: text('department'),
  jobTitle: text('job_title'),
  startDate: date('start_date', { mode: 'string' }),
  birthday: date('birthday', { mode: 'string' }),
  lastBirthdayEmailSentYear: integer('last_birthday_email_sent_year'),
  pensionProvider: text('pension_provider'),
  pensionNumber: text('pension_number'),
  taxId: text('tax_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const websiteUptimeStatus = pgTable('website_uptime_status', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  websiteName: text('website_name').notNull(),
  websiteUrl: text('website_url').notNull(),
  status: text('status').notNull(),
  errorMessage: text('error_message'),
  httpStatus: integer('http_status'),
  responseTimeMs: integer('response_time_ms'),
  checkedAt: timestamp('checked_at', { withTimezone: true }).notNull(),
  receivedAt: timestamp('received_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userWebsiteUrlUnique: unique('website_uptime_status_user_url_key').on(table.userId, table.websiteUrl),
}))

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  softwareName: text('software_name').notNull(),
  vendor: text('vendor').notNull().default(''),
  category: text('category').notNull(),
  ownerDepartment: text('owner_department').notNull().default(''),
  pocName: text('poc_name').notNull().default(''),
  pocEmail: text('poc_email').notNull().default(''),
  startDate: date('start_date', { mode: 'string' }).notNull(),
  durationDays: integer('duration_days').notNull(),
  renewalCost: numeric('renewal_cost', { precision: 12, scale: 2 }).notNull().default('0'),
  expirationDate: date('expiration_date', { mode: 'string' }).notNull(),
  currency: text('currency').notNull().default('NGN'),
  autoRenewal: boolean('auto_renewal').notNull().default(false),
  seats: integer('seats').notNull().default(1),
  licenseReference: text('license_reference'),
  vendorLink: text('vendor_link'),
  notes: text('notes'),
  cancelled: boolean('cancelled').notNull().default(false),
  updatedBy: text('updated_by'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const cameras = pgTable('cameras', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  station: text('station').notNull(),
  cameraName: text('camera_name').notNull(),
  cameraId: text('camera_id').notNull(),
  location: text('location').notNull(),
  onlineThresholdMinutes: integer('online_threshold_minutes').notNull().default(10),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
  status: text('status').notNull().default('offline'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const cameraReadings = pgTable('camera_readings', {
  id: uuid('id').defaultRandom().primaryKey(),
  cameraId: uuid('camera_id').notNull(),
  observedAt: timestamp('observed_at', { withTimezone: true }).notNull(),
  payload: jsonb('payload').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const cameraIncidents = pgTable('camera_incidents', {
  id: uuid('id').defaultRandom().primaryKey(),
  cameraId: uuid('camera_id').notNull(),
  incidentType: text('incident_type').notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  acknowledgedBy: text('acknowledged_by'),
  acknowledgedAt: timestamp('acknowledged_at', { withTimezone: true }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const backupEvents = pgTable('backup_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  backupType: text('backup_type').notNull(),
  scheduledFor: timestamp('scheduled_for', { withTimezone: true }).notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  status: text('status').notNull().default('pending'),
  provider: text('provider').notNull().default('n8n'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const brandingRequests = pgTable('branding_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  requestCode: text('request_code').notNull().unique(),
  title: text('title').notNull(),
  requesterName: text('requester_name').notNull(),
  requesterEmail: text('requester_email').notNull(),
  department: text('department').notNull(),
  requestType: text('request_type').notNull(),
  priority: text('priority').notNull(),
  deadline: date('deadline', { mode: 'string' }).notNull(),
  assignee: text('assignee').notNull().default('Unassigned'),
  status: text('status').notNull().default('Submitted'),
  description: text('description').notNull(),
  audience: text('audience').notNull(),
  approval: text('approval').notNull(),
  files: jsonb('files').notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const auditEvents = pgTable('audit_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  actorName: text('actor_name').notNull(),
  actorEmail: text('actor_email').notNull(),
  action: text('action').notNull(),
  target: text('target').notNull(),
  details: text('details'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const workspaceMembers = pgTable('workspace_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: text('role').notNull().default('Viewer'),
  accessPages: jsonb('access_pages').notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const onboardingPages = pgTable('onboarding_pages', {
  id: uuid('id').defaultRandom().primaryKey(), userId: text('user_id').notNull(), token: text('token').notNull().unique(), isLive: boolean('is_live').notNull().default(true), companyName: text('company_name').notNull().default('Farm Alert'), tagline: text('tagline'), logoUrl: text('logo_url'), accentColor: text('accent_color').notNull().default('#176b71'), headline: text('headline').notNull().default('Welcome to Farm Alert'), welcomeMessage: text('welcome_message').notNull().default('We are excited to have you join the team.'), additionalInfo: text('additional_info').notNull().default(''), createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const onboardingIdentityItems = pgTable('onboarding_identity_items', {
  id: uuid('id').defaultRandom().primaryKey(), pageId: uuid('page_id').notNull(), itemType: text('item_type').notNull(), imageUrl: text('image_url'), caption: text('caption'), sortOrder: integer('sort_order').notNull().default(0), createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({ pageTypeIdx: uniqueIndex('onboarding_identity_page_type_idx').on(table.pageId, table.itemType) }))

export const onboardingDocuments = pgTable('onboarding_documents', {
  id: uuid('id').defaultRandom().primaryKey(), pageId: uuid('page_id').notNull(), title: text('title').notNull(), description: text('description').notNull().default(''), fileUrl: text('file_url'), fileName: text('file_name'), fileType: text('file_type'), fileSize: integer('file_size'), sortOrder: integer('sort_order').notNull().default(0), createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const onboardingTextBlocks = pgTable('onboarding_text_blocks', {
  id: uuid('id').defaultRandom().primaryKey(), pageId: uuid('page_id').notNull(), title: text('title').notNull(), content: text('content').notNull().default(''), sortOrder: integer('sort_order').notNull().default(0), createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const catalogSettings = pgTable('catalog_settings', {
  id: uuid('id').defaultRandom().primaryKey(), userId: text('user_id').notNull().unique(), title: text('title').notNull().default('Farm Alert Product Catalog'), subtitle: text('subtitle').notNull().default('Explore our available products and current pricing.'), logoUrl: text('logo_url'), footerText: text('footer_text').notNull().default('Farm Alert Tech'), accentColor: text('accent_color').notNull().default('#176b71'), visibleColumns: jsonb('visible_columns').notNull().default([]), priceLists: jsonb('price_lists').notNull().default([]), itemGroups: jsonb('item_groups').notNull().default([]), showDisabled: boolean('show_disabled').notNull().default(false), noindex: boolean('noindex').notNull().default(true), updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const catalogCache = pgTable('catalog_cache', {
  id: integer('id').primaryKey(), payload: jsonb('payload').notNull(), fetchedAt: timestamp('fetched_at', { withTimezone: true }).notNull().defaultNow(), errorMessage: text('error_message'),
})

export const notificationSettings = pgTable('notification_settings', { id: uuid('id').defaultRandom().primaryKey(), birthdayManagerEmail: text('birthday_manager_email'), birthdayManagerEmails: jsonb('birthday_manager_emails').notNull().default([]), subscriptionAlertEmails: jsonb('subscription_alert_emails').notNull().default([]), updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow() })

export const notificationDeliveries = pgTable('notification_deliveries', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id'),
  notificationType: text('notification_type').notNull(),
  recipientCount: integer('recipient_count').notNull().default(0),
  payload: jsonb('payload').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
