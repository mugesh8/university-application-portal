import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StepSidebar from '../components/application/StepSidebar.jsx'
import ProfileDropdown from '../components/common/ProfileDropdown.jsx'
import PrimaryButton from '../components/common/PrimaryButton.jsx'
import { applicationSteps } from '../data/applicationSteps.js'
import { isFieldVisible } from '../utils/formVisibility.js'
import { getSingleFieldDisplayValue } from '../utils/submissionDisplay.js'

const crestLogo =
  'https://d2xsxph8kpxj0f.cloudfront.net/310519663394975842/o5YxQXzG37vUfAnZtRoyQg/mucm-crest-logo_aac17a92.png'
const SUBMISSIONS_KEY = 'mucm-submitted-applications'

function SubmissionAnswers({ formValues }) {
  const stepsWithFields = useMemo(() => {
    if (!formValues || typeof formValues !== 'object') {
      return []
    }
    return applicationSteps
      .filter((s) => s.id !== 'reviewSubmit')
      .map((step) => ({
        step,
        visibleFields: step.fields.filter(
          (field) =>
            field.type !== 'note' &&
            !String(field.name).startsWith('__') &&
            isFieldVisible(field, formValues),
        ),
      }))
      .filter(({ visibleFields }) => visibleFields.length > 0)
  }, [formValues])

  if (stepsWithFields.length === 0) {
    return null
  }

  return (
    <div className="mt-3 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0A1628]/40">
        All submitted answers
      </p>
      {stepsWithFields.map(({ step, visibleFields }) => (
        <div
          key={step.id}
          className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
        >
          <div className="border-b border-[#0A1628]/8 bg-[#F8F7F4] px-5 py-2.5 sm:px-6">
            <h4 className="text-base font-semibold text-[#0A1628] [font-family:'DM_Serif_Display',serif]">
              {step.title}
            </h4>
            {step.description ? (
              <p className="mt-0.5 text-xs text-[#0A1628]/50">{step.description}</p>
            ) : null}
          </div>
          <div className="space-y-0 p-5 sm:p-6">
            {visibleFields.map((field) => (
              <div
                key={`${step.id}-${field.name}`}
                className="border-b border-[#0A1628]/8 py-2.5 last:border-b-0"
              >
                {field.type === 'repeatable' ? (
                  <div className="space-y-2.5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0A1628]/45">
                      {field.sectionTitle ?? field.label ?? field.name}
                    </p>
                    {Array.isArray(formValues[field.name]) && formValues[field.name].length > 0 ? (
                      formValues[field.name].map((row, rowIndex) => (
                        <div
                          key={`${field.name}-row-${rowIndex}`}
                          className="rounded-lg border border-[#0A1628]/8 bg-[#F8F7F4] px-3 py-2.5"
                        >
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0A1628]/45">
                            {field.itemBadge ?? 'Item'} {rowIndex + 1}
                          </p>
                          <div className="mt-1.5 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                            {(field.itemFields ?? []).map((sub) => (
                              <p
                                key={`${field.name}-${rowIndex}-${sub.name}`}
                                className="text-xs text-[#0A1628]/72"
                              >
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
                    {field.type === 'file' &&
                    typeof formValues[field.name] === 'string' &&
                    formValues[field.name].startsWith('data:image/') ? (
                      <div className="space-y-1.5">
                        <p className="text-xs text-[#0A1628]/55">Uploaded signature</p>
                        <img
                          src={formValues[field.name]}
                          alt=""
                          className="max-h-24 max-w-[240px] rounded-lg border border-[#0A1628]/10 bg-white object-contain"
                        />
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap text-[#0A1628]/78">
                        {getSingleFieldDisplayValue(field, formValues[field.name])}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function SubmittedApplicationsPage() {
  const navigate = useNavigate()
  const [activeModule, setActiveModule] = useState('Submitted Applications')
  const userEmail = (() => {
    try {
      return JSON.parse(window.localStorage.getItem('mucm-auth-session') ?? '{}').email ?? ''
    } catch {
      return ''
    }
  })()

  const submissions = useMemo(() => {
    try {
      const raw = JSON.parse(window.localStorage.getItem(SUBMISSIONS_KEY) ?? '[]')
      const all = Array.isArray(raw) ? raw : []
      return all.filter((item) => item.userEmail === userEmail)
    } catch {
      return []
    }
  }, [userEmail])

  const [expandedId, setExpandedId] = useState(submissions[0]?.id ?? '')

  function handleModuleChange(moduleName) {
    setActiveModule(moduleName)
    if (moduleName === 'Submitted Applications') {
      return
    }
    navigate('/application', { state: { initialModule: moduleName } })
  }

  function handleLogout() {
    window.localStorage.removeItem('mucm-auth-session')
    navigate('/login')
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="page-gutter-x border-b border-border bg-card/95 py-3 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <img
              src={crestLogo}
              alt="MUCM Crest"
              className="h-10 w-10 rounded-lg border border-border bg-card p-1 shadow-sm"
            />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0A1628]/45">
                APPLICATION ARCHIVE
              </p>
              <h1 className="text-base text-[#0A1628] [font-family:'DM_Serif_Display',serif] sm:text-lg">
                Submitted Applications
              </h1>
            </div>
          </div>
          <ProfileDropdown email={userEmail} onLogout={handleLogout} />
        </div>
      </header>

      <div className="grid min-h-screen grid-cols-1 lg:h-[100dvh] lg:min-h-0 lg:grid-cols-[320px_minmax(0,1fr)] lg:overflow-hidden">
        <StepSidebar activeModule={activeModule} onModuleChange={handleModuleChange} />

        <section className="flex flex-col lg:h-[100dvh] lg:overflow-y-auto">
          <div className="page-gutter-x hidden items-center justify-between border-b border-border bg-card/95 py-2.5 backdrop-blur-md lg:sticky lg:top-0 lg:z-20 lg:flex">
            <div className="flex items-center gap-3">
              <img
                src={crestLogo}
                alt="MUCM Crest"
                className="h-10 w-10 rounded-xl border border-border bg-card p-1 shadow-sm"
              />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0A1628]/45">
                  APPLICATION ARCHIVE
                </p>
                <h1 className="text-xl text-[#0A1628] [font-family:'DM_Serif_Display',serif]">
                  Submitted Applications
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <PrimaryButton variant="outline" type="button" onClick={() => navigate('/before-you-begin')}>
                Back
              </PrimaryButton>
              <PrimaryButton type="button" onClick={() => navigate('/application')}>
                New Application
              </PrimaryButton>
              <ProfileDropdown email={userEmail} onLogout={handleLogout} />
            </div>
          </div>

          <div className="page-gutter-x space-y-3 py-3 sm:py-5 lg:py-6">
            {submissions.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
                <h2 className="text-2xl text-[#0A1628] [font-family:'DM_Serif_Display',serif]">
                  No submitted applications yet
                </h2>
                <p className="mt-2 text-sm text-[#0A1628]/60">
                  Once you submit, your application and document statuses will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {submissions.map((submission) => {
                  const uploadedCount = submission.documents.filter((doc) => doc.value).length
                  const requiredCount = submission.documents.filter((doc) => doc.required).length
                  const requiredUploaded = submission.documents.filter((doc) => doc.required && doc.value).length
                  const isExpanded = expandedId === submission.id

                  return (
                    <article
                      key={submission.id}
                      className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
                    >
                      <button
                        type="button"
                        className="w-full px-6 py-3 text-left transition hover:bg-[#F8F7F4] sm:px-8"
                        onClick={() => setExpandedId((prev) => (prev === submission.id ? '' : submission.id))}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0A1628]/45">
                              {new Date(submission.submittedAt).toLocaleString()}
                            </p>
                            <h3 className="text-lg text-[#0A1628] [font-family:'DM_Serif_Display',serif]">
                              {submission.applicantName}
                            </h3>
                            <p className="text-xs text-[#0A1628]/55">Reference: {submission.id}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-[#0A1628]/6 px-2.5 py-1 text-xs font-semibold text-[#0A1628]/65">
                              Docs: {uploadedCount}/{submission.documents.length}
                            </span>
                            <span className="rounded-full bg-[#D4A843]/15 px-2.5 py-1 text-xs font-semibold text-[#7a5a14]">
                              Required: {requiredUploaded}/{requiredCount}
                            </span>
                          </div>
                        </div>
                      </button>

                      {isExpanded ? (
                        <div className="border-t border-[#0A1628]/8 bg-[#F8F7F4] px-6 py-4 sm:px-8">
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <div className="rounded-xl border border-border bg-card p-3">
                              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0A1628]/40">
                                Applicant Details
                              </p>
                              <p className="mt-1 text-sm text-[#0A1628]/75">
                                Name: {submission.applicantName}
                              </p>
                              <p className="text-sm text-[#0A1628]/75">
                                Email: {submission.formValues?.email || 'Not provided'}
                              </p>
                              <p className="text-sm text-[#0A1628]/75">
                                Phone: {submission.formValues?.phoneMobile || 'Not provided'}
                              </p>
                            </div>
                            <div className="rounded-xl border border-border bg-card p-3">
                              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0A1628]/40">
                                Application Meta
                              </p>
                              <p className="mt-1 text-sm text-[#0A1628]/75">
                                Submitted by: {submission.userEmail}
                              </p>
                              <p className="text-sm text-[#0A1628]/75">
                                Submission ID: {submission.id}
                              </p>
                            </div>
                          </div>

                          <SubmissionAnswers formValues={submission.formValues} />

                          <div className="mt-3 rounded-xl border border-border bg-card p-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0A1628]/40">
                              Documents
                            </p>
                            <div className="mt-2 space-y-2">
                              {submission.documents.map((doc) => (
                                <div
                                  key={`${submission.id}-${doc.name}`}
                                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#0A1628]/8 bg-[#F8F7F4] px-3 py-2"
                                >
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-[#0A1628]/80">{doc.label}</p>
                                    <p className="text-xs text-[#0A1628]/50">
                                      {doc.value ? doc.value : 'Not uploaded'}
                                    </p>
                                  </div>
                                  <span
                                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                      doc.value
                                        ? 'bg-green-100 text-green-700'
                                        : doc.required
                                          ? 'bg-red-100 text-red-700'
                                          : 'bg-slate-100 text-slate-600'
                                    }`}
                                  >
                                    {doc.value ? 'Uploaded' : doc.required ? 'Required Missing' : 'Optional'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </article>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

export default SubmittedApplicationsPage
