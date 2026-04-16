import FormField from '../common/FormField.jsx'
import PrimaryButton from '../common/PrimaryButton.jsx'
import { isFieldVisible } from '../../utils/formVisibility.js'
import { getSingleFieldDisplayValue } from '../../utils/submissionDisplay.js'
import {
  AlertTriangle,
  BookOpen,
  Briefcase,
  FileCheck2,
  FolderOpen,
  Globe,
  HandCoins,
  HeartPulse,
  MapPin,
  Shield,
  ShieldAlert,
  User,
  Users,
} from 'lucide-react'

/**
 * Build section groups from a step's visible fields.
 *
 * Two modes:
 *  1. Section-property mode  – used when any field has a `section` string (Steps 1 & 2).
 *     Fields are grouped by that string in order of first appearance.
 *  2. Note-divider mode – used for all other steps.
 *     A `type:'note'` field opens a new group; every non-note field that follows
 *     belongs to that group until the next note.
 *
 * Returns an array of group objects:
 *   { title, subtitle, noteField, fields }
 */
function buildSectionGroups(fields, values) {
  const visible = fields.filter((f) => isFieldVisible(f, values))
  const usesSectionProp = visible.some((f) => f.section)

  if (usesSectionProp) {
    const map = new Map()
    visible.forEach((field) => {
      const key = field.section ?? '__ungrouped'
      if (!map.has(key)) {
        map.set(key, {
          title: key === '__ungrouped' ? null : key,
          subtitle: field.sectionSubtitle ?? null,
          noteField: null,
          fields: [],
        })
      }
      // Only store the subtitle from the first field that declares it
      const group = map.get(key)
      if (!group.subtitle && field.sectionSubtitle) {
        group.subtitle = field.sectionSubtitle
      }
      group.fields.push(field)
    })
    return Array.from(map.values())
  }

  // Note-divider mode
  const groups = []
  let current = { title: null, subtitle: null, noteField: null, fields: [] }

  visible.forEach((field) => {
    if (field.type === 'note') {
      if (current.fields.length > 0 || current.noteField) {
        groups.push(current)
      }
      current = {
        title: field.noteTitle ?? null,
        subtitle: field.noteBody ?? null,
        noteField: field,
        fields: [],
      }
    } else {
      current.fields.push(field)
    }
  })

  if (current.fields.length > 0 || current.noteField) {
    groups.push(current)
  }

  return groups
}

// Section header rendered above each group card
function SectionHeader({ title, subtitle }) {
  if (!title) return null
  const normalized = String(title).toLowerCase()
  const Icon = (() => {
    if (normalized.includes('identity')) return User
    if (normalized.includes('contact')) return Users
    if (normalized.includes('citizenship') || normalized.includes('immigration')) return Globe
    if (normalized.includes('address')) return MapPin
    if (normalized.includes('emergency')) return ShieldAlert
    if (
      normalized.includes('parent') ||
      normalized.includes('guardian') ||
      normalized.includes('father') ||
      normalized.includes('mother')
    ) {
      return Users
    }
    if (normalized.includes('financial') || normalized.includes('sponsor') || normalized.includes('payment')) {
      return HandCoins
    }
    if (normalized.includes('academic') || normalized.includes('education')) return BookOpen
    if (normalized.includes('experience') || normalized.includes('motivation')) return Briefcase
    if (normalized.includes('disclosure')) return Shield
    if (normalized.includes('discipline')) return AlertTriangle
    if (normalized.includes('disability') || normalized.includes('accommodation')) return HeartPulse
    if (normalized.includes('document')) return FolderOpen
    if (normalized.includes('review') || normalized.includes('submit')) return FileCheck2
    return FileCheck2
  })()

  return (
    <div className="mb-4 flex items-start gap-3.5">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4A843]/20 to-[#D4A843]/5 shadow-sm">
        <Icon className="h-4 w-4 text-[#D4A843]" strokeWidth={2} />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-[#0A1628] [font-family:'DM_Serif_Display',serif]">
          {title}
        </h3>
        {subtitle ? (
          <p className="mt-0.5 text-xs text-[#0A1628]/50">{subtitle}</p>
        ) : null}
      </div>
    </div>
  )
}

function isValueMissing(field, rawValue) {
  if (field.type === 'checkbox') {
    return !rawValue
  }
  if (field.type === 'repeatable') {
    return !Array.isArray(rawValue) || rawValue.length === 0
  }
  return rawValue === undefined || rawValue === null || rawValue === ''
}

function StepForm({
  step,
  stepNumber,
  totalSteps,
  steps,
  currentIndex,
  onStepClick,
  values,
  errors,
  formError,
  draftNotice,
  onChange,
  onNext,
  onPrevious,
  onSaveDraft,
  canGoBack,
  isLastStep,
  onSubmit,
}) {
  const progressPercent = Math.round((stepNumber / totalSteps) * 100)
  const groups = buildSectionGroups(step.fields, values)
  const isReviewStep = step.id === 'reviewSubmit'
  const priorSteps = isReviewStep ? steps.slice(0, -1) : []
  const reviewFields = isReviewStep
    ? priorSteps.flatMap((reviewStep) =>
        reviewStep.fields.filter(
          (field) =>
            field.type !== 'note' &&
            !String(field.name).startsWith('__') &&
            isFieldVisible(field, values),
        ),
      )
    : []
  const missingRequiredCount = reviewFields.filter(
    (field) => field.required && isValueMissing(field, values[field.name]),
  ).length
  const requiredDocumentFields = isReviewStep
    ? steps
        .find((s) => s.id === 'documents')
        ?.fields.filter(
          (field) =>
            field.type === 'file' &&
            field.required &&
            isFieldVisible(field, values) &&
            isValueMissing(field, values[field.name]),
        ) ?? []
    : []

  return (
    <section className="w-full bg-transparent p-3 sm:p-4 lg:p-4">
      {/* Step hero banner */}
      <div className="mb-3 overflow-hidden rounded-2xl border border-[#0A1628]/10 bg-white shadow-lg shadow-[#0A1628]/10">
        <div className="relative overflow-hidden bg-gradient-to-r from-[#0A1628] via-[#163457] to-[#0A1628] px-5 py-2 sm:px-6 sm:py-2.5">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=1400&q=70')] bg-cover bg-center opacity-25" />
          <div className="absolute inset-0 bg-[#08182d]/55" />
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4A843]">
              Step {stepNumber} of {totalSteps}
            </p>
            <h2 className="mt-0.5 text-lg text-white [font-family:'DM_Serif_Display',serif] sm:text-xl">
              {step.title}
            </h2>
            {step.description ? (
              <p className="mt-0.5 text-[11px] text-white/60">{step.description}</p>
            ) : null}
          </div>
        </div>
        <div className="px-5 py-2 sm:px-6">
          <div className="flex items-center justify-between text-xs text-[#0A1628]/55">
            <span className="font-medium">Overall Progress</span>
            <span className="font-bold text-[#0A1628]">{progressPercent}%</span>
          </div>
          <div className="mt-1.5 h-1.5 rounded-full bg-[#0A1628]/10">
            <div
              className="h-1.5 rounded-full bg-gradient-to-r from-[#D4A843] to-[#b98a22] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Premium Step Tracker */}
      <header className="mb-3 overflow-hidden rounded-2xl border border-[#0A1628]/10 bg-white shadow-sm">
        {/* Header label */}
        <div className="flex items-center justify-between border-b border-[#0A1628]/6 px-5 py-1.5 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0A1628]/45">
            Application Progress
          </p>
          <span className="rounded-full bg-[#D4A843]/12 px-3 py-1 text-xs font-bold text-[#7a5a14]">
            Step {stepNumber} of {totalSteps}
          </span>
        </div>

        {/* Stepper row */}
        <div className="overflow-x-auto px-5 py-2 sm:px-6 sm:overflow-visible">
          <div className="flex min-w-max items-start gap-0 sm:min-w-0 sm:justify-center">
            {steps.map((item, index) => {
              const isActive = index === currentIndex
              const isCompleted = index < currentIndex
              const isLast = index === steps.length - 1

              return (
                <div key={item.id} className="flex items-start">
                  {/* Step node */}
                  <button
                    type="button"
                    onClick={() => onStepClick(index)}
                    className="group flex flex-col items-center gap-1 focus:outline-none"
                    style={{ minWidth: '64px' }}
                  >
                    {/* Circle */}
                    <div className="relative">
                      {/* Glow ring for active */}
                      {isActive ? (
                        <span className="absolute -inset-2 animate-soft-pulse rounded-full bg-[#D4A843]/20" />
                      ) : null}
                      <div
                        className={`relative flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300 ${
                          isActive
                            ? 'border-[#D4A843] bg-[#D4A843] text-white shadow-lg shadow-[#D4A843]/30'
                            : isCompleted
                              ? 'border-[#0A1628] bg-[#0A1628] text-white'
                              : 'border-[#0A1628]/15 bg-[#F8F7F4] text-[#0A1628]/35 group-hover:border-[#D4A843]/50 group-hover:bg-[#fff7df] group-hover:text-[#0A1628]/70'
                        }`}
                      >
                        {isCompleted ? (
                          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                            <path
                              d="M3 8.5l3.5 3.5 6.5-7"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : (
                          index + 1
                        )}
                      </div>
                    </div>

                    {/* Label */}
                    <span
                      className={`max-w-[64px] text-center text-[10px] font-semibold leading-tight transition-colors ${
                        isActive
                          ? 'text-[#D4A843]'
                          : isCompleted
                            ? 'text-[#0A1628]/65'
                            : 'text-[#0A1628]/35 group-hover:text-[#0A1628]/55'
                      }`}
                    >
                      {item.title}
                    </span>
                  </button>

                  {/* Connector line */}
                  {!isLast ? (
                    <div className="mx-1 mt-3.5 h-0.5 w-6 flex-shrink-0 rounded-full sm:w-8">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          index < currentIndex
                            ? 'bg-[#0A1628]'
                            : 'bg-[#0A1628]/12'
                        }`}
                      />
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>
      </header>

      {/* Form body */}
      <div key={step.id} className="animate-fade-in-up space-y-4">
        {formError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </div>
        ) : null}

        {isReviewStep ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#0A1628]/10 bg-white p-4 shadow-sm sm:p-5">
              <h4 className="text-xl text-[#0A1628] [font-family:'DM_Serif_Display',serif]">
                Review Your Application
              </h4>
              <p className="mt-1.5 text-sm text-[#0A1628]/58">
                Review each section before submitting.
              </p>
              <div className="mt-3 space-y-2">
                <div className="rounded-lg border border-emerald-200/70 bg-emerald-50 px-3.5 py-2">
                  <p className="text-sm font-semibold text-emerald-700">
                    {missingRequiredCount === 0 ? 'Almost there!' : 'Please review required fields'}
                  </p>
                  <p className="text-xs text-emerald-700/75">
                    {missingRequiredCount === 0
                      ? 'Missing required details could block your submission.'
                      : `${missingRequiredCount} required field(s) still need attention.`}
                  </p>
                </div>
                {requiredDocumentFields.length > 0 ? (
                  <div className="rounded-lg border border-amber-200/70 bg-amber-50 px-3.5 py-2">
                    <p className="text-sm font-semibold text-amber-800">
                      Missing required documents
                    </p>
                    <p className="text-xs text-amber-800/75">
                      Upload {requiredDocumentFields.length} required document(s) before final submission.
                    </p>
                  </div>
                ) : null}
              </div>
            </div>

            {priorSteps.map((reviewStep, reviewIndex) => {
              const visibleFields = reviewStep.fields.filter(
                (field) =>
                  field.type !== 'note' &&
                  !String(field.name).startsWith('__') &&
                  isFieldVisible(field, values),
              )

              return (
                <div
                  key={reviewStep.id}
                  className="overflow-hidden rounded-xl border border-[#0A1628]/10 bg-white shadow-sm"
                >
                  <div className="flex items-center justify-between border-b border-[#0A1628]/8 bg-[#F8F7F4] px-4 py-2.5 sm:px-5">
                    <div>
                      <h4 className="text-base font-semibold text-[#0A1628] [font-family:'DM_Serif_Display',serif]">
                        {reviewStep.title}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => onStepClick(reviewIndex)}
                      className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#D4A843] transition hover:text-[#b98a22]"
                    >
                      Edit
                    </button>
                  </div>

                  {visibleFields.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-[#0A1628]/55 sm:px-5">
                      No visible values to review for this step.
                    </div>
                  ) : (
                    <div className="space-y-0 p-4 sm:p-5">
                      {visibleFields.map((field) => (
                        <div key={`${reviewStep.id}-${field.name}`} className="border-b border-[#0A1628]/8 py-2.5 last:border-b-0">
                          {field.type === 'repeatable' ? (
                            <div className="space-y-2.5">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0A1628]/45">
                                {field.sectionTitle ?? field.label ?? field.name}
                              </p>
                              {Array.isArray(values[field.name]) && values[field.name].length > 0 ? (
                                values[field.name].map((row, rowIndex) => (
                                  <div key={`${field.name}-row-${rowIndex}`} className="rounded-lg border border-[#0A1628]/8 bg-[#F8F7F4] px-3 py-2.5">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0A1628]/45">
                                      {field.itemBadge ?? 'Item'} {rowIndex + 1}
                                    </p>
                                    <div className="mt-1.5 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                                      {(field.itemFields ?? []).map((sub) => (
                                        <p key={`${field.name}-${rowIndex}-${sub.name}`} className="text-xs text-[#0A1628]/72">
                                          <span className="font-semibold text-[#0A1628]/82">
                                            {String(sub.label ?? sub.name).toUpperCase()}:
                                          </span>{' '}
                                          {getSingleFieldDisplayValue(sub, row?.[sub.name])}
                                        </p>
                                      ))}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm text-[#0A1628]/55">No entries added.</p>
                              )}
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 gap-1 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-start sm:gap-3">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0A1628]/45">
                                {field.label}
                              </p>
                              <p className="text-sm whitespace-pre-wrap text-[#0A1628]/78">
                                {getSingleFieldDisplayValue(field, values[field.name])}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

            {groups.map((group, groupIndex) => {
              const hasRegularFields = group.fields.length > 0
              return (
                <div
                  key={group.title ?? `review-group-${groupIndex}`}
                  className="overflow-hidden rounded-2xl border border-[#0A1628]/10 bg-white shadow-sm"
                >
                  {group.title ? (
                    <div className="border-b border-[#0A1628]/8 bg-gradient-to-r from-[#D4A843]/5 to-transparent px-5 py-3.5 sm:px-6">
                      <SectionHeader title={group.title} subtitle={group.subtitle} />
                    </div>
                  ) : null}

                  {group.noteField ? (
                    <div className={`px-5 sm:px-6 ${hasRegularFields ? 'pt-5 pb-0' : 'py-5'}`}>
                      <FormField
                        field={group.noteField}
                        value={values[group.noteField.name]}
                        error={errors[group.noteField.name]}
                        onChange={onChange}
                      />
                    </div>
                  ) : null}

                  {hasRegularFields ? (
                    <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 xl:grid-cols-3 sm:p-6">
                      {group.fields.map((field) => (
                        <div
                          key={field.name}
                          className={`animate-fade-in-up ${
                            field.fullWidth ||
                            field.type === 'checkbox' ||
                            field.type === 'yesNo' ||
                            field.type === 'radioGroup' ||
                            field.type === 'repeatable'
                              ? 'md:col-span-2 xl:col-span-3'
                              : ''
                          }`}
                        >
                          <FormField
                            field={field}
                            value={values[field.name]}
                            error={errors[field.name]}
                            onChange={onChange}
                          />
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        ) : step.fields.length === 0 ? (
          <div className="rounded-2xl border border-[#0A1628]/10 bg-white p-4 shadow-sm sm:p-5">
            <h4 className="text-xl text-[#0A1628] [font-family:'DM_Serif_Display',serif]">
              Review Complete
            </h4>
            <p className="mt-2 text-sm text-[#0A1628]/60">
              Your application details are saved. Click submit to complete your application.
            </p>
          </div>
        ) : (
          groups.map((group, groupIndex) => {
            const hasRegularFields = group.fields.length > 0

            return (
              <div
                key={group.title ?? `group-${groupIndex}`}
                style={{ animationDelay: `${groupIndex * 60}ms` }}
                className="animate-fade-in-up overflow-hidden rounded-2xl border border-[#0A1628]/10 bg-white shadow-sm"
              >
                {group.title ? (
                  <div className="border-b border-[#0A1628]/8 bg-gradient-to-r from-[#D4A843]/5 to-transparent px-5 py-3.5 sm:px-6">
                    <SectionHeader title={group.title} subtitle={group.subtitle} />
                  </div>
                ) : null}

                {group.noteField ? (
                  <div className={`px-5 sm:px-6 ${hasRegularFields ? 'pt-5 pb-0' : 'py-5'}`}>
                    <FormField
                      field={group.noteField}
                      value={values[group.noteField.name]}
                      error={errors[group.noteField.name]}
                      onChange={onChange}
                    />
                  </div>
                ) : null}

                {hasRegularFields ? (
                  <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 xl:grid-cols-3 sm:p-6">
                    {group.fields.map((field, fieldIndex) => {
                      const spanWide =
                        field.fullWidth ||
                        field.type === 'checkbox' ||
                        field.type === 'note' ||
                        field.type === 'yesNo' ||
                        field.type === 'radioGroup' ||
                        field.type === 'repeatable'
                      return (
                        <div
                          key={field.name}
                          style={{ animationDelay: `${(groupIndex * 4 + fieldIndex) * 24}ms` }}
                          className={`animate-fade-in-up ${
                            spanWide ? 'md:col-span-2 xl:col-span-3' : ''
                          }`}
                        >
                          <FormField
                            field={field}
                            value={values[field.name]}
                            error={errors[field.name]}
                            onChange={onChange}
                          />
                        </div>
                      )
                    })}
                  </div>
                ) : null}
              </div>
            )
          })
        )}

        {/* Footer nav */}
        <footer className="mt-2 space-y-3 rounded-2xl border border-[#0A1628]/10 bg-white p-3.5 shadow-sm sm:p-4">
          {draftNotice ? (
            <p
              role="status"
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
            >
              {draftNotice}
            </p>
          ) : null}
          <div className="flex flex-col-reverse items-stretch gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            {canGoBack ? (
              <PrimaryButton variant="outline" type="button" onClick={onPrevious}>
                Previous
              </PrimaryButton>
            ) : (
              <span className="hidden sm:block" />
            )}
            <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:gap-3">
              <PrimaryButton variant="outline" type="button" onClick={onSaveDraft}>
                Draft
              </PrimaryButton>
              {isLastStep ? (
                <PrimaryButton type="button" onClick={onSubmit}>
                  Submit Application
                </PrimaryButton>
              ) : (
                <PrimaryButton type="button" onClick={onNext}>
                  Save & Continue
                </PrimaryButton>
              )}
            </div>
          </div>
        </footer>
      </div>
    </section>
  )
}

export default StepForm
