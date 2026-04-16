import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PrimaryButton from '../components/common/PrimaryButton.jsx'

const crestLogo =
  'https://d2xsxph8kpxj0f.cloudfront.net/310519663394975842/o5YxQXzG37vUfAnZtRoyQg/mucm-crest-logo_aac17a92.png'

function getInitials(email) {
  if (!email) return 'AP'
  const [local] = email.split('@')
  const parts = local.split(/[._-]/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return local.slice(0, 2).toUpperCase()
}

function ProfilePage() {
  const navigate = useNavigate()
  const userEmail = (() => {
    try {
      return JSON.parse(window.localStorage.getItem('mucm-auth-session') ?? '{}').email ?? ''
    } catch {
      return ''
    }
  })()

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    nationality: '',
    dateOfBirth: '',
  })
  const [saved, setSaved] = useState(false)

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setSaved(false)
  }

  function handleSave(e) {
    e.preventDefault()
    setSaved(true)
  }

  const initials = getInitials(userEmail)

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,#fff4d6_0%,#f7f6f3_35%,#eef2f7_100%)] px-3 py-6 [font-family:'Plus_Jakarta_Sans',sans-serif] sm:px-5 lg:px-8">
      {/* Top nav */}
      <div className="mx-auto mb-6 flex max-w-3xl items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 rounded-lg border border-[#0A1628]/12 bg-white/80 px-3 py-2 text-sm font-medium text-[#0A1628]/70 shadow-sm backdrop-blur transition hover:bg-white hover:text-[#0A1628]"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Back
        </button>
        <div className="flex items-center gap-2">
          <img src={crestLogo} alt="MUCM" className="h-8 w-8 rounded-lg border border-[#0A1628]/10 bg-white p-1 shadow-sm" />
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#0A1628]/45">MUCM Portal</span>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-5">
        {/* Profile hero card */}
        <div className="relative overflow-hidden rounded-3xl bg-[#0A1628] px-6 py-8 shadow-2xl shadow-[#0A1628]/20">
          <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-[#D4A843]/10" />
          <div className="pointer-events-none absolute -bottom-10 left-16 h-32 w-32 rounded-full bg-[#D4A843]/8" />
          <div className="relative z-10 flex items-center gap-5">
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-[#D4A843]/20 text-3xl font-bold text-[#D4A843] ring-2 ring-[#D4A843]/30">
              {initials}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D4A843]">Applicant Account</p>
              <h1 className="mt-0.5 text-2xl text-white [font-family:'DM_Serif_Display',serif] sm:text-3xl">
                My Profile
              </h1>
              <p className="mt-1 text-sm text-white/55">{userEmail}</p>
            </div>
          </div>
        </div>

        {/* Form card */}
        <form onSubmit={handleSave} className="rounded-3xl border border-[#0A1628]/10 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold text-[#0A1628] [font-family:'DM_Serif_Display',serif]">
            Personal Information
          </h2>
          <p className="mt-0.5 text-xs text-[#0A1628]/45">
            Update your personal details associated with this application account.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { name: 'firstName', label: 'First Name', type: 'text', placeholder: 'e.g. John' },
              { name: 'lastName', label: 'Last Name', type: 'text', placeholder: 'e.g. Smith' },
              { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+1 (555) 000-0000' },
              { name: 'nationality', label: 'Nationality', type: 'text', placeholder: 'e.g. Antiguan' },
              { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', placeholder: '' },
            ].map((field) => (
              <div key={field.name} className={field.name === 'phone' || field.name === 'nationality' ? 'sm:col-span-1' : ''}>
                <label className="block text-sm font-semibold text-[#0A1628]/85">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className="mt-1.5 w-full rounded-xl border border-[#0A1628]/10 bg-[#F8F7F4] px-3.5 py-2.5 text-sm text-[#0A1628] outline-none transition placeholder:text-[#0A1628]/30 focus:border-[#D4A843] focus:bg-white focus:shadow-[0_0_0_4px_rgba(212,168,67,0.18)]"
                />
              </div>
            ))}

            {/* Email — read-only */}
            <div>
              <label className="block text-sm font-semibold text-[#0A1628]/85">
                Email Address
              </label>
              <input
                type="email"
                value={userEmail}
                readOnly
                className="mt-1.5 w-full cursor-not-allowed rounded-xl border border-[#0A1628]/10 bg-[#0A1628]/4 px-3.5 py-2.5 text-sm text-[#0A1628]/50 outline-none"
              />
              <p className="mt-1 text-xs text-[#0A1628]/40">Email is linked to your login and cannot be changed here.</p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <PrimaryButton type="submit">Save Changes</PrimaryButton>
            {saved ? (
              <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                Saved successfully
              </span>
            ) : null}
          </div>
        </form>

        {/* Account info card */}
        <div className="rounded-3xl border border-[#0A1628]/10 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold text-[#0A1628] [font-family:'DM_Serif_Display',serif]">
            Account Details
          </h2>
          <p className="mt-0.5 text-xs text-[#0A1628]/45">Read-only account information managed by the admissions office.</p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { label: 'Account Type', value: 'Applicant' },
              { label: 'Application Status', value: 'In Progress' },
              { label: 'Institution', value: 'Metropolitan University College of Medicine' },
              { label: 'Portal Access', value: 'Active' },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-[#0A1628]/8 bg-[#F8F7F4] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0A1628]/40">{item.label}</p>
                <p className="mt-1 text-sm font-medium text-[#0A1628]/80">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

export default ProfilePage
