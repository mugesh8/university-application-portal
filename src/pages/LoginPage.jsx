import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PrimaryButton from '../components/common/PrimaryButton.jsx'

const crestLogo =
  'https://d2xsxph8kpxj0f.cloudfront.net/310519663394975842/o5YxQXzG37vUfAnZtRoyQg/mucm-crest-logo_aac17a92.png'

function LoginPage({ onLogin, demoEmail, demoOtp }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const isValid = onLogin(email, otp)

    if (!isValid) {
      setError('Invalid demo credentials. Please use the demo email and OTP.')
      return
    }

    setError('')
    navigate('/before-you-begin')
  }

  function fillDemoCredentials() {
    setEmail(demoEmail)
    setOtp(demoOtp)
    setError('')
  }

  return (
    <main className="page-gutter-x flex min-h-screen items-center justify-center bg-background py-8">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-xl border border-border bg-card shadow-md lg:grid-cols-[1.05fr_1fr]">
        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[#071427] via-[#0A1628] to-[#163457] p-8 text-white lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,168,67,0.24),transparent_45%)]" />
          <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/5" />
          <div className="relative z-10 flex h-full flex-col">
            <div className="flex items-center gap-3">
              <img
                src={crestLogo}
                alt="MUCM Crest"
                className="h-14 w-14 rounded-xl border border-white/20 bg-white/10 p-1.5"
              />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D4A843]">
                  Metropolitan University
                </p>
                <h1 className="text-2xl [font-family:'DM_Serif_Display',serif]">
                  College of Medicine
                </h1>
              </div>
            </div>

            <div className="mt-12">
              <p className="text-sm uppercase tracking-[0.18em] text-white/45">
                Welcome Back
              </p>
              <h2 className="mt-2 text-4xl leading-tight [font-family:'DM_Serif_Display',serif]">
                Admissions Dashboard Login
              </h2>
              <p className="mt-4 max-w-sm text-base leading-relaxed text-white/65">
                Access your application workspace, continue your form, and track
                updates in one place.
              </p>
            </div>

            <div className="mt-auto rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
                Demo credentials
              </p>
              <p className="mt-2 text-sm text-white/85">Email: {demoEmail}</p>
              <p className="text-sm text-white/85">OTP: {demoOtp}</p>
            </div>
          </div>
        </aside>

        <div className="p-6 sm:p-8">
          <header className="mb-6 lg:hidden">
            <div className="flex items-center gap-3">
              <img
                src={crestLogo}
                alt="MUCM Crest"
                className="h-12 w-12 rounded-lg border border-[#0A1628]/10 bg-white p-1 shadow-sm"
              />
              <div>
                <h1 className="text-2xl text-[#0A1628] [font-family:'DM_Serif_Display',serif]">
                  MUCM Login
                </h1>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#D4A843]">
                  Admissions Portal
                </p>
              </div>
            </div>
          </header>

          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0A1628]/45">
              Secure Access
            </p>
            <h2 className="mt-1 text-3xl text-[#0A1628] [font-family:'DM_Serif_Display',serif]">
              Login to your account
            </h2>
            <p className="mt-1.5 text-base text-[#0A1628]/55">
              Enter your email and OTP to continue.
            </p>
          </div>

          <div className="mb-5 rounded-xl border border-[#D4A843]/35 bg-[#fff9ea] p-3 text-sm text-[#0A1628]/80 lg:hidden">
            <p className="font-semibold text-[#0A1628]">Demo credentials</p>
            <p>Email: {demoEmail}</p>
            <p>OTP: {demoOtp}</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm font-semibold text-[#0A1628]/85">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter email"
                className="mt-1.5 w-full rounded-xl border border-[#0A1628]/10 bg-white px-3.5 py-2.5 text-sm text-[#0A1628] shadow-sm outline-none transition duration-300 placeholder:text-[#0A1628]/35 focus:border-[#D4A843] focus:shadow-[0_0_0_4px_rgba(212,168,67,0.18)]"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-[#0A1628]/85">OTP</span>
              <input
                type="text"
                required
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                placeholder="Enter OTP"
                className="mt-1.5 w-full rounded-xl border border-[#0A1628]/10 bg-white px-3.5 py-2.5 text-sm text-[#0A1628] shadow-sm outline-none transition duration-300 placeholder:text-[#0A1628]/35 focus:border-[#D4A843] focus:shadow-[0_0_0_4px_rgba(212,168,67,0.18)]"
              />
            </label>

            {error ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </p>
            ) : null}

            <div className="flex flex-col gap-2 pt-1">
              <PrimaryButton type="submit">Login</PrimaryButton>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="rounded-xl border border-[#0A1628]/12 bg-white px-4 py-2.5 text-sm font-semibold text-[#0A1628]/75 transition hover:border-[#D4A843]/50 hover:bg-[#fff8e8]"
              >
                Use Demo Credentials
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  )
}

export default LoginPage
