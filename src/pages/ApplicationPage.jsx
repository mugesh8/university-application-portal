import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import StepForm from '../components/application/StepForm.jsx'
import StepSidebar from '../components/application/StepSidebar.jsx'
import PrimaryButton from '../components/common/PrimaryButton.jsx'
import ProfileDropdown from '../components/common/ProfileDropdown.jsx'
import { applicationSteps } from '../data/applicationSteps.js'
import { countries } from '../data/countries.js'
import {
  faqSections,
  faqSupport,
  moduleNavigation,
  notificationItems,
} from '../data/sidebarModulesContent.js'
import { usePersistentState } from '../hooks/usePersistentState.js'
import { getSelectValues, isFieldVisible } from '../utils/formVisibility.js'

const crestLogo =
  'https://d2xsxph8kpxj0f.cloudfront.net/310519663394975842/o5YxQXzG37vUfAnZtRoyQg/mucm-crest-logo_aac17a92.png'
const SUBMISSIONS_KEY = 'mucm-submitted-applications'
const SUPPORT_TICKETS_KEY = 'mucm-support-tickets'

function getSupportTicketStatusStyles(status) {
  switch (status) {
    case 'Resolved':
      return {
        pill: 'bg-green-100 text-green-900 ring-1 ring-green-200/80',
        border: 'border-l-[3px] border-l-green-600',
      }
    case 'In progress':
      return {
        pill: 'bg-sky-100 text-sky-900 ring-1 ring-sky-200/80',
        border: 'border-l-[3px] border-l-sky-600',
      }
    default:
      return {
        pill: 'bg-amber-100 text-amber-950 ring-1 ring-amber-200/80',
        border: 'border-l-[3px] border-l-amber-500',
      }
  }
}

function getSupportTicketStatusHint(status) {
  switch (status ?? 'Open') {
    case 'Resolved':
      return 'This request is closed. Email us if you still need assistance.'
    case 'In progress':
      return 'Our team is actively reviewing your message.'
    default:
      return 'We have received your ticket and will reply by email.'
  }
}

const initialForm = applicationSteps.reduce((accumulator, step) => {
  step.fields.forEach((field) => {
    if (field.type === 'checkbox') {
      accumulator[field.name] = field.defaultValue ?? false
    } else {
      accumulator[field.name] = field.defaultValue ?? ''
    }
  })
  return accumulator
}, {})

function ApplicationPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const desktopScrollRef = useRef(null)
  const autoSaveTimerRef = useRef(null)
  const hasInitializedAutoSaveRef = useRef(false)
  const userEmail = (() => {
    try {
      return JSON.parse(window.localStorage.getItem('mucm-auth-session') ?? '{}').email ?? ''
    } catch {
      return ''
    }
  })()
  const [activeModule, setActiveModule] = useState('Application form')
  const [currentStepIndex, setCurrentStepIndex] = usePersistentState(
    'mucm-current-step',
    0,
  )
  const [formValues, setFormValues] = usePersistentState(
    'mucm-application-form',
    initialForm,
  )
  const [validationErrors, setValidationErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [draftNotice, setDraftNotice] = useState('')
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved')
  const [submitted, setSubmitted] = useState(false)
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    message: '',
  })
  const [ticketNotice, setTicketNotice] = useState('')
  const [ticketHistory, setTicketHistory] = usePersistentState(SUPPORT_TICKETS_KEY, [])
  const [supportCenterTab, setSupportCenterTab] = usePersistentState(
    'mucm-support-center-tab',
    'faq',
  )
  const [lastSubmissionId, setLastSubmissionId] = useState('')

  useEffect(() => {
    if (!draftNotice) {
      return undefined
    }
    const timeoutId = window.setTimeout(() => setDraftNotice(''), 4500)
    return () => window.clearTimeout(timeoutId)
  }, [draftNotice])

  useEffect(() => {
    // Keep UX consistent: every step opens from the top.
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    if (desktopScrollRef.current) {
      desktopScrollRef.current.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }
  }, [currentStepIndex, activeModule, submitted, supportCenterTab])

  useEffect(() => {
    const requestedModule = location.state?.initialModule
    if (!requestedModule) {
      return
    }
    setActiveModule(requestedModule)
  }, [location.state])

  useEffect(() => {
    if (submitted) {
      return undefined
    }

    if (!hasInitializedAutoSaveRef.current) {
      hasInitializedAutoSaveRef.current = true
      return undefined
    }

    setAutoSaveStatus('saving')
    if (autoSaveTimerRef.current) {
      window.clearTimeout(autoSaveTimerRef.current)
    }
    autoSaveTimerRef.current = window.setTimeout(() => {
      setAutoSaveStatus('saved')
    }, 450)

    return () => {
      if (autoSaveTimerRef.current) {
        window.clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [formValues, currentStepIndex, submitted])

  const currentStep = useMemo(
    () => applicationSteps[currentStepIndex] ?? applicationSteps[0],
    [currentStepIndex],
  )
  const uploadedDocuments = useMemo(() => {
    const documentStep =
      applicationSteps.find((step) => step.id === 'documents')?.fields ?? []

    return documentStep
      .filter((field) => field.type === 'file')
      .map((field) => ({
      label: field.label,
      value: formValues[field.name],
      required: Boolean(field.required),
      }))
  }, [formValues])

  function validateField(field, value) {
    const stringValue = typeof value === 'string' ? value.trim() : value

    if (field.required) {
      if (field.type === 'checkbox' && !value) {
        return 'This field is required.'
      }
      if (field.type !== 'checkbox' && !stringValue) {
        return 'This field is required.'
      }
    }

    if (!stringValue && !field.required) {
      return ''
    }

    if (field.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(String(stringValue))) {
        return 'Please enter a valid email address.'
      }
    }

    if (field.type === 'tel') {
      const digits = String(stringValue).replace(/\D/g, '')
      if (digits.length < 7) {
        return 'Please enter a valid phone number.'
      }
    }

    if (field.type === 'select' && field.options?.length > 0) {
      const allowed = getSelectValues(field.options)
      if (!allowed.includes(String(stringValue))) {
        return 'Please select a valid option.'
      }
    }

    if (field.type === 'country') {
      const exists = countries.some(
        (country) => country.toLowerCase() === String(stringValue).toLowerCase(),
      )
      if (!exists) {
        return 'Please select a valid country from the list.'
      }
    }

    return ''
  }

  function validateStep(step, valuesToCheck) {
    const stepErrors = {}

    step.fields.forEach((field) => {
      if (!isFieldVisible(field, valuesToCheck)) {
        return
      }
      const message = validateField(field, valuesToCheck[field.name])
      if (message) {
        stepErrors[field.name] = message
      }
    })

    return stepErrors
  }

  function updateField(name, value) {
    setFormValues((previous) => {
      const next = { ...previous, [name]: value }
      if (name === 'hasBeenDisciplined' && value !== 'Yes') {
        next.disciplineActionExplanation = ''
      }
      if (name === 'hasBeenConvicted' && value !== 'Yes') {
        next.convictionExplanation = ''
      }
      if (name === 'hasDisability' && value !== 'Yes') {
        next.disabilityDetails = ''
      }
      if (name === 'requiresAccommodation' && value !== 'Yes') {
        next.accommodationDetails = ''
      }
      return next
    })

    setValidationErrors((previous) => {
      const nextErrors = { ...previous }
      if (name === 'hasBeenDisciplined') {
        delete nextErrors.disciplineActionExplanation
      }
      if (name === 'hasBeenConvicted') {
        delete nextErrors.convictionExplanation
      }
      if (name === 'hasDisability') {
        delete nextErrors.disabilityDetails
      }
      if (name === 'requiresAccommodation') {
        delete nextErrors.accommodationDetails
      }

      const activeField =
        applicationSteps
          .flatMap((step) => step.fields)
          .find((field) => field.name === name) ?? null

      if (activeField) {
        const message = validateField(activeField, value)
        if (message) {
          nextErrors[name] = message
        } else {
          delete nextErrors[name]
        }
      }

      return nextErrors
    })
    setFormError('')
  }

  function handleNext() {
    const stepErrors = validateStep(currentStep, formValues)

    if (Object.keys(stepErrors).length > 0) {
      setValidationErrors((previous) => ({ ...previous, ...stepErrors }))
      setFormError('Please fix the highlighted fields before continuing.')
      return
    }

    setValidationErrors({})
    setFormError('')
    const nextStepIndex = Math.min(currentStepIndex + 1, applicationSteps.length - 1)
    try {
      // Explicit checkpoint save on every Save & Continue click.
      window.localStorage.setItem('mucm-application-form', JSON.stringify(formValues))
      window.localStorage.setItem('mucm-current-step', JSON.stringify(nextStepIndex))
    } catch {
      // ignore quota / private mode
    }
    setCurrentStepIndex(nextStepIndex)
    setDraftNotice('Progress auto-saved. Moving to next step.')
  }

  function handlePrevious() {
    setCurrentStepIndex((previous) => Math.max(previous - 1, 0))
  }

  function handleSaveDraft() {
    try {
      window.localStorage.setItem('mucm-application-form', JSON.stringify(formValues))
      window.localStorage.setItem('mucm-current-step', JSON.stringify(currentStepIndex))
    } catch {
      // ignore quota / private mode
    }
    setFormError('')
    setDraftNotice('Draft saved. Your progress is stored on this device.')
  }

  function handleModuleChange(moduleName) {
    if (moduleName === 'Submitted Applications') {
      navigate('/submitted-applications')
      return
    }
    setActiveModule(moduleName)
  }

  function handleSubmit() {
    let firstInvalidStep = -1
    const allErrors = {}

    applicationSteps.forEach((step, stepIndex) => {
      const stepErrors = validateStep(step, formValues)
      if (Object.keys(stepErrors).length > 0 && firstInvalidStep === -1) {
        firstInvalidStep = stepIndex
      }
      Object.assign(allErrors, stepErrors)
    })

    if (Object.keys(allErrors).length > 0) {
      setValidationErrors(allErrors)
      setFormError('Please complete all required fields with valid values.')
      if (firstInvalidStep >= 0) {
        setCurrentStepIndex(firstInvalidStep)
      }
      return
    }

    setValidationErrors({})
    setFormError('')
    const documentFields =
      applicationSteps
        .find((step) => step.id === 'documents')
        ?.fields.filter((field) => field.type === 'file') ?? []
    const applicationId = `APP-${Date.now()}`
    const submittedAt = new Date().toISOString()
    const snapshot =
      typeof structuredClone === 'function'
        ? structuredClone(formValues)
        : JSON.parse(JSON.stringify(formValues))
    const submittedRecord = {
      id: applicationId,
      submittedAt,
      userEmail,
      applicantName: `${formValues.firstName ?? ''} ${formValues.surname ?? ''}`.trim() || 'Applicant',
      formValues: snapshot,
      documents: documentFields.map((field) => ({
        name: field.name,
        label: field.label,
        required: Boolean(field.required),
        value: formValues[field.name] ?? '',
      })),
    }
    try {
      const existing = JSON.parse(window.localStorage.getItem(SUBMISSIONS_KEY) ?? '[]')
      const safeExisting = Array.isArray(existing) ? existing : []
      safeExisting.unshift(submittedRecord)
      window.localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(safeExisting))
    } catch {
      // ignore storage issues
    }
    setLastSubmissionId(applicationId)
    setSubmitted(true)
  }

  function resetApplication() {
    setCurrentStepIndex(0)
    setFormValues(initialForm)
    setSubmitted(false)
    setLastSubmissionId('')
  }

  function handleLogout() {
    window.localStorage.removeItem('mucm-auth-session')
    navigate('/login')
  }

  function updateTicketField(name, value) {
    setTicketForm((previous) => ({ ...previous, [name]: value }))
    if (ticketNotice) {
      setTicketNotice('')
    }
  }

  function handleRaiseTicket(event) {
    event.preventDefault()
    if (!ticketForm.subject.trim() || !ticketForm.message.trim()) {
      setTicketNotice('Please enter both subject and message before raising a ticket.')
      return
    }
    const newTicket = {
      id: `TKT-${Date.now()}`,
      subject: ticketForm.subject.trim(),
      message: ticketForm.message.trim(),
      status: 'Open',
      raisedAt: new Date().toISOString(),
      submittedBy: userEmail || undefined,
    }
    setTicketHistory((previous) => {
      const list = Array.isArray(previous) ? previous : []
      return [newTicket, ...list]
    })
    setTicketNotice('Ticket raised successfully. Our support team will contact you shortly.')
    setTicketForm({ subject: '', message: '' })
  }

  function renderAutoSaveBadge(size = 'desktop') {
    const isSaving = autoSaveStatus === 'saving'
    const containerSize =
      size === 'mobile'
        ? 'inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[10px]'
        : 'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px]'
    const palette = isSaving ? 'text-amber-700' : 'text-emerald-700'

    return (
      <p className={`${containerSize} ${palette}`}>
        <span
          className={`inline-block h-2 w-2 rounded-full ${
            isSaving ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
          }`}
        />
        <span className="font-medium">{isSaving ? 'Saving...' : 'All changes saved'}</span>
      </p>
    )
  }

  function renderModuleContent() {
    if (activeModule === 'Notification') {
      const actionNeeded = notificationItems.filter(
        (item) => item.status === 'Action Needed',
      ).length
      const successCount = notificationItems.filter(
        (item) => item.status === 'Success',
      ).length

      return (
        <section className="space-y-4 p-3 sm:p-6 lg:p-8">
          <div className="rounded-2xl border border-[#0A1628]/10 bg-white p-4 shadow-sm sm:p-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0A1628]/45">
              Activity Hub
            </p>
            <h2 className="text-3xl text-[#0A1628] [font-family:'DM_Serif_Display',serif]">
              Notifications
            </h2>
            <p className="mt-1 text-sm text-[#0A1628]/55">
              Important updates, reminders, and status changes for your application.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-[#0A1628]/10 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0A1628]/45">Total Alerts</p>
              <p className="mt-1 text-2xl font-semibold text-[#0A1628]">
                {notificationItems.length}
              </p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700/70">Action Needed</p>
              <p className="mt-1 text-2xl font-semibold text-amber-700">{actionNeeded}</p>
            </div>
            <div className="rounded-xl border border-green-200 bg-green-50/80 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-700/70">Successful Updates</p>
              <p className="mt-1 text-2xl font-semibold text-green-700">{successCount}</p>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-[#0A1628]/10 bg-white p-4 shadow-sm sm:p-5">
            <h3 className="text-lg font-semibold text-[#0A1628]">Recent Activity</h3>
            {notificationItems.map((item, index) => (
              <article
                key={item.title}
                className="relative rounded-xl border border-[#0A1628]/10 bg-[#F8F7F4] p-4"
              >
                {index !== notificationItems.length - 1 ? (
                  <span className="pointer-events-none absolute bottom-[-14px] left-4 top-[calc(100%_-_4px)] w-px bg-[#0A1628]/12" />
                ) : null}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-[#0A1628]">{item.title}</h3>
                    <p className="mt-1 text-sm text-[#0A1628]/60">{item.message}</p>
                    <p className="mt-2 text-xs text-[#0A1628]/45">{item.time}</p>
                  </div>
                  <span className="whitespace-nowrap rounded-full bg-[#D4A843]/15 px-2.5 py-1 text-xs font-semibold text-[#7a5a14]">
                    {item.status}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )
    }

    if (activeModule === 'FAQ') {
      const supportTickets = Array.isArray(ticketHistory) ? ticketHistory : []
      const tab =
        supportCenterTab === 'tickets' || supportCenterTab === 'faq'
          ? supportCenterTab
          : 'faq'
      const supportTabButtonClass = (id) =>
        `inline-flex min-h-[2.5rem] flex-1 items-center justify-center rounded-lg px-4 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A843] sm:flex-none sm:min-w-[7.5rem] ${
          tab === id
            ? 'bg-white text-[#0A1628] shadow-sm ring-1 ring-[#D4A843]/50'
            : 'text-[#0A1628]/55 hover:bg-white/60 hover:text-[#0A1628]'
        }`

      return (
        <section className="space-y-4 p-3 sm:p-6 lg:p-8">
          <div className="rounded-2xl border border-[#0A1628]/10 bg-white p-4 shadow-sm sm:p-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0A1628]/45">
              Support Center
            </p>
            <h2 className="text-3xl text-[#0A1628] [font-family:'DM_Serif_Display',serif]">
              {tab === 'faq' ? 'Frequently Asked Questions' : 'Tickets'}
            </h2>
            <p className="mt-1 text-sm text-[#0A1628]/55">
              {tab === 'faq'
                ? 'Browse common answers and best practices for a smooth submission.'
                : 'Contact admissions, raise a request, and track your open tickets.'}
            </p>
          </div>

          <div
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            role="tablist"
            aria-label="Support center sections"
          >
            <div className="inline-flex w-full max-w-md rounded-xl border border-[#0A1628]/10 bg-[#F8F7F4] p-1 sm:w-auto">
              <button
                type="button"
                role="tab"
                id="support-tab-faq"
                aria-selected={tab === 'faq'}
                className={supportTabButtonClass('faq')}
                onClick={() => setSupportCenterTab('faq')}
              >
                FAQ
              </button>
              <button
                type="button"
                role="tab"
                id="support-tab-tickets"
                aria-selected={tab === 'tickets'}
                className={supportTabButtonClass('tickets')}
                onClick={() => setSupportCenterTab('tickets')}
              >
                Tickets
              </button>
            </div>
          </div>

          {tab === 'faq' ? (
            <div
              role="tabpanel"
              id="support-panel-faq"
              aria-labelledby="support-tab-faq"
              className="space-y-3 rounded-2xl border border-[#0A1628]/10 bg-white p-4 shadow-sm sm:p-5"
            >
              {faqSections.map((section) => (
                <div key={section.title} className="space-y-2">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#0A1628]/45">
                    {section.title}
                  </h3>
                  {section.items.map((item) => (
                    <details
                      key={item.question}
                      className="group rounded-xl border border-[#0A1628]/10 bg-[#F8F7F4] px-3 py-2.5"
                    >
                      <summary className="cursor-pointer list-none text-sm font-semibold text-[#0A1628] [&::-webkit-details-marker]:hidden">
                        <span className="flex items-center justify-between gap-2">
                          {item.question}
                          <span className="text-xs text-[#0A1628]/40 transition group-open:rotate-45">
                            +
                          </span>
                        </span>
                      </summary>
                      <p className="mt-2 border-t border-[#0A1628]/10 pt-2 text-sm text-[#0A1628]/60">
                        {item.answer}
                      </p>
                    </details>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div
              role="tabpanel"
              id="support-panel-tickets"
              aria-labelledby="support-tab-tickets"
              className="mx-auto w-full max-w-3xl"
            >
              <aside className="rounded-2xl border border-[#D4A843]/35 bg-gradient-to-br from-[#fff7df] to-white p-4 shadow-sm sm:p-5">
                <h3 className="text-lg font-semibold text-[#0A1628]">{faqSupport.title}</h3>
                <p className="mt-1 text-sm text-[#0A1628]/60">{faqSupport.description}</p>
                <a
                  href={`mailto:${faqSupport.email}`}
                  className="mt-4 inline-flex rounded-lg border border-[#D4A843]/40 bg-white px-3 py-2 text-sm font-semibold text-[#0A1628] transition hover:bg-[#fff1c9]"
                >
                  {faqSupport.email}
                </a>

                <form
                  className="mt-4 rounded-xl border border-[#0A1628]/10 bg-white p-3"
                  onSubmit={handleRaiseTicket}
                >
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#0A1628]/45">
                    Raise Ticket
                  </p>
                  <label className="mt-2 block">
                    <span className="text-xs font-semibold text-[#0A1628]/70">Subject</span>
                    <input
                      type="text"
                      value={ticketForm.subject}
                      onChange={(event) => updateTicketField('subject', event.target.value)}
                      placeholder="Issue with upload / payment / form"
                      className="mt-1 w-full rounded-lg border border-[#0A1628]/12 bg-white px-3 py-2 text-sm text-[#0A1628] outline-none transition placeholder:text-[#0A1628]/35 focus:border-[#D4A843]"
                    />
                  </label>
                  <label className="mt-2 block">
                    <span className="text-xs font-semibold text-[#0A1628]/70">Message</span>
                    <textarea
                      value={ticketForm.message}
                      onChange={(event) => updateTicketField('message', event.target.value)}
                      placeholder="Describe the issue clearly..."
                      className="mt-1 min-h-24 w-full resize-y rounded-lg border border-[#0A1628]/12 bg-white px-3 py-2 text-sm text-[#0A1628] outline-none transition placeholder:text-[#0A1628]/35 focus:border-[#D4A843]"
                    />
                  </label>
                  <button
                    type="submit"
                    className="mt-3 inline-flex items-center justify-center rounded-lg bg-[#0A1628] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#163457]"
                  >
                    Submit Ticket
                  </button>
                  {ticketNotice ? (
                    <p className="mt-2 text-xs text-[#0A1628]/65">{ticketNotice}</p>
                  ) : null}

                  <div className="mt-4 border-t border-[#0A1628]/10 pt-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#0A1628]/45">
                        My tickets
                      </p>
                      {supportTickets.length > 0 ? (
                        <span className="text-[11px] font-medium tabular-nums text-[#0A1628]/50">
                          {supportTickets.length}{' '}
                          {supportTickets.length === 1 ? 'ticket' : 'tickets'}
                        </span>
                      ) : null}
                    </div>
                    {supportTickets.length === 0 ? (
                      <p className="mt-2 text-xs text-[#0A1628]/50">
                        No tickets yet. When you submit one, it will appear here with full details
                        and status.
                      </p>
                    ) : (
                      <ul className="mt-3 max-h-[min(28rem,70vh)] space-y-3 overflow-y-auto pr-0.5">
                        {supportTickets.map((ticket, ticketIndex) => {
                          const status = ticket.status ?? 'Open'
                          const { pill: statusPillClass, border: statusBorderClass } =
                            getSupportTicketStatusStyles(status)
                          const statusHint = getSupportTicketStatusHint(status)
                          let raised = null
                          try {
                            raised = ticket.raisedAt ? new Date(ticket.raisedAt) : null
                          } catch {
                            raised = null
                          }
                          const raisedFull =
                            raised && !Number.isNaN(raised.getTime())
                              ? raised.toLocaleString(undefined, {
                                  weekday: 'short',
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: 'numeric',
                                  minute: '2-digit',
                                })
                              : ''
                          return (
                            <li
                              key={ticket.id ?? `ticket-${ticketIndex}`}
                              className={`rounded-xl border border-[#0A1628]/10 bg-[#F8F7F4] p-3 shadow-sm ${statusBorderClass}`}
                            >
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0 space-y-1">
                                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0A1628]/40">
                                    Reference
                                  </p>
                                  <p className="font-mono text-xs font-medium text-[#0A1628]">
                                    {ticket.id ?? '—'}
                                  </p>
                                </div>
                                <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
                                  <span
                                    className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${statusPillClass}`}
                                  >
                                    {status}
                                  </span>
                                  <p className="max-w-[14rem] text-right text-[10px] leading-snug text-[#0A1628]/55 sm:max-w-[11rem]">
                                    {statusHint}
                                  </p>
                                </div>
                              </div>

                              <dl className="mt-3 space-y-2 border-t border-[#0A1628]/8 pt-3 text-xs">
                                <div>
                                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-[#0A1628]/45">
                                    Submitted
                                  </dt>
                                  <dd className="mt-0.5 text-[#0A1628]">
                                    {raisedFull || '—'}
                                    {raisedFull ? (
                                      <span className="text-[#0A1628]/45"> (your local time)</span>
                                    ) : null}
                                  </dd>
                                </div>
                                {ticket.submittedBy ? (
                                  <div>
                                    <dt className="text-[10px] font-semibold uppercase tracking-wide text-[#0A1628]/45">
                                      Contact email
                                    </dt>
                                    <dd className="mt-0.5 break-all text-[#0A1628]">
                                      {ticket.submittedBy}
                                    </dd>
                                  </div>
                                ) : null}
                                <div>
                                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-[#0A1628]/45">
                                    Subject
                                  </dt>
                                  <dd className="mt-0.5 font-semibold text-[#0A1628]">
                                    {ticket.subject ?? '—'}
                                  </dd>
                                </div>
                                <div>
                                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-[#0A1628]/45">
                                    Your message
                                  </dt>
                                  <dd className="mt-1">
                                    <div className="max-h-36 overflow-y-auto rounded-lg border border-[#0A1628]/10 bg-white/90 px-3 py-2.5 text-sm leading-relaxed text-[#0A1628]/85 [overflow-wrap:anywhere] whitespace-pre-wrap">
                                      {ticket.message ?? '—'}
                                    </div>
                                  </dd>
                                </div>
                              </dl>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>
                </form>
              </aside>
            </div>
          )}
        </section>
      )
    }

    if (activeModule === 'Document') {
      const requiredDocs = uploadedDocuments.filter((item) => item.required)
      const uploadedRequiredCount = requiredDocs.filter((item) => item.value).length
      const completionPercent = requiredDocs.length
        ? Math.round((uploadedRequiredCount / requiredDocs.length) * 100)
        : 0

      return (
        <section className="space-y-4 p-3 sm:p-6 lg:p-8">
          <div className="rounded-2xl border border-[#0A1628]/10 bg-white p-4 shadow-sm sm:p-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0A1628]/45">
              File Management
            </p>
            <h2 className="text-3xl text-[#0A1628] [font-family:'DM_Serif_Display',serif]">
              Document Center
            </h2>
            <p className="mt-1 text-sm text-[#0A1628]/55">
              Monitor required uploads, document status, and completion progress.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-[#0A1628]/10 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0A1628]/45">Required Uploaded</p>
              <p className="mt-1 text-2xl font-semibold text-[#0A1628]">
                {uploadedRequiredCount}/{requiredDocs.length}
              </p>
            </div>
            <div className="rounded-xl border border-[#0A1628]/10 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0A1628]/45">Total Files</p>
              <p className="mt-1 text-2xl font-semibold text-[#0A1628]">{uploadedDocuments.length}</p>
            </div>
            <div className="rounded-xl border border-[#D4A843]/35 bg-[#fff8e8] p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7a5a14]">Completion</p>
              <p className="mt-1 text-2xl font-semibold text-[#7a5a14]">{completionPercent}%</p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#0A1628]/10 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-[#0A1628]/55">
                <span>Required documents completion</span>
                <span className="font-semibold text-[#0A1628]">{completionPercent}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-[#0A1628]/10">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-[#D4A843] to-[#b98a22] transition-all duration-500"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>

            <div className="space-y-2.5">
              {uploadedDocuments.map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col gap-2 rounded-xl border border-[#0A1628]/10 bg-[#F8F7F4] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#0A1628]/85">{item.label}</p>
                    <p className="truncate text-xs text-[#0A1628]/50">
                      {item.value ? item.value : 'Not uploaded'}
                    </p>
                  </div>
                  <span
                    className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${
                      item.value
                        ? 'bg-green-100 text-green-700'
                        : item.required
                          ? 'bg-red-100 text-red-700'
                          : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.value ? 'Uploaded' : item.required ? 'Required' : 'Optional'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )
    }

    return (
      <StepForm
        step={currentStep}
        stepNumber={currentStepIndex + 1}
        totalSteps={applicationSteps.length}
        steps={applicationSteps}
        currentIndex={currentStepIndex}
        onStepClick={setCurrentStepIndex}
        values={formValues}
        errors={validationErrors}
        formError={formError}
        draftNotice={draftNotice}
        onChange={updateField}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSaveDraft={handleSaveDraft}
        canGoBack={currentStepIndex > 0}
        isLastStep={currentStepIndex === applicationSteps.length - 1}
        onSubmit={handleSubmit}
      />
    )
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,#fff4d6_0%,#f7f6f3_35%,#eef2f7_100%)] [font-family:'Plus_Jakarta_Sans',sans-serif]">
      {!submitted ? (
        <header className="border-b border-[#0A1628]/10 bg-white/70 px-4 py-3 backdrop-blur-md sm:px-6 lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <img
                  src={crestLogo}
                  alt="MUCM Crest"
                  className="h-10 w-10 rounded-lg border border-[#0A1628]/10 bg-white p-1 shadow-sm"
                />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0A1628]/45 sm:text-xs">
                    METROPOLITAN UNIVERSITY COLLEGE OF MEDICINE
                  </p>
                  <h1 className="text-base text-[#0A1628] [font-family:'DM_Serif_Display',serif] sm:text-lg">
                    Application Form
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {renderAutoSaveBadge('mobile')}
                <ProfileDropdown email={userEmail} onLogout={handleLogout} />
              </div>
            </div>
            <PrimaryButton
              variant="outline"
              type="button"
              onClick={() => navigate('/before-you-begin')}
            >
              Checklist
            </PrimaryButton>
          </div>
        </header>
      ) : null}

      {!submitted ? (
        <div className="border-b border-[#0A1628]/10 bg-white/55 px-3 py-2 backdrop-blur lg:hidden">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {moduleNavigation.map((module) => (
              <button
                key={module.name}
                type="button"
                onClick={() => handleModuleChange(module.name)}
                className={`whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                  activeModule === module.name
                    ? 'border-[#D4A843]/70 bg-[#D4A843]/20 text-[#0A1628]'
                    : 'border-[#0A1628]/15 bg-white/70 text-[#0A1628]/65'
                }`}
              >
                {module.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {submitted ? (
        <section className="mx-auto w-[min(780px,92%)] py-8 text-center sm:py-10">
          <div className="mx-auto flex w-fit items-center gap-2 text-[#0A1628]/35">
            <img
              src={crestLogo}
              alt="MUCM Crest"
              className="h-11 w-11 rounded-lg border border-[#0A1628]/10 bg-white p-1 shadow-sm"
            />
            <span className="text-xs font-bold uppercase tracking-[0.16em]">
              Metropolitan University College of Medicine
            </span>
          </div>

          <div className="mx-auto mt-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-100/70">
            <span className="text-2xl text-emerald-600">✓</span>
          </div>

          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135755.png"
            alt="Graduates"
            className="mx-auto mt-4 h-28 w-28 object-contain sm:h-32 sm:w-32"
          />

          <h2 className="mt-3 text-4xl text-[#0A1628] [font-family:'DM_Serif_Display',serif]">
            Application Submitted!
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-[#0A1628]/58">
            Thank you for applying to Metropolitan University College of Medicine.
            Your application has been received and is now under review.
          </p>
          {lastSubmissionId ? (
            <p className="mt-2 text-sm font-semibold text-[#0A1628]/65">
              Reference ID: {lastSubmissionId}
            </p>
          ) : null}

          <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-[#0A1628]/10 bg-white p-5 text-left shadow-lg shadow-[#0A1628]/8">
            <h3 className="text-base font-bold uppercase tracking-[0.12em] text-[#0A1628]">
              What Happens Next
            </h3>
            <div className="mt-3 space-y-3">
              <article className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#D4A843]/12 text-[#7a5a14]">
                  ✉
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#0A1628]">Confirmation Email</p>
                  <p className="text-xs text-[#0A1628]/55">
                    You will receive a confirmation email with your application reference number.
                  </p>
                </div>
              </article>
              <article className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#D4A843]/12 text-[#7a5a14]">
                  📄
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#0A1628]">Document Review</p>
                  <p className="text-xs text-[#0A1628]/55">
                    Our admissions team will review your submitted documents and may contact you.
                  </p>
                </div>
              </article>
              <article className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#D4A843]/12 text-[#7a5a14]">
                  📅
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#0A1628]">Admissions Interview</p>
                  <p className="text-xs text-[#0A1628]/55">
                    Shortlisted applicants are invited for a virtual interview in 2-3 business days.
                  </p>
                </div>
              </article>
            </div>
          </div>

          <p className="mt-6 text-sm text-[#0A1628]/52">
            Questions? Contact us at{' '}
            <a className="font-semibold text-[#b98a22] hover:text-[#9f741a]" href="mailto:admissions@muantigua.org">
              admissions@muantigua.org
            </a>{' '}
            or call{' '}
            <a className="font-semibold text-[#b98a22] hover:text-[#9f741a]" href="tel:+12685629262">
              +1 (268) 562-9262
            </a>
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <PrimaryButton
              variant="outline"
              type="button"
              onClick={() => navigate('/submitted-applications')}
            >
              View Submitted Applications
            </PrimaryButton>
            <PrimaryButton variant="outline" type="button" onClick={resetApplication}>
              Start New Application
            </PrimaryButton>
          </div>
        </section>
      ) : (
        <div className="grid min-h-screen grid-cols-1 lg:h-[100dvh] lg:min-h-0 lg:grid-cols-[320px_minmax(0,1fr)] lg:overflow-hidden">
          <StepSidebar
            activeModule={activeModule}
            onModuleChange={handleModuleChange}
          />
          <section ref={desktopScrollRef} className="flex flex-col lg:h-[100dvh] lg:overflow-y-auto">
            <div className="hidden items-center justify-between border-b border-[#0A1628]/10 bg-white/80 px-7 py-2.5 backdrop-blur-md lg:sticky lg:top-0 lg:z-20 lg:flex">
              <div className="flex items-center gap-3">
                <img
                  src={crestLogo}
                  alt="MUCM Crest"
                  className="h-10 w-10 rounded-xl border border-[#0A1628]/10 bg-white p-1 shadow-sm"
                />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0A1628]/45">
                    METROPOLITAN UNIVERSITY COLLEGE OF MEDICINE
                  </p>
                  <h1 className="text-xl text-[#0A1628] [font-family:'DM_Serif_Display',serif]">
                    Application Form
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {renderAutoSaveBadge()}
                <PrimaryButton
                  variant="outline"
                  type="button"
                  onClick={() => navigate('/before-you-begin')}
                >
                  Back to Checklist
                </PrimaryButton>
                <ProfileDropdown email={userEmail} onLogout={handleLogout} />
              </div>
            </div>
            {renderModuleContent()}
          </section>
        </div>
      )}
    </main>
  )
}

export default ApplicationPage
