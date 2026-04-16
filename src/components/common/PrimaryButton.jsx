function PrimaryButton({ children, variant = 'solid', ...props }) {
  const baseClasses =
    'inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold tracking-wide transition-all duration-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A843]/60'
  const variantClasses =
    variant === 'outline'
      ? 'border border-[#D4A843]/50 bg-white/80 text-[#0A1628] shadow-sm backdrop-blur hover:border-[#D4A843] hover:bg-[#D4A843]/10'
      : 'bg-gradient-to-r from-[#0A1628] via-[#122640] to-[#0A1628] text-white shadow-lg shadow-[#0A1628]/35 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#0A1628]/45'

  return (
    <button className={`${baseClasses} ${variantClasses}`} {...props}>
      {children}
    </button>
  )
}

export default PrimaryButton
