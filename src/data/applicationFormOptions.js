export const titleOptions = ['Mr', 'Mrs', 'Ms', 'Mx', 'Dr', 'Other']

export const pronounOptions = ['He/Him', 'She/Her', 'They/Them', 'Prefer not to say', 'Other']

export const genderOptions = ['Male', 'Female', 'Non-binary', 'Prefer not to say']

export const ethnicityOptions = [
  'African / Black',
  'Asian',
  'Caribbean',
  'European / White',
  'Hispanic / Latino',
  'Middle Eastern / North African',
  'Mixed / Multiple Ethnic Groups',
  'Pacific Islander',
  'South Asian',
  'Prefer not to say',
  'Other',
]

export const visaStatusOptions = [
  'Citizen',
  'Permanent Resident',
  'Student Visa (F-1 / J-1)',
  'Work Visa',
  'Tourist / Visitor Visa',
  'Refugee / Asylum Status',
  'No Visa Required',
  'Will Need Student Visa',
  'Other',
]

export const emergencyRelationshipOptions = [
  'Parent',
  'Spouse',
  'Sibling',
  'Guardian',
  'Uncle/Aunt',
  'Grandparent',
  'Friend',
  'Other',
]

export const financialSponsorOptions = [
  'Self-funded',
  'Parent / Family',
  'Government Scholarship',
  'Private Scholarship',
  'Employer Sponsored',
  'Student Loan',
  'Other',
]

export const programTypeOptions = [
  {
    value: '4year',
    label: '4-Year Doctor of Medicine (MD)',
    description:
      'For students with prior university-level science education or eligible academic backgrounds.',
  },
  {
    value: '5year',
    label: '5-Year Doctor of Medicine (MD) with Pre-Med',
    description:
      'For students entering directly after secondary education or without a prior science degree.',
  },
]

export const subProgramOptions = [
  {
    value: 'premedical',
    label: 'Premedical Program',
    description:
      'For those seeking admission after completion of high school or who have completed some PM program or college-level education elsewhere.',
  },
  {
    value: 'basic-science',
    label: 'Basic Science Program',
    description:
      "For those who have completed a PM program at another medical school or who have a bachelor's degree.",
  },
  {
    value: 'clinical-science',
    label: 'Clinical Science Program',
    description:
      'For those who are transferring from another medical school after completing minimum of 2 years of education.',
  },
]

export const semesterOptions = ['Spring (January)', 'Summer (May)', 'Fall (September)']

export const intakeYearOptions = ['2026', '2027', '2028', '2029']

export const englishProficiencyOptions = [
  'Native Speaker',
  'Fluent',
  'Advanced',
  'Intermediate',
  'Basic',
]

export const englishTestTypeOptions = [
  'TOEFL iBT',
  'IELTS Academic',
  'PTE Academic',
  'Duolingo English Test',
  'Cambridge C1/C2',
  'Not Applicable',
]

export const standardizedTestTypeOptions = ['MCAT', 'UCAT', 'GAMSAT', 'BMAT', 'Not Applicable']

export const experienceTypeOptions = [
  'Clinical Experience',
  'Research',
  'Volunteer / Community Service',
  'Shadowing',
  'Leadership',
  'Teaching / Tutoring',
  'Employment',
  'Extracurricular Activity',
  'Other',
]

export const referralSourceOptions = [
  'Search Engine (Google, Bing, etc.)',
  'Social Media (Facebook, Instagram, etc.)',
  'Friend or Family Referral',
  'Education Agent / Consultant',
  'University Fair / Event',
  'Online Advertisement',
  'News Article / Blog',
  'WhatsApp',
  'YouTube',
  'Current Student / Alumni Referral',
  'Embassy / Consulate',
  'Other',
]

export const paymentOptions = [
  {
    value: 'A',
    label: 'Self-Funded',
    description:
      'I will be personally responsible for all tuition fees, living expenses, and associated costs throughout my enrollment at MUCM.',
  },
  {
    value: 'B',
    label: 'Sponsored by an Individual',
    description:
      'A family member, guardian, or other individual will be financially responsible for my education expenses at MUCM.',
  },
  {
    value: 'C',
    label: 'Sponsored by an Organization',
    description:
      'A government body, employer, scholarship foundation, or other organization will fund my education at MUCM.',
  },
]
