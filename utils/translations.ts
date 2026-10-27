export type LanguageCode = 'en' | 'ta' | 'te' | 'kn' | 'ml' | 'hi';

export interface LanguageOption {
  code: LanguageCode;
  nativeName: string;
  englishName: string;
  speechLocale: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', nativeName: 'English', englishName: 'English', speechLocale: 'en-IN' },
  { code: 'ta', nativeName: 'தமிழ்', englishName: 'Tamil', speechLocale: 'ta-IN' },
  { code: 'te', nativeName: 'తెలుగు', englishName: 'Telugu', speechLocale: 'te-IN' },
  { code: 'kn', nativeName: 'ಕನ್ನಡ', englishName: 'Kannada', speechLocale: 'kn-IN' },
  { code: 'ml', nativeName: 'മലയാളം', englishName: 'Malayalam', speechLocale: 'ml-IN' },
  { code: 'hi', nativeName: 'हिन्दी', englishName: 'Hindi', speechLocale: 'hi-IN' },
];

export interface Translations {
  appName: string;
  tagline: string;
  workerView: string;
  supervisorDesk: string;
  verifySuite: string;
  sdgGoals: string;
  activeWorker: string;
  prototypeNote: string;
  
  // Dashboard 4 main action cards
  cardRecordShiftTitle: string;
  cardRecordShiftSub: string;
  cardCheckPayTitle: string;
  cardCheckPaySub: string;
  cardHistoryTitle: string;
  cardHistorySub: string;
  cardDiscrepanciesTitle: string;
  cardDiscrepanciesSub: string;

  // Dashboard metric cards
  metricTotalShifts: string;
  metricNetHours: string;
  metricExpectedPay: string;
  metricOpenCases: string;
  metricRecordedPay: string;
  metricAfterBreaks: string;

  // Guided Logger
  guidedTitle: string;
  guidedSubtitle: string;
  switchGuided: string;
  switchClassic: string;
  stepIndicator: string; // "Step X of Y"
  nextStep: string;
  prevStep: string;
  saveShift: string;
  savingShift: string;

  // Step 1: Work & Date
  step1Title: string;
  step1Desc: string;
  selectIndustry: string;
  industryConstruction: string;
  industryHospital: string;
  shiftDate: string;
  workerName: string;

  // Step 2: Time & Break
  step2Title: string;
  step2Desc: string;
  startTime: string;
  endTime: string;
  isOvernightLabel: string;
  isOvernightHint: string;
  breakDuration: string;
  breakNone: string;
  break15m: string;
  break30m: string;
  break45m: string;
  break60m: string;

  // Step 3: Pay Agreement
  step3Title: string;
  step3Desc: string;
  wageType: string;
  wageDaily: string;
  wageHourly: string;
  agreedRateDaily: string;
  agreedRateHourly: string;
  overtimeRules: string;
  policyStandard: string;
  policyFixed: string;
  policyTier: string;

  // Step 4: Actual Payment
  step4Title: string;
  step4Desc: string;
  paymentReceivedLabel: string;
  paymentPendingCheckbox: string;
  paymentPendingNotice: string;

  // Step 5: Review & Confirm
  step5Title: string;
  step5Desc: string;
  netHoursLogged: string;
  regularPay: string;
  overtimePay: string;
  totalCalculatedPay: string;
  paymentDifference: string;
  howCalculated: string;
  howCalculatedClose: string;
  saveToRecords: string;

  // Voice Assistant
  voiceButtonStart: string;
  voiceButtonListening: string;
  voicePlaceholder: string;
  aiExtractButton: string;
  aiExtracting: string;
  aiExtractNote: string;
  speechNotSupported: string;
  speechMicBlocked: string;

  // Shift History
  historyTitle: string;
  historySubtitle: string;
  noShiftsRecorded: string;
  filterAll: string;
  filterDiscrepancies: string;
  filterResolved: string;
  flagDiscrepancy: string;
  viewDetails: string;
  deleteShift: string;

  // Status Badges
  statusWaitingPayment: string;
  statusPossibleShortfall: string;
  statusPossibleExcess: string;
  statusPaymentMatched: string;
  statusPendingReview: string;
  statusUnderReview: string;
  statusResolved: string;
  statusNeedsInfo: string;

  // Discrepancy Modal
  modalDiscrepancyTitle: string;
  modalDiscrepancySub: string;
  workerExplanationLabel: string;
  workerExplanationPlaceholder: string;
  requestAiExplanation: string;
  generatingAiExplanation: string;
  submitToSupervisor: string;
  close: string;
  cancel: string;

  // Supervisor Audit
  supervisorTitle: string;
  supervisorSubtitle: string;
  filterPendingCases: string;
  allWorkerRecords: string;
  updateStatus: string;
  supervisorNotes: string;
  supervisorResolutionSummary: string;
  markResolved: string;
  markUnderReview: string;
  requestMoreInfo: string;
}

export const TRANSLATIONS: Record<LanguageCode, Translations> = {
  en: {
    appName: 'VERITY WORK',
    tagline: 'Your work. Your record. Your worth.',
    workerView: 'Worker View',
    supervisorDesk: 'Supervisor Desk',
    verifySuite: 'Verify Core Suite',
    sdgGoals: 'SDG 8.5 & 8.8',
    activeWorker: 'Active Worker:',
    prototypeNote: 'Transparent work records, fair calculations & discrepancy resolution.',
    
    cardRecordShiftTitle: 'Record My Shift',
    cardRecordShiftSub: 'Speak or enter your work hours',
    cardCheckPayTitle: 'Check My Pay',
    cardCheckPaySub: 'See expected wage calculation',
    cardHistoryTitle: 'My Work History',
    cardHistorySub: 'All past shifts & pay slips',
    cardDiscrepanciesTitle: 'Track My Complaints',
    cardDiscrepanciesSub: 'Check supervisor review status',

    metricTotalShifts: 'Total Shifts',
    metricNetHours: 'Net Hours Logged',
    metricExpectedPay: 'Expected Pay',
    metricOpenCases: 'Open Reviews',
    metricRecordedPay: 'Received: ',
    metricAfterBreaks: 'After unpaid breaks',

    guidedTitle: 'Log Your Shift',
    guidedSubtitle: 'Step-by-step easy recording with instant wage calculation',
    switchGuided: 'Guided 5-Step Mode',
    switchClassic: 'Classic Fast Form',
    stepIndicator: 'Step',
    nextStep: 'Continue to Next Step',
    prevStep: 'Back',
    saveShift: 'Save to My Records',
    savingShift: 'Saving shift securely...',

    step1Title: 'Step 1: Where & When Did You Work?',
    step1Desc: 'Choose your work industry and date of work.',
    selectIndustry: 'Work Industry',
    industryConstruction: 'Construction Site (Daily Wage)',
    industryHospital: 'Hospital Sanitation & Cleaning',
    shiftDate: 'Shift Date',
    workerName: 'Worker Name',

    step2Title: 'Step 2: Working Hours & Breaks',
    step2Desc: 'When did you begin, end, and take your meal break?',
    startTime: 'Start Time',
    endTime: 'End Time',
    isOvernightLabel: 'Night Shift (Crosses midnight into next morning)',
    isOvernightHint: 'Tick this if you started in the evening/night and finished next day.',
    breakDuration: 'Unpaid Meal / Tea Break',
    breakNone: 'No break (0 min)',
    break15m: '15 minutes',
    break30m: '30 minutes (Standard)',
    break45m: '45 minutes',
    break60m: '60 minutes (1 hour)',

    step3Title: 'Step 3: Agreed Pay Rate',
    step3Desc: 'What wage rate did your contractor or supervisor agree to pay you?',
    wageType: 'Payment Method',
    wageDaily: 'Daily Rate (Per day)',
    wageHourly: 'Hourly Rate (Per hour)',
    agreedRateDaily: 'Agreed Daily Rate (₹)',
    agreedRateHourly: 'Agreed Hourly Rate (₹)',
    overtimeRules: 'Overtime & Shift Policy',
    policyStandard: 'Standard 8h Base + Extra Hours Paid with 1.5x Overtime',
    policyFixed: 'Fixed Daily Rate (No Overtime)',
    policyTier: 'Half Day (< 5h = 50%) / Full Day (>= 5h = 100%)',

    step4Title: 'Step 4: Actual Payment Received',
    step4Desc: 'Did you receive cash, UPI, or contractor pay for this shift?',
    paymentReceivedLabel: 'Amount Received for This Shift (₹)',
    paymentPendingCheckbox: 'I have not received payment yet (Pending / Unknown)',
    paymentPendingNotice: 'This shift will be safely recorded. When you receive payment later, you can add it to compare.',

    step5Title: 'Step 5: Review & Save Your Work Record',
    step5Desc: 'Check your hours and expected wages before adding to your personal record.',
    netHoursLogged: 'Net Worked Hours',
    regularPay: 'Regular Pay',
    overtimePay: 'Overtime Pay',
    totalCalculatedPay: 'Total Expected Pay',
    paymentDifference: 'Payment Comparison',
    howCalculated: 'How was this calculated? (Tap to view details)',
    howCalculatedClose: 'Hide calculation breakdown',
    saveToRecords: 'Confirm & Save My Shift Record',

    voiceButtonStart: 'Speak My Shift (Voice Input)',
    voiceButtonListening: 'Listening... Speak your shift details now',
    voicePlaceholder: 'Or type in your own language: "Worked today 8am to 6pm with 30 min lunch at construction site, got 700 rupees"',
    aiExtractButton: 'Auto-Fill Details from Statement',
    aiExtracting: 'Analyzing shift details...',
    aiExtractNote: 'Shift details auto-filled. Please review each field below before saving.',
    speechNotSupported: 'Speech recognition is not supported in this browser. Please use text entry.',
    speechMicBlocked: 'Microphone permission denied. Please allow microphone in browser settings or type below.',

    historyTitle: 'My Shift History & Wage Records',
    historySubtitle: 'Your personal, immutable log of hours worked, expected wages, and payment discrepancies.',
    noShiftsRecorded: 'No shifts recorded yet. Use the form above to record your first shift!',
    filterAll: 'All Shifts',
    filterDiscrepancies: 'Discrepancies Only',
    filterResolved: 'Resolved Cases',
    flagDiscrepancy: 'Explain & Report Discrepancy',
    viewDetails: 'View Details',
    deleteShift: 'Delete',

    statusWaitingPayment: 'Waiting for payment details',
    statusPossibleShortfall: 'Possible shortfall (Review needed)',
    statusPossibleExcess: 'Possible surplus (Received more)',
    statusPaymentMatched: 'Payment matched expected',
    statusPendingReview: 'Sent for supervisor review',
    statusUnderReview: 'Under supervisor review',
    statusResolved: 'Resolved & Closed',
    statusNeedsInfo: 'More information needed',

    modalDiscrepancyTitle: 'Report Possible Wage Discrepancy',
    modalDiscrepancySub: 'Your explanation will be submitted to the supervisor desk with complete transparency.',
    workerExplanationLabel: 'Your Explanation (in your own words)',
    workerExplanationPlaceholder: 'Describe why you believe there is a difference (e.g. extra hours worked, promised rate, deductions)...',
    requestAiExplanation: 'Generate Transparent Summary',
    generatingAiExplanation: 'Preparing neutral calculation summary...',
    submitToSupervisor: 'Submit to Supervisor for Review',
    close: 'Close',
    cancel: 'Cancel',

    supervisorTitle: 'Supervisor Audit & Resolution Desk',
    supervisorSubtitle: 'Review flagged shift records, inspect deterministic calculations, and provide official notes.',
    filterPendingCases: 'Pending Reviews',
    allWorkerRecords: 'All Shift Records',
    updateStatus: 'Update Resolution Status',
    supervisorNotes: 'Supervisor Explanation / Feedback',
    supervisorResolutionSummary: 'Official Resolution Summary (Visible to Worker)',
    markResolved: 'Mark as Resolved',
    markUnderReview: 'Mark as Under Review',
    requestMoreInfo: 'Request More Information',
  },

  ta: {
    appName: 'VERITY WORK',
    tagline: 'உங்கள் உழைப்பு. உங்கள் பதிவு. உங்கள் உரிமை.',
    workerView: 'தொழிலாளி பார்வை',
    supervisorDesk: 'மேற்பார்வையாளர் மேசை',
    verifySuite: 'முக்கிய சோதனையை சரிபார்க்கவும்',
    sdgGoals: 'SDG 8.5 & 8.8 நிலைத்தன்மை',
    activeWorker: 'தற்போதைய தொழிலாளி:',
    prototypeNote: 'வெளிப்படையான பணிப் பதிவுகள், நியாயமான சம்பளக் கணக்கீடு மற்றும் தீர்வு.',

    cardRecordShiftTitle: 'பணிப் பதிவு செய்',
    cardRecordShiftSub: 'குரல் அல்லது எழுத்து மூலம் பதிவு செய்',
    cardCheckPayTitle: 'சம்பளம் சரிபார்',
    cardCheckPaySub: 'கணக்கிடப்பட்ட ஊதியத்தைப் பார்',
    cardHistoryTitle: 'என் பணி வரலாறு',
    cardHistorySub: 'முந்தைய ஷிப்ட் மற்றும் சம்பள விவரங்கள்',
    cardDiscrepanciesTitle: 'புகார் நிலைமை',
    cardDiscrepanciesSub: 'மேற்பார்வையாளர் மறுஆய்வு நிலை',

    metricTotalShifts: 'மொத்த ஷிப்டுகள்',
    metricNetHours: 'வேலை செய்த மணிநேரம்',
    metricExpectedPay: 'எதிர்பார்க்கும் ஊதியம்',
    metricOpenCases: 'நிலுவையில் உள்ள மறுஆய்வு',
    metricRecordedPay: 'பெற்ற தொகை: ',
    metricAfterBreaks: 'இடைவேளை கழித்து',

    guidedTitle: 'ஷிப்ட் பதிவு செய்யுங்கள்',
    guidedSubtitle: '5 எளிமையான படிகளில் துல்லியமான ஊதியக் கணக்கீடு',
    switchGuided: '5-படி வழிகாட்டி முறை',
    switchClassic: 'விரைவுப் படிவம்',
    stepIndicator: 'படி',
    nextStep: 'அடுத்த படிக்குச் செல்',
    prevStep: 'பின்னால்',
    saveShift: 'என் பதிவேட்டில் சேமி',
    savingShift: 'பாதுகாப்பாக சேமிக்கப்படுகிறது...',

    step1Title: 'படி 1: வேலை செய்த இடம் & தேதி',
    step1Desc: 'உங்கள் வேலை வகை மற்றும் தேதியைத் தேர்ந்தெடுக்கவும்.',
    selectIndustry: 'தொழில் துறை',
    industryConstruction: 'கட்டுமானத் தளம் (தினக்கூலி)',
    industryHospital: 'மருத்துவமனை துப்புரவு & சுகாதாரம்',
    shiftDate: 'வேலை செய்த தேதி',
    workerName: 'தொழிலாளி பெயர்',

    step2Title: 'படி 2: வேலை நேரம் & இடைவேளை',
    step2Desc: 'எப்போது தொடங்கினீர்கள், எப்போது முடித்தீர்கள், உணவு இடைவேளை எவ்வளவு நேரம்?',
    startTime: 'தொடங்கிய நேரம்',
    endTime: 'முடிந்த நேரம்',
    isOvernightLabel: 'இரவு ஷிப்ட் (அடுத்த நாள் காலை வரை)',
    isOvernightHint: 'இரவில் தொடங்கி மறுநாள் காலை முடிந்தால் இதைத் தேர்ந்தெடுக்கவும்.',
    breakDuration: 'உணவு / தேநீர் இடைவேளை',
    breakNone: 'இடைவேளை இல்லை (0 நிமிடம்)',
    break15m: '15 நிமிடங்கள்',
    break30m: '30 நிமிடங்கள் (வழக்கமானது)',
    break45m: '45 நிமிடங்கள்',
    break60m: '60 நிமிடங்கள் (1 மணிநேரம்)',

    step3Title: 'படி 3: ஒப்புக்கொள்ளப்பட்ட கூலி',
    step3Desc: 'மேஸ்திரி அல்லது மேற்பார்வையாளர் நிர்ணயித்த கூலி எவ்வளவு?',
    wageType: 'சம்பள முறை',
    wageDaily: 'தினக்கூலி (ஒரு நாளுக்கு)',
    wageHourly: 'மணிநேரக் கூலி (ஒரு மணிநேரத்திற்கு)',
    agreedRateDaily: 'ஒப்புக்கொண்ட தினக்கூலி (₹)',
    agreedRateHourly: 'ஒப்புக்கொண்ட மணிநேரக் கூலி (₹)',
    overtimeRules: 'கூடுதல் நேர (OT) விதிகள்',
    policyStandard: '8 மணிநேர அடிப்படை + கூடுதல் நேரம் 1.5x OT கூலி',
    policyFixed: 'நிலையான தினக்கூலி (கூடுதல் நேரக் கூலி இல்லை)',
    policyTier: 'அரை நாள் (< 5 மணி = 50%) / முழு நாள் (>= 5 மணி = 100%)',

    step4Title: 'படி 4: கையில் கிடைத்த தொகை',
    step4Desc: 'இந்த வேலைக்கு பணம் அல்லது UPI மூலம் எவ்வளவு தொகை கிடைத்தது?',
    paymentReceivedLabel: 'பெற்றுக் கொண்ட தொகை (₹)',
    paymentPendingCheckbox: 'இன்னும் பணம் வரவில்லை (நிலுவையில் உள்ளது)',
    paymentPendingNotice: 'இந்த ஷிப்ட் பாதுகாப்பாகப் பதிவு செய்யப்படும். பணம் கிடைத்ததும் சேர்த்துக் கொள்ளலாம்.',

    step5Title: 'படி 5: சரிபார்த்து சேமிக்கவும்',
    step5Desc: 'உங்கள் உழைப்பு நேரம் மற்றும் கணக்கிடப்பட்ட ஊதியத்தை சரிபார்த்து சேமிக்கவும்.',
    netHoursLogged: 'உண்மையான வேலை நேரம்',
    regularPay: 'வழக்கமான கூலி',
    overtimePay: 'கூடுதல் நேரக் கூலி',
    totalCalculatedPay: 'மொத்த எதிர்பார்க்கும் கூலி',
    paymentDifference: 'தொகை ஒப்பீடு',
    howCalculated: 'இது எவ்வாறு கணக்கிடப்பட்டது? (விவரங்களைக் காண கிளிக் செய்யவும்)',
    howCalculatedClose: 'கணக்கீட்டு விவரங்களை மறைக்கவும்',
    saveToRecords: 'சரிபார்த்து என் பதிவேட்டில் சேமிக்கவும்',

    voiceButtonStart: 'குரல் மூலம் பதிவு செய் (பேசவும்)',
    voiceButtonListening: 'கேட்கிறது... உங்கள் வேலை விவரங்களை இப்போது பேசுங்கள்',
    voicePlaceholder: 'அல்லது தமிழில் தட்டச்சு செய்யுங்கள்: "இன்று காலை 8 மணி முதல் மாலை 6 வரை கட்டுமானத்தில் வேலை பார்த்தேன் 30 நிமிடம் சாப்பாடு 700 ரூபாய் கொடுத்தார்கள்"',
    aiExtractButton: 'தானாகப் பூர்த்தி செய்',
    aiExtracting: 'விவரங்கள் பிரித்தெடுக்கப்படுகின்றன...',
    aiExtractNote: 'விவரங்கள் பூர்த்தி செய்யப்பட்டுள்ளன. சேமிக்கும் முன் சரிபார்க்கவும்.',
    speechNotSupported: 'இந்த உலாவியில் குரல் உள்ளீடு ஆதரிக்கப்படவில்லை. தயவுசெய்து தட்டச்சு செய்யவும்.',
    speechMicBlocked: 'மைக் அனுமதி மறுக்கப்பட்டுள்ளது. அமைப்புகளில் மைக்கை அனுமதிக்கவும்.',

    historyTitle: 'என் பணி வரலாறு & ஊதியப் பதிவுகள்',
    historySubtitle: 'நீங்கள் வேலை செய்த மணிநேரங்கள், எதிர்பார்க்கும் ஊதியம் மற்றும் பற்றாக்குறை விவரங்கள்.',
    noShiftsRecorded: 'இதுவரை பதிவுகள் இல்லை. மேலே உள்ள படிவத்தைப் பயன்படுத்தி முதல் ஷிப்டைப் பதிவு செய்யுங்கள்!',
    filterAll: 'அனைத்து ஷிப்டுகள்',
    filterDiscrepancies: 'வேறுபாடு உள்ளவை மட்டும்',
    filterResolved: 'தீர்க்கப்பட்டவை',
    flagDiscrepancy: 'வேறுபாட்டைப் புகாரளிக்கவும்',
    viewDetails: 'விவரங்களைப் பார்',
    deleteShift: 'நீக்கு',

    statusWaitingPayment: 'பணம் பற்றிய விவரத்திற்கு காத்திருக்கிறது',
    statusPossibleShortfall: 'சாத்தியமான பற்றாக்குறை (சரிபார்க்கவும்)',
    statusPossibleExcess: 'கூடுதல் தொகை கிடைத்தது',
    statusPaymentMatched: 'சம்பளம் சரியாகப் பொருந்தியது',
    statusPendingReview: 'மேற்பார்வையாளர் ஆய்வுக்கு அனுப்பப்பட்டது',
    statusUnderReview: 'மேற்பார்வையாளர் மறுஆய்வில் உள்ளது',
    statusResolved: 'தீர்க்கப்பட்டு முடிக்கப்பட்டது',
    statusNeedsInfo: 'கூடுதல் தகவல் தேவைப்படுகிறது',

    modalDiscrepancyTitle: 'ஊதிய வேறுபாட்டைப் புகாரளிக்கவும்',
    modalDiscrepancySub: 'உங்கள் விளக்கம் வெளிப்படைத்தன்மையுடன் மேற்பார்வையாளருக்கு அனுப்பப்படும்.',
    workerExplanationLabel: 'உங்கள் விளக்கம் (உங்கள் வார்த்தைகளில்)',
    workerExplanationPlaceholder: 'ஏன் பற்றாக்குறை அல்லது வேறுபாடு உள்ளது என்று விளக்குங்கள் (எ.கா: கூடுதல் மணிநேரம், பிடித்தம்)...',
    requestAiExplanation: 'தெளிவான சுருக்கத்தை உருவாக்கு',
    generatingAiExplanation: 'சுருக்கம் தயாரிக்கப்படுகிறது...',
    submitToSupervisor: 'மேற்பார்வையாளர் ஆய்வுக்கு அனுப்பு',
    close: 'மூடு',
    cancel: 'ரத்து செய்',

    supervisorTitle: 'மேற்பார்வையாளர் தணிக்கை மேசை',
    supervisorSubtitle: 'புகாரளிக்கப்பட்ட பதிவுகளை ஆய்வு செய்து உத்தியோகபூர்வ குறிப்புகளை வழங்கவும்.',
    filterPendingCases: 'நிலுவையில் உள்ள மறுஆய்வுகள்',
    allWorkerRecords: 'அனைத்து தொழிலாளர் பதிவுகள்',
    updateStatus: 'தீர்வு நிலையை மாற்று',
    supervisorNotes: 'மேற்பார்வையாளர் கருத்து / குறிப்பு',
    supervisorResolutionSummary: 'உத்தியோகபூர்வ தீர்வு சுருக்கம் (தொழிலாளிக்குத் தெரியும்)',
    markResolved: 'தீர்க்கப்பட்டதாகக் குறி',
    markUnderReview: 'ஆய்வில் உள்ளதாகக் குறி',
    requestMoreInfo: 'கூடுதல் தகவல் கேள்',
  },

  te: {
    appName: 'VERITY WORK',
    tagline: 'మీ శ్రమ. మీ రికార్డు. మీ గౌరవం.',
    workerView: 'కార్మికుల వీక్షణ',
    supervisorDesk: 'సూపర్‌వైజర్ డెస్క్',
    verifySuite: 'కోర్ సూట్‌ను ధృవీకరించండి',
    sdgGoals: 'SDG 8.5 & 8.8 లక్ష్యాలు',
    activeWorker: 'ప్రస్తుత కార్మికుడు:',
    prototypeNote: 'పారదర్శక పని రికార్డులు, సరైన వేతన గణన మరియు సమస్యల పరిష్కారం.',

    cardRecordShiftTitle: 'షిఫ్ట్ నమోదు చేయండి',
    cardRecordShiftSub: 'వాయిస్ లేదా టెక్స్ట్ ద్వారా నమోదు చేయండి',
    cardCheckPayTitle: 'జీతం తనిఖీ చేయండి',
    cardCheckPaySub: 'రావాల్సిన వేతనాన్ని లెక్కించండి',
    cardHistoryTitle: 'నా పని చరిత్ర',
    cardHistorySub: 'మునుపటి షిఫ్టులు & పే స్లిప్‌లు',
    cardDiscrepanciesTitle: 'ఫిర్యాదు స్థితి',
    cardDiscrepanciesSub: 'సూపర్‌వైజర్ సమీక్ష స్థితిని చూడండి',

    metricTotalShifts: 'మొత్తం షిఫ్టులు',
    metricNetHours: 'పని గంటలు',
    metricExpectedPay: 'రావాల్సిన వేతనం',
    metricOpenCases: 'సమీక్షలో ఉన్నవి',
    metricRecordedPay: 'అందిన మొత్తం: ',
    metricAfterBreaks: 'విరామం మినహాయించి',

    guidedTitle: 'షిఫ్ట్‌ను నమోదు చేయండి',
    guidedSubtitle: '5 సులభమైన దశల్లో ఖచ్చితమైన వేతన గణన',
    switchGuided: '5-దశల మార్గదర్శక విధానం',
    switchClassic: 'ఫాస్ట్ ఫారమ్',
    stepIndicator: 'దశ',
    nextStep: 'తదుపరి దశకు వెళ్లండి',
    prevStep: 'వెనుకకు',
    saveShift: 'నా రికార్డుల్లో భద్రపరచండి',
    savingShift: 'భద్రపరుస్తోంది...',

    step1Title: 'దశ 1: పని చేసిన స్థలం & తేదీ',
    step1Desc: 'పని రకం మరియు తేదీని ఎంచుకోండి.',
    selectIndustry: 'పని విభాగం',
    industryConstruction: 'భవన నిర్మాణం (రోజువారీ కూలీ)',
    industryHospital: 'ఆసుపత్రి పారిశుధ్యం & శుభ్రత',
    shiftDate: 'పని తేదీ',
    workerName: 'కార్మికుడి పేరు',

    step2Title: 'దశ 2: పని వేళలు & విరామం',
    step2Desc: 'ఎప్పుడు ప్రారంభించారు, ఎప్పుడు ముగించారు, భోజన విరామం ఎంత?',
    startTime: 'ప్రారంభ సమయం',
    endTime: 'ముగింపు సమయం',
    isOvernightLabel: 'రాత్రి షిఫ్ట్ (మరుసటి రోజు ఉదయం వరకు)',
    isOvernightHint: 'రాత్రి ప్రారంభించి మరుసటి రోజు ముగిస్తే దీన్ని ఎంచుకోండి.',
    breakDuration: 'భోజనం / టీ విరామం',
    breakNone: 'విరామం లేదు (0 నిమిషాలు)',
    break15m: '15 నిమిషాలు',
    break30m: '30 నిమిషాలు (సాధారణం)',
    break45m: '45 నిమిషాలు',
    break60m: '60 నిమిషాలు (1 గంట)',

    step3Title: 'దశ 3: అంగీకరించిన కూలీ రేటు',
    step3Desc: 'సూపర్‌వైజర్ లేదా కాంట్రాక్టర్ నిర్ణయించిన కూలీ ఎంత?',
    wageType: 'చెల్లింపు రకం',
    wageDaily: 'రోజువారీ కూలీ (రోజుకు)',
    wageHourly: 'గంటల కూలీ (గంటకు)',
    agreedRateDaily: 'రోజు కూలీ రేటు (₹)',
    agreedRateHourly: 'గంట కూలీ రేటు (₹)',
    overtimeRules: 'అదనపు సమయం (OT) నిబంధనలు',
    policyStandard: '8 గంటల ప్రాథమిక పని + అదనపు సమయానికి 1.5 రెట్ల కూలీ',
    policyFixed: 'స్థిరమైన రోజు కూలీ (OT లేదు)',
    policyTier: 'హాఫ్ డే (< 5 గంటలు = 50%) / ఫుల్ డే (>= 5 గంటలు = 100%)',

    step4Title: 'దశ 4: చేతికి అందిన సొమ్ము',
    step4Desc: 'ఈ షిఫ్ట్ కోసం నగదు లేదా UPI ద్వారా ఎంత అందింది?',
    paymentReceivedLabel: 'అందిన మొత్తం (₹)',
    paymentPendingCheckbox: 'ఇంకా డబ్బు అందలేదు (పెండింగ్‌లో ఉంది)',
    paymentPendingNotice: 'ఈ షిఫ్ట్ భద్రపరచబడుతుంది. డబ్బులు అందినప్పుడు మీరు నమోదు చేయవచ్చు.',

    step5Title: 'దశ 5: తనిఖీ చేసి భద్రపరచండి',
    step5Desc: 'పని గంటలు మరియు రావలసిన వేతనాన్ని సరిచూసి రికార్డులో చేర్చండి.',
    netHoursLogged: 'పని చేసిన నికర గంటలు',
    regularPay: 'సాధారణ వేతనం',
    overtimePay: 'అదనపు వేతనం (OT)',
    totalCalculatedPay: 'మొత్తం రావలసిన వేతనం',
    paymentDifference: 'చెల్లింపు తేడా',
    howCalculated: 'ఇది ఎలా లెక్కించబడింది? (వివరాలు చూడండి)',
    howCalculatedClose: 'వివరాలు దాచండి',
    saveToRecords: 'నిర్ధారించి నా రికార్డుల్లో భద్రపరచండి',

    voiceButtonStart: 'వాయిస్ ద్వారా నమోదు చేయండి (మాట్లాడండి)',
    voiceButtonListening: 'వింటోంది... మీ పని వివరాలను మాట్లాడండి',
    voicePlaceholder: 'లేదా తెలుగులో టైప్ చేయండి: "ఈ రోజు ఉదయం 8 నుండి సాయంత్రం 6 వరకు కన్స్ట్రక్షన్ పని చేశాను 30 నిమిషాల భోజనం 700 రూపాయలు ఇచ్చారు"',
    aiExtractButton: 'వివరాలను స్వయంచాలకంగా పూరించండి',
    aiExtracting: 'వివరాలు పరిశీలిస్తోంది...',
    aiExtractNote: 'వివరాలు నమోదు చేయబడ్డాయి. భద్రపరిచే ముందు పరిశీలించండి.',
    speechNotSupported: 'ఈ బ్రౌజర్‌లో వాయిస్ రికగ్నిషన్ సపోర్ట్ లేదు. దయచేసి టైప్ చేయండి.',
    speechMicBlocked: 'మైక్రోఫోన్ అనుమతి నిరాకరించబడింది. బ్రౌజర్ సెట్టింగ్స్‌లో అనుమతించండి.',

    historyTitle: 'నా పని రికార్డులు & చరిత్ర',
    historySubtitle: 'మీరు పనిచేసిన గంటలు, రావలసిన జీతం మరియు వ్యత్యాసాల రికార్డు.',
    noShiftsRecorded: 'ఇంకా ఎటువంటి షిఫ్టులు నమోదు కాలేదు.',
    filterAll: 'అన్ని షిఫ్టులు',
    filterDiscrepancies: 'తేడాలు ఉన్నవి మాత్రమే',
    filterResolved: 'పరిష్కరించబడినవి',
    flagDiscrepancy: 'వ్యత్యాసాన్ని నివేదించండి',
    viewDetails: 'వివరాలు చూడండి',
    deleteShift: 'తొలగించు',

    statusWaitingPayment: 'చెల్లింపు వివరాల కోసం వేచి ఉంది',
    statusPossibleShortfall: 'తక్కువ చెల్లింపు ఉండే అవకాశం (సమీక్షించండి)',
    statusPossibleExcess: 'అదనపు సొమ్ము అందింది',
    statusPaymentMatched: 'చెల్లింపు సరిపోయింది',
    statusPendingReview: 'సూపర్‌వైజర్ పరిశీలనకు పంపబడింది',
    statusUnderReview: 'సూపర్‌వైజర్ పరిశీలనలో ఉంది',
    statusResolved: 'పరిష్కరించబడింది',
    statusNeedsInfo: 'మరిన్ని వివరాలు అవసరం',

    modalDiscrepancyTitle: 'వేతన వ్యత్యాసాన్ని నివేదించండి',
    modalDiscrepancySub: 'మీ వివరణ పారదర్శకంగా సూపర్‌వైజర్‌కు పంపబడుతుంది.',
    workerExplanationLabel: 'మీ వివరణ (మీ మాటల్లో)',
    workerExplanationPlaceholder: 'వ్యత్యాసానికి కారణాన్ని వివరించండి (ఉదా: అదనపు గంటలు, కోతలు)...',
    requestAiExplanation: 'స్పష్టమైన సారాంశాన్ని రూపొందించండి',
    generatingAiExplanation: 'సారాంశం రూపొందుతోంది...',
    submitToSupervisor: 'సమీక్ష కోసం సమర్పించండి',
    close: 'మూసివేయి',
    cancel: 'రద్దు చేయి',

    supervisorTitle: 'సూపర్‌వైజర్ ఆడిట్ & పరిష్కార డెస్క్',
    supervisorSubtitle: 'నివేదించబడిన రికార్డులను సమీక్షించి అధికారిక సూచనలు ఇవ్వండి.',
    filterPendingCases: 'పెండింగ్ సమీక్షలు',
    allWorkerRecords: 'అన్ని రికార్డులు',
    updateStatus: 'పరిష్కార స్థితిని మార్చండి',
    supervisorNotes: 'సూపర్‌వైజర్ గమనికలు',
    supervisorResolutionSummary: 'అధికారిక పరిష్కార సారాంశం (కార్మికుడికి కనిపిస్తుంది)',
    markResolved: 'పరిష్కరించినట్లు గుర్తించు',
    markUnderReview: 'పరిశీలనలో ఉన్నట్లు గుర్తించు',
    requestMoreInfo: 'మరిన్ని వివరాలు అడగండి',
  },

  kn: {
    appName: 'VERITY WORK',
    tagline: 'ನಿಮ್ಮ ಶ್ರಮ. ನಿಮ್ಮ ದಾಖಲೆ. ನಿಮ್ಮ ಗೌರವ.',
    workerView: 'ಕಾರ್ಮಿಕರ ನೋಟ',
    supervisorDesk: 'ಮೇಲ್ವಿಚಾರಕರ ಡೆಸ್ಕ್',
    verifySuite: 'ಪರೀಕ್ಷಾ ಸೂಟ್ ಪರಿಶೀಲಿಸಿ',
    sdgGoals: 'SDG 8.5 & 8.8 ಗುರಿಗಳು',
    activeWorker: 'ಪ್ರಸ್ತುತ ಕಾರ್ಮಿಕ:',
    prototypeNote: 'ಪಾರದರ್ಶಕ ಕೆಲಸದ ದಾಖಲೆಗಳು, ನ್ಯಾಯಯುತ ವೇತನ ಲೆಕ್ಕಾಚಾರ ಮತ್ತು ಪರಿಹಾರ.',

    cardRecordShiftTitle: 'ಶಿಫ್ಟ್ ದಾಖಲಿಸಿ',
    cardRecordShiftSub: 'ಧ್ವನಿ ಅಥವಾ ಟೆಕ್ಸ್ಟ್ ಮೂಲಕ ನಮೂದಿಸಿ',
    cardCheckPayTitle: 'ವೇತನ ಪರಿಶೀಲಿಸಿ',
    cardCheckPaySub: 'ಬರಬೇಕಾದ ವೇತನದ ಲೆಕ್ಕ ನೋಡಿ',
    cardHistoryTitle: 'ನನ್ನ ಕೆಲಸದ ಇತಿಹಾಸ',
    cardHistorySub: 'ಹಿಂದಿನ ಶಿಫ್ಟ್‌ಗಳು ಮತ್ತು ವೇತನ ವಿವರ',
    cardDiscrepanciesTitle: 'ದೂರಿನ ಸ್ಥಿತಿ',
    cardDiscrepanciesSub: 'ಮೇಲ್ವಿಚಾರಕರ ಪರಿಶೀಲನಾ ಸ್ಥಿತಿ',

    metricTotalShifts: 'ಒಟ್ಟು ಶಿಫ್ಟ್‌ಗಳು',
    metricNetHours: 'ಕೆಲಸದ ಒಟ್ಟು ಗಂಟೆಗಳು',
    metricExpectedPay: 'ಬರಬೇಕಾದ ವೇತನ',
    metricOpenCases: 'ಬಾಕಿ ಪರಿಶೀಲನೆಗಳು',
    metricRecordedPay: 'ಪಡೆದ ಮೊತ್ತ: ',
    metricAfterBreaks: 'ವಿರಾಮ ಕಳೆದ ನಂತರ',

    guidedTitle: 'ನಿಮ್ಮ ಶಿಫ್ಟ್ ದಾಖಲಿಸಿ',
    guidedSubtitle: '5 ಸುಲಭ ಹಂತಗಳಲ್ಲಿ ನಿಖರ ವೇತನ ಲೆಕ್ಕಾಚಾರ',
    switchGuided: '5-ಹಂತದ ಮಾರ್ಗದರ್ಶಿ ಕ್ರಮ',
    switchClassic: 'ಫಾಸ್ಟ್ ಫಾರ್ಮ್',
    stepIndicator: 'ಹಂತ',
    nextStep: 'ಮುಂದಿನ ಹಂತಕ್ಕೆ ಮುಂದುವರಿಯಿರಿ',
    prevStep: 'ಹಿಂದಕ್ಕೆ',
    saveShift: 'ನನ್ನ ದಾಖಲೆಯಲ್ಲಿ ಉಳಿಸಿ',
    savingShift: 'ಉಳಿಸಲಾಗುತ್ತಿದೆ...',

    step1Title: 'ಹಂತ 1: ಕೆಲಸ ಮಾಡಿದ ಸ್ಥಳ & ದಿನಾಂಕ',
    step1Desc: 'ನಿಮ್ಮ ಕೆಲಸದ ವಿಧ ಮತ್ತು ದಿನಾಂಕ ಆಯ್ಕೆಮಾಡಿ.',
    selectIndustry: 'ಕೆಲಸದ ಕ್ಷೇತ್ರ',
    industryConstruction: 'ಕಟ್ಟಡ ನಿರ್ಮಾಣ (ದಿನಗೂಲಿ)',
    industryHospital: 'ಆಸ್ಪತ್ರೆ ಸ್ವಚ್ಛತೆ & ನೈರ್ಮಲ್ಯ',
    shiftDate: 'ಕೆಲಸ ಮಾಡಿದ ದಿನಾಂಕ',
    workerName: 'ಕಾರ್ಮಿಕನ ಹೆಸರು',

    step2Title: 'ಹಂತ 2: ಕೆಲಸದ ಸಮಯ & ವಿರಾಮ',
    step2Desc: 'ಯಾವಾಗ ಪ್ರಾರಂಭಿಸಿದಿರಿ, ಯಾವಾಗ ಮುಗಿಸಿದಿರಿ, ಊಟದ ವಿರಾಮ ಎಷ್ಟು?',
    startTime: 'ಪ್ರಾರಂಭದ ಸಮಯ',
    endTime: 'ಮುಕ್ತಾಯದ ಸಮಯ',
    isOvernightLabel: 'ರಾತ್ರಿ ಶಿಫ್ಟ್ (ಮರುದಿನ ಬೆಳಗ್ಗಿನವರೆಗೆ)',
    isOvernightHint: 'ರಾತ್ರಿ ಕೆಲಸ ಪ್ರಾರಂಭಿಸಿ ಮರುದಿನ ಬೆಳಗ್ಗೆ ಮುಗಿಸಿದರೆ ಇದನ್ನು ಗುರುತು ಮಾಡಿ.',
    breakDuration: 'ಊಟ / ಚಹಾ ವಿರಾಮ',
    breakNone: 'ವಿರಾಮವಿಲ್ಲ (0 ನಿಮಿಷ)',
    break15m: '15 ನಿಮಿಷಗಳು',
    break30m: '30 ನಿಮಿಷಗಳು (ಸಾಮಾನ್ಯ)',
    break45m: '45 ನಿಮಿಷಗಳು',
    break60m: '60 ನಿಮಿಷಗಳು (1 ಗಂಟೆ)',

    step3Title: 'ಹಂತ 3: ಒಪ್ಪಿಕೊಂಡ ಕೂಲಿ ದರ',
    step3Desc: 'ಮೇಲ್ವಿಚಾರಕ ಅಥವಾ ಗುತ್ತಿಗೆದಾರರು ನಿಗದಿಪಡಿಸಿದ ಕೂಲಿ ಎಷ್ಟು?',
    wageType: 'ವೇತನ ಪಾವತಿ ವಿಧಾನ',
    wageDaily: 'ದಿನಗೂಲಿ (ದಿನಕ್ಕೆ)',
    wageHourly: 'ಗಂಟೆಯ ಕೂಲಿ (ಗಂಟೆಗೆ)',
    agreedRateDaily: 'ಒಪ್ಪಿಕೊಂಡ ದಿನಗೂಲಿ (₹)',
    agreedRateHourly: 'ಒಪ್ಪಿಕೊಂಡ ಗಂಟೆ ಕೂಲಿ (₹)',
    overtimeRules: 'ಹೆಚ್ಚುವರಿ ಕೆಲಸ (OT) ನಿಯಮಗಳು',
    policyStandard: '8 ಗಂಟೆಗಳ ಮೂಲ + ಹೆಚ್ಚುವರಿ ಸಮಯಕ್ಕೆ 1.5 ಪಟ್ಟು ವೇತನ',
    policyFixed: 'ಸ್ಥಿರ ದಿನಗೂಲಿ (OT ಇಲ್ಲ)',
    policyTier: 'ಅರ್ಧ ದಿನ (< 5 ಗಂಟೆ = 50%) / ಪೂರ್ಣ ದಿನ (>= 5 ಗಂಟೆ = 100%)',

    step4Title: 'ಹಂತ 4: ಕೈಗೆ ಸಿಕ್ಕ ಹಣ',
    step4Desc: 'ಈ ಕೆಲಸಕ್ಕೆ ನಗದು ಅಥವಾ UPI ಮೂಲಕ ಎಷ್ಟು ಹಣ ಸಿಕ್ಕಿತು?',
    paymentReceivedLabel: 'ಪಡೆದ ಮೊತ್ತ (₹)',
    paymentPendingCheckbox: 'ಇನ್ನೂ ಹಣ ಸಿಕ್ಕಿಲ್ಲ (ಬಾಕಿ ಇದೆ)',
    paymentPendingNotice: 'ಈ ಶಿಫ್ಟ್ ದಾಖಲಾಗಲಿದೆ. ಹಣ ಬಂದಾಗ ನೀವು ನಮೂದಿಸಬಹುದು.',

    step5Title: 'ಹಂತ 5: ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಉಳಿಸಿ',
    step5Desc: 'ಕೆಲಸದ ಗಂಟೆಗಳು ಮತ್ತು ನಿರೀಕ್ಷಿತ ವೇತನವನ್ನು ಪರಿಶೀಲಿಸಿ ಉಳಿಸಿ.',
    netHoursLogged: 'ಕೆಲಸ ಮಾಡಿದ ನಿವ್ವಳ ಗಂಟೆಗಳು',
    regularPay: 'ನಿಯಮಿತ ಕೂಲಿ',
    overtimePay: 'ಹೆಚ್ಚುವರಿ ಕೆಲಸದ ಕೂಲಿ (OT)',
    totalCalculatedPay: 'ಒಟ್ಟು ಬರಬೇಕಾದ ವೇತನ',
    paymentDifference: 'ಹಣದ ವ್ಯತ್ಯಾಸ',
    howCalculated: 'ಇದನ್ನು ಹೇಗೆ ಲೆಕ್ಕ ಹಾಕಲಾಯಿತು? (ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಿ)',
    howCalculatedClose: 'ವಿವರಗಳನ್ನು ಮರೆಮಾಡಿ',
    saveToRecords: 'ಖಚಿತಪಡಿಸಿ ದಾಖಲೆಯಲ್ಲಿ ಉಳಿಸಿ',

    voiceButtonStart: 'ಧ್ವನಿ ಮೂಲಕ ನಮೂದಿಸಿ (ಮಾತನಾಡಿ)',
    voiceButtonListening: 'ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದೆ... ನಿಮ್ಮ ಕೆಲಸದ ವಿವರಗಳನ್ನು ಮಾತನಾಡಿ',
    voicePlaceholder: 'ಅಥವಾ ಕನ್ನಡದಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ: "ಇಂದು ಬೆಳಗ್ಗೆ 8 ರಿಂದ ಸಂಜೆ 6 ರವರೆಗೆ ಕನ್‌ಸ್ಟ್ರಕ್ಷನ್ ಕೆಲಸ ಮಾಡಿದೆ ಅರ್ಧ ಗಂಟೆ ಊಟ 700 ರೂಪಾಯಿ ಕೊಟ್ಟರು"',
    aiExtractButton: 'ವಿವರಗಳನ್ನು ಸ್ವಯಂ ಭರ್ತಿ ಮಾಡಿ',
    aiExtracting: 'ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...',
    aiExtractNote: 'ವಿವರಗಳು ಭರ್ತಿಯಾಗಿವೆ. ಉಳಿಸುವ ಮೊದಲು ಪರಿಶೀಲಿಸಿ.',
    speechNotSupported: 'ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಇನ್‌ಪುಟ್ ಬೆಂಬಲಿಸುವುದಿಲ್ಲ. ದಯವಿಟ್ಟು ಟೈಪ್ ಮಾಡಿ.',
    speechMicBlocked: 'ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ. ಬ್ರೌಸರ್ ಸೆಟ್ಟಿಂಗ್ಸ್‌ನಲ್ಲಿ ಸಕ್ರಿಯಗೊಳಿಸಿ.',

    historyTitle: 'ನನ್ನ ಕೆಲಸದ ಇತಿಹಾಸ & ವೇತನ ದಾಖಲೆಗಳು',
    historySubtitle: 'ನೀವು ಕೆಲಸ ಮಾಡಿದ ಗಂಟೆಗಳು ಮತ್ತು ಬರಬೇಕಾದ ವೇತನದ ದಾಖಲೆ.',
    noShiftsRecorded: 'ಯಾವುದೇ ಶಿಫ್ಟ್‌ಗಳು ದಾಖಲಾಗಿಲ್ಲ.',
    filterAll: 'ಎಲ್ಲಾ ಶಿಫ್ಟ್‌ಗಳು',
    filterDiscrepancies: 'ವ್ಯತ್ಯಾಸವಿರುವವು ಮಾತ್ರ',
    filterResolved: 'ಪರಿಹರಿಸಲಾದವು',
    flagDiscrepancy: 'ವ್ಯತ್ಯಾಸವನ್ನು ವರದಿ ಮಾಡಿ',
    viewDetails: 'ವಿವರಗಳನ್ನು ನೋಡಿ',
    deleteShift: 'ಅಳಿಸಿ',

    statusWaitingPayment: 'ಪಾವತಿ ವಿವರಗಳಿಗಾಗಿ ಕಾಯಲಾಗುತ್ತಿದೆ',
    statusPossibleShortfall: 'ಕಡಿಮೆ ಪಾವತಿಯ ಸಾಧ್ಯತೆ (ಪರಿಶೀಲಿಸಿ)',
    statusPossibleExcess: 'ಹೆಚ್ಚುವರಿ ಹಣ ಬಂದಿದೆ',
    statusPaymentMatched: 'ಪಾವತಿ ಸರಿಯಾಗಿದೆ',
    statusPendingReview: 'ಮೇಲ್ವಿಚಾರಕರ ಪರಿಶೀಲನೆಗೆ ಕಳುಹಿಸಲಾಗಿದೆ',
    statusUnderReview: 'ಮೇಲ್ವಿಚಾರಕರ ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ',
    statusResolved: 'ಪರಿಹರಿಸಲಾಗಿದೆ',
    statusNeedsInfo: 'ಹೆಚ್ಚಿನ ಮಾಹಿತಿ ಅಗತ್ಯವಿದೆ',

    modalDiscrepancyTitle: 'ವೇತನ ವ್ಯತ್ಯಾಸವನ್ನು ವರದಿ ಮಾಡಿ',
    modalDiscrepancySub: 'ನಿಮ್ಮ ವಿವರಣೆಯನ್ನು ಪಾರದರ್ಶಕವಾಗಿ ಮೇಲ್ವಿಚಾರಕರಿಗೆ ಕಳುಹಿಸಲಾಗುತ್ತದೆ.',
    workerExplanationLabel: 'ನಿಮ್ಮ ವಿವರಣೆ (ನಿಮ್ಮ ಮಾತುಗಳಲ್ಲಿ)',
    workerExplanationPlaceholder: 'ವ್ಯತ್ಯಾಸಕ್ಕೆ ಕಾರಣವನ್ನು ವಿವರಿಸಿ (ಉದಾ: ಹೆಚ್ಚುವರಿ ಗಂಟೆಗಳು, ಕಡಿತ)...',
    requestAiExplanation: 'ಸ್ಪಷ್ಟ ಸಾರಾಂಶ ತಯಾರಿಸಿ',
    generatingAiExplanation: 'ಸಾರಾಂಶ ಸಿದ್ಧವಾಗುತ್ತಿದೆ...',
    submitToSupervisor: 'ಪರಿಶೀಲನೆಗಾಗಿ ಸಲ್ಲಿಸಿ',
    close: 'ಮುಚ್ಚಿ',
    cancel: 'ರದ್ದುಮಾಡಿ',

    supervisorTitle: 'ಮೇಲ್ವಿಚಾರಕರ ಲೆಕ್ಕ ಪರಿಶೋಧನಾ ಡೆಸ್ಕ್',
    supervisorSubtitle: 'ದಾಖಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಅಧಿಕೃತ ಟಿಪ್ಪಣಿಗಳನ್ನು ನೀಡಿ.',
    filterPendingCases: 'ಬಾಕಿ ಪರಿಶೀಲನೆಗಳು',
    allWorkerRecords: 'ಎಲ್ಲಾ ಕಾರ್ಮಿಕ ದಾಖಲೆಗಳು',
    updateStatus: 'ಸ್ಥಿತಿಯನ್ನು ನವೀಕರಿಸಿ',
    supervisorNotes: 'ಮೇಲ್ವಿಚಾರಕರ ಟಿಪ್ಪಣಿಗಳು',
    supervisorResolutionSummary: 'ಅಧಿಕೃತ ಪರಿಹಾರ ಸಾರಾಂಶ (ಕಾರ್ಮಿಕರಿಗೆ ಕಾಣಿಸುತ್ತದೆ)',
    markResolved: 'ಪರಿಹರಿಸಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಿ',
    markUnderReview: 'ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ ಎಂದು ಗುರುತಿಸಿ',
    requestMoreInfo: 'ಹೆಚ್ಚಿನ ಮಾಹಿತಿ ಕೇಳಿ',
  },

  ml: {
    appName: 'VERITY WORK',
    tagline: 'നിങ്ങളുടെ അധ്വാനം. നിങ്ങളുടെ രേഖ. നിങ്ങളുടെ അന്തസ്സ്.',
    workerView: 'തൊഴിലാളി വീക്ഷണം',
    supervisorDesk: 'സൂപ്പർവൈസർ ഡെസ്ക്',
    verifySuite: 'ടെസ്റ്റ് സ്യൂട്ട് പരിശോധിക്കുക',
    sdgGoals: 'SDG 8.5 & 8.8 ലക്ഷ്യങ്ങൾ',
    activeWorker: 'നിലവിലെ തൊഴിലാളി:',
    prototypeNote: 'സുതാര്യമായ തൊഴിൽ രേഖകൾ, നീതിപൂർവ്വമായ കൂലി കണക്കുകൂട്ടൽ, പരിഹാരം.',

    cardRecordShiftTitle: 'ഷിഫ്റ്റ് രേഖപ്പെടുത്തുക',
    cardRecordShiftSub: 'ശബ്ദം വഴിയോ എഴുത്തോ രേഖപ്പെടുത്തുക',
    cardCheckPayTitle: 'കൂലി പരിശോധിക്കുക',
    cardCheckPaySub: 'ലഭിക്കേണ്ട കൂലി കണക്കുകൂട്ടുക',
    cardHistoryTitle: 'എന്റെ തൊഴിൽ ചരിത്രം',
    cardHistorySub: 'മുൻകാല ഷിഫ്റ്റുകളും കൂലി വിവരങ്ങളും',
    cardDiscrepanciesTitle: 'പരാതി നില',
    cardDiscrepanciesSub: 'സൂപ്പർവൈസർ പരിശോധനാ നില അറിയുക',

    metricTotalShifts: 'ആകെ ഷിഫ്റ്റുകൾ',
    metricNetHours: 'ജോലി ചെയ്ത സമയം',
    metricExpectedPay: 'പ്രതീക്ഷിക്കുന്ന കൂലി',
    metricOpenCases: 'പരിശോധനയിലുള്ളവ',
    metricRecordedPay: 'ലഭിച്ച തുക: ',
    metricAfterBreaks: 'ഇടവേള കഴിഞ്ഞ്',

    guidedTitle: 'ഷിഫ്റ്റ് രേഖപ്പെടുത്തുക',
    guidedSubtitle: '5 ലളിതമായ ഘട്ടങ്ങളിലൂടെ കൃത്യമായ കൂലി കണക്കുകൂട്ടൽ',
    switchGuided: '5-ഘട്ട മാർഗ്ഗനിർദ്ദേശ രീതി',
    switchClassic: 'വേഗത്തിലുള്ള ഫോം',
    stepIndicator: 'ഘട്ടം',
    nextStep: 'അടുത്ത ഘട്ടത്തിലേക്ക്',
    prevStep: 'പുറകിലേക്ക്',
    saveShift: 'എന്റെ രേഖകളിൽ സൂക്ഷിക്കുക',
    savingShift: 'സൂക്ഷിക്കുന്നു...',

    step1Title: 'ഘട്ടം 1: ജോലി ചെയ്ത സ്ഥലവും തീയതിയും',
    step1Desc: 'ജോലി ഇനവും തീയതിയും തിരഞ്ഞെടുക്കുക.',
    selectIndustry: 'തൊഴിൽ മേഖല',
    industryConstruction: 'നിർമ്മാണ മേഖല (ദിവസക്കൂലി)',
    industryHospital: 'ആശുപത്രി ശുചീകരണ വിഭാഗം',
    shiftDate: 'ജോലി ചെയ്ത തീയതി',
    workerName: 'തൊഴിലാളിയുടെ പേര്',

    step2Title: 'ഘട്ടം 2: ജോലി സമയവും ഇടവേളയും',
    step2Desc: 'എപ്പോൾ തുടങ്ങി, എപ്പോൾ അവസാനിച്ചു, ഭക്ഷണ ഇടവേള എത്ര സമയം?',
    startTime: 'തുടങ്ങിയ സമയം',
    endTime: 'അവസാനിച്ച സമയം',
    isOvernightLabel: 'നൈറ്റ് ഷിഫ്റ്റ് (പിറ്റേന്ന് രാവിലെ വരെ)',
    isOvernightHint: 'രാത്രി തുടങ്ങി പിറ്റേന്ന് രാവിലെ അവസാനിച്ചെങ്കിൽ ഇത് ടിക്ക് ചെയ്യുക.',
    breakDuration: 'ഭക്ഷണ / ചായ ഇടവേള',
    breakNone: 'ഇടവേള ഇല്ല (0 മിനിറ്റ്)',
    break15m: '15 മിനിറ്റ്',
    break30m: '30 മിനിറ്റ് (സാധാരണം)',
    break45m: '45 മിനിറ്റ്',
    break60m: '60 മിനിറ്റ് (1 മണിക്കൂർ)',

    step3Title: 'ഘട്ടം 3: സമ്മതിച്ച കൂലി നിരക്ക്',
    step3Desc: 'സൂപ്പർവൈസറോ കരാറുകാരനോ സമ്മതിച്ച കൂലി എത്ര?',
    wageType: 'കൂലി സമ്പ്രദായം',
    wageDaily: 'ദിവസക്കൂലി (ദിവസത്തിന്)',
    wageHourly: 'മണിക്കൂർ കൂലി (മണിക്കൂറിന്)',
    agreedRateDaily: 'സമ്മതിച്ച ദിവസക്കൂലി (₹)',
    agreedRateHourly: 'സമ്മതിച്ച മണിക്കൂർ കൂലി (₹)',
    overtimeRules: 'അധിക ജോലി (OT) നിയമങ്ങൾ',
    policyStandard: '8 മണിക്കൂർ അടിസ്ഥാനം + അധിക സമയത്തിന് 1.5 മടങ്ങ് കൂലി',
    policyFixed: 'സ്ഥിര ദിവസക്കൂലി (OT ഇല്ല)',
    policyTier: 'പകുതി ദിവസം (< 5 മണിക്കൂർ = 50%) / മുഴുവൻ ദിവസം (>= 5 മണിക്കൂർ = 100%)',

    step4Title: 'ഘട്ടം 4: ലഭിച്ച തുക',
    step4Desc: 'പണമായോ UPI ആയോ എത്ര രൂപ ലഭിച്ചു?',
    paymentReceivedLabel: 'ലഭിച്ച തുക (₹)',
    paymentPendingCheckbox: 'ഇതുവരെ പണം ലഭിച്ചിട്ടില്ല (ബാക്കിയാണ്)',
    paymentPendingNotice: 'ഈ ഷിഫ്റ്റ് സുരക്ഷിതമായി സൂക്ഷിക്കും. പണം ലഭിക്കുമ്പോൾ കൂട്ടിച്ചേർക്കാം.',

    step5Title: 'ഘട്ടം 5: പരിശോധിച്ച് സൂക്ഷിക്കുക',
    step5Desc: 'ജോലി സമയവും പ്രതീക്ഷിക്കുന്ന കൂലിയും പരിശോധിച്ച് സേവ് ചെയ്യുക.',
    netHoursLogged: 'ജോലി ചെയ്ത ആകെ മണിക്കൂറുകൾ',
    regularPay: 'സാധാരണ കൂലി',
    overtimePay: 'ഓവർടൈം കൂലി',
    totalCalculatedPay: 'ആകെ ലഭിക്കേണ്ട കൂലി',
    paymentDifference: 'കൂലിയിലെ വ്യത്യാസം',
    howCalculated: 'ഇത് എങ്ങനെ കണക്കാക്കി? (വിശദാംശങ്ങൾ കാണുക)',
    howCalculatedClose: 'വിശദാംശങ്ങൾ മറയ്ക്കുക',
    saveToRecords: 'സ്ഥിരീകരിച്ച് എന്റെ രേഖകളിൽ സൂക്ഷിക്കുക',

    voiceButtonStart: 'ശബ്ദം വഴി രേഖപ്പെടുത്തുക (സംസാരിക്കുക)',
    voiceButtonListening: 'കേൾക്കുന്നു... നിങ്ങളുടെ ജോലി വിവരങ്ങൾ ഇപ്പോൾ പറയുക',
    voicePlaceholder: 'അല്ലെങ്കിൽ മലയാളത്തിൽ ടൈപ്പ് ചെയ്യുക: "ഇന്ന് രാവിലെ 8 മുതൽ വൈകുന്നേരം 6 വരെ കൺസ്ട്രക്ഷൻ പണി ചെയ്തു 30 മിനിറ്റ് ഊണ് 700 രൂപ കിട്ടി"',
    aiExtractButton: 'വിവരങ്ങൾ സ്വയം പൂരിപ്പിക്കുക',
    aiExtracting: 'വിവരങ്ങൾ വിശകലനം ചെയ്യുന്നു...',
    aiExtractNote: 'വിവരങ്ങൾ പൂരിപ്പിച്ചു. സേവ് ചെയ്യുന്നതിന് മുമ്പ് പരിശോധിക്കുക.',
    speechNotSupported: 'ഈ ബ്രൗസറിൽ ശബ്ദ ഇൻപുട്ട് ലഭ്യമല്ല. ടൈപ്പ് ചെയ്യുക.',
    speechMicBlocked: 'മൈക്രോഫോൺ അനുമതി നിരസിച്ചു. ബ്രൗസർ ക്രമീകരണങ്ങളിൽ അനുവദിക്കുക.',

    historyTitle: 'എന്റെ തൊഴിൽ ചരിത്രവും കൂലി രേഖകളും',
    historySubtitle: 'നിങ്ങൾ ജോലി ചെയ്ത മണിക്കൂറുകളും ലഭിക്കേണ്ട കൂലിയും സംബന്ധിച്ച വിവരങ്ങൾ.',
    noShiftsRecorded: 'ഷിഫ്റ്റുകൾ ഒന്നും രേഖപ്പെടുത്തിയിട്ടില്ല.',
    filterAll: 'എല്ലാ ഷിഫ്റ്റുകളും',
    filterDiscrepancies: 'വ്യത്യാസമുള്ളവ മാത്രം',
    filterResolved: 'പരിഹരിച്ചവ',
    flagDiscrepancy: 'വ്യത്യാസം റിപ്പോർട്ട് ചെയ്യുക',
    viewDetails: 'വിശദാംശങ്ങൾ കാണുക',
    deleteShift: 'നീക്കം ചെയ്യുക',

    statusWaitingPayment: 'പണത്തിന്റെ വിവരത്തിനായി കാത്തിരിക്കുന്നു',
    statusPossibleShortfall: 'കൂലി കുറയാൻ സാധ്യതയുണ്ട് (പരിശോധിക്കുക)',
    statusPossibleExcess: 'കൂടുതൽ തുക ലഭിച്ചു',
    statusPaymentMatched: 'കൂലി കൃത്യമായി ലഭിച്ചു',
    statusPendingReview: 'സൂപ്പർവൈസറുടെ പരിശോധനയ്ക്ക് അയച്ചു',
    statusUnderReview: 'സൂപ്പർവൈസറുടെ പരിശോധനയിലാണ്',
    statusResolved: 'പരിഹരിച്ച് പൂർത്തിയാക്കി',
    statusNeedsInfo: 'കൂടുതൽ വിവരങ്ങൾ ആവശ്യമുണ്ട്',

    modalDiscrepancyTitle: 'കൂലിയിലെ വ്യത്യാസം റിപ്പോർട്ട് ചെയ്യുക',
    modalDiscrepancySub: 'നിങ്ങളുടെ വിശദീകരണം സൂപ്പർവൈസർക്ക് സുതാര്യമായി അയയ്ക്കും.',
    workerExplanationLabel: 'നിങ്ങളുടെ വിശദീകരണം (നിങ്ങളുടെ വാക്കുകളിൽ)',
    workerExplanationPlaceholder: 'വ്യത്യാസത്തിനുള്ള കാരണം വ്യക്തമാക്കുക (ഉദാ: അധിക സമയം, കുറവുകൾ)...',
    requestAiExplanation: 'വ്യക്തമായ സംഗ്രഹം തയ്യാറാക്കുക',
    generatingAiExplanation: 'സംഗ്രഹം തയ്യാറാക്കുന്നു...',
    submitToSupervisor: 'സൂപ്പർവൈസർക്ക് അയയ്ക്കുക',
    close: 'അടയ്ക്കുക',
    cancel: 'റദ്ദാക്കുക',

    supervisorTitle: 'സൂപ്പർവൈസർ ഓഡിറ്റ് ഡെസ്ക്',
    supervisorSubtitle: 'രേഖകൾ പരിശോധിച്ച് ഔദ്യോഗിക കുറിപ്പുകൾ രേഖപ്പെടുത്തുക.',
    filterPendingCases: 'ബാക്കിയുള്ള പരിശോധനകൾ',
    allWorkerRecords: 'എല്ലാ തൊഴിലാളി രേഖകളും',
    updateStatus: 'നില മാറ്റുക',
    supervisorNotes: 'സൂപ്പർവൈസറുടെ കുറിപ്പ്',
    supervisorResolutionSummary: 'ഔദ്യോഗിക പരിഹാര സംഗ്രഹം (തൊഴിലാളിക്ക് കാണാം)',
    markResolved: 'പരിഹരിച്ചതായി അടയാളപ്പെടുത്തുക',
    markUnderReview: 'പരിശോധനയിലാണെന്ന് അടയാളപ്പെടുത്തുക',
    requestMoreInfo: 'കൂടുതൽ വിവരങ്ങൾ ചോദിക്കുക',
  },

  hi: {
    appName: 'VERITY WORK',
    tagline: 'आपका काम। आपका रिकॉर्ड। आपका हक।',
    workerView: 'मजदूर दृश्य (Worker View)',
    supervisorDesk: 'सुपरवाइजर डेस्क',
    verifySuite: 'कोर टेस्ट सुइट जांचें',
    sdgGoals: 'SDG 8.5 और 8.8 लक्ष्य',
    activeWorker: 'वर्तमान श्रमिक:',
    prototypeNote: 'पारदर्शी कार्य रिकॉर्ड, निष्पक्ष मजदूरी गणना और शिकायतों का समाधान।',

    cardRecordShiftTitle: 'शिफ्ट दर्ज करें',
    cardRecordShiftSub: 'बोलकर या लिखकर काम का समय दर्ज करें',
    cardCheckPayTitle: 'मजदूरी जांचें',
    cardCheckPaySub: 'बनने वाली कुल मजदूरी का हिसाब देखें',
    cardHistoryTitle: 'मेरा काम का इतिहास',
    cardHistorySub: 'पिछली सभी शिफ्ट और मजदूरी पर्ची',
    cardDiscrepanciesTitle: 'शिकायत की स्थिति',
    cardDiscrepanciesSub: 'सुपरवाइजर समीक्षा की स्थिति देखें',

    metricTotalShifts: 'कुल शिफ्ट',
    metricNetHours: 'कुल काम के घंटे',
    metricExpectedPay: 'बनने वाली मजदूरी',
    metricOpenCases: 'समीक्षाधीन मामले',
    metricRecordedPay: 'मिली राशि: ',
    metricAfterBreaks: 'लंच ब्रेक घटाकर',

    guidedTitle: 'अपनी शिफ्ट दर्ज करें',
    guidedSubtitle: '5 आसान चरणों में सही मजदूरी का पारदर्शी हिसाब',
    switchGuided: '5-चरणीय आसान तरीका',
    switchClassic: 'सामान्य तेज फॉर्म',
    stepIndicator: 'चरण',
    nextStep: 'अगले चरण पर जाएं',
    prevStep: 'पीछे जाएं',
    saveShift: 'मेरे रिकॉर्ड में सुरक्षित करें',
    savingShift: 'रिकॉर्ड सुरक्षित हो रहा है...',

    step1Title: 'चरण 1: काम का स्थान और तारीख',
    step1Desc: 'काम का प्रकार और तारीख चुनें।',
    selectIndustry: 'कार्य क्षेत्र',
    industryConstruction: 'कंस्ट्रक्शन साइट (दैनिक दिहाड़ी)',
    industryHospital: 'अस्पताल सफाई और स्वच्छता',
    shiftDate: 'काम की तारीख',
    workerName: 'मजदूर का नाम',

    step2Title: 'चरण 2: काम के घंटे और ब्रेक',
    step2Desc: 'काम कब शुरू किया, कब खत्म हुआ और लंच/चाय का ब्रेक कितना था?',
    startTime: 'शुरू होने का समय',
    endTime: 'खत्म होने का समय',
    isOvernightLabel: 'नाइट शिफ्ट (अगली सुबह तक चली)',
    isOvernightHint: 'अगर शाम/रात को काम शुरू होकर अगली सुबह खत्म हुआ तो टिक करें।',
    breakDuration: 'लंच / चाय का ब्रेक',
    breakNone: 'कोई ब्रेक नहीं (0 मिनट)',
    break15m: '15 मिनट',
    break30m: '30 मिनट (सामान्य)',
    break45m: '45 मिनट',
    break60m: '60 मिनट (1 घंटा)',

    step3Title: 'चरण 3: तय हुई मजदूरी दर',
    step3Desc: 'ठेकेदार या सुपरवाइजर ने क्या रेट तय किया था?',
    wageType: 'मजदूरी का प्रकार',
    wageDaily: 'दैनिक दिहाड़ी (प्रति दिन)',
    wageHourly: 'घंटे के हिसाब से (प्रति घंटा)',
    agreedRateDaily: 'तय दैनिक दिहाड़ी दर (₹)',
    agreedRateHourly: 'तय प्रति घंटा दर (₹)',
    overtimeRules: 'ओवरटाइम (OT) नियम',
    policyStandard: '8 घंटे का मूल वेतन + अतिरिक्त घंटों पर 1.5 गुना ओवरटाइम',
    policyFixed: 'फिक्स्ड दैनिक दिहाड़ी (ओवरटाइम नहीं)',
    policyTier: 'आधा दिन (< 5 घंटे = 50%) / पूरा दिन (>= 5 घंटे = 100%)',

    step4Title: 'चरण 4: वास्तव में मिली मजदूरी',
    step4Desc: 'इस शिफ्ट के लिए नकद या ऑनलाइन कितने पैसे मिले?',
    paymentReceivedLabel: 'मिली हुई रकम (₹)',
    paymentPendingCheckbox: 'अभी तक पैसे नहीं मिले (बाकी / पेंडिंग है)',
    paymentPendingNotice: 'यह शिफ्ट सुरक्षित रूप से रिकॉर्ड हो जाएगी। पैसे मिलने पर आप बाद में जोड़ सकते हैं।',

    step5Title: 'चरण 5: जांचें और सुरक्षित करें',
    step5Desc: 'अपने काम के घंटे और हिसाब की गई मजदूरी जांचकर सुरक्षित करें।',
    netHoursLogged: 'शुद्ध काम के घंटे',
    regularPay: 'सामान्य मजदूरी',
    overtimePay: 'ओवरटाइम मजदूरी',
    totalCalculatedPay: 'कुल बनने वाली मजदूरी',
    paymentDifference: 'मजदूरी में अंतर',
    howCalculated: 'यह हिसाब कैसे हुआ? (विस्तार से देखने के लिए दबाएं)',
    howCalculatedClose: 'हिसाब का विवरण छिपाएं',
    saveToRecords: 'पुष्टि करें और रिकॉर्ड में सेव करें',

    voiceButtonStart: 'बोलकर शिफ्ट दर्ज करें (आवाज इनपुट)',
    voiceButtonListening: 'सुन रहे हैं... अभी अपने काम का विवरण बोलें',
    voicePlaceholder: 'या हिंदी में टाइप करें: "आज सुबह 8 से शाम 6 बजे तक कंस्ट्रक्शन पर काम किया आधा घंटा लंच था 700 रुपये मिले"',
    aiExtractButton: 'विवरण अपने आप भरें',
    aiExtracting: 'विवरण निकाला जा रहा है...',
    aiExtractNote: 'विवरण भर दिया गया है। सेव करने से पहले कृपया जांच लें।',
    speechNotSupported: 'इस ब्राउज़र में आवाज की सुविधा उपलब्ध नहीं है। कृपया लिखकर दर्ज करें।',
    speechMicBlocked: 'माइक की अनुमति नहीं मिली। कृपया ब्राउज़र सेटिंग्स में माइक ऑन करें।',

    historyTitle: 'मेरा काम का इतिहास और मजदूरी रिकॉर्ड',
    historySubtitle: 'आपके द्वारा किए गए काम के घंटे, बनने वाली मजदूरी और अंतर का पारदर्शी रिकॉर्ड।',
    noShiftsRecorded: 'अभी तक कोई शिफ्ट दर्ज नहीं की गई है। ऊपर दिए गए फॉर्म से पहली शिफ्ट जोड़ें!',
    filterAll: 'सभी शिफ्ट',
    filterDiscrepancies: 'केवल अंतर वाले मामले',
    filterResolved: 'हल किए गए मामले',
    flagDiscrepancy: 'अंतर की शिकायत दर्ज करें',
    viewDetails: 'विवरण देखें',
    deleteShift: 'हटाएं',

    statusWaitingPayment: 'भुगतान विवरण की प्रतीक्षा है',
    statusPossibleShortfall: 'संभावित कमी (जांच आवश्यक)',
    statusPossibleExcess: 'अधिक भुगतान मिला',
    statusPaymentMatched: 'भुगतान हिसाब के अनुसार सही',
    statusPendingReview: 'सुपरवाइजर समीक्षा के लिए भेजा गया',
    statusUnderReview: 'सुपरवाइजर की समीक्षा जारी है',
    statusResolved: 'हल किया गया और बंद',
    statusNeedsInfo: 'अतिरिक्त जानकारी की आवश्यकता है',

    modalDiscrepancyTitle: 'मजदूरी में अंतर की रिपोर्ट करें',
    modalDiscrepancySub: 'आपका विवरण पूरी पारदर्शिता के साथ सुपरवाइजर डेस्क को भेजा जाएगा।',
    workerExplanationLabel: 'आपका स्पष्टीकरण (अपने शब्दों में)',
    workerExplanationPlaceholder: 'बताएं कि आपको अंतर क्यों लग रहा है (जैसे अतिरिक्त समय, तय रेट, कटौती)...',
    requestAiExplanation: 'पारदर्शी सारांश तैयार करें',
    generatingAiExplanation: 'सारांश तैयार किया जा रहा है...',
    submitToSupervisor: 'समीक्षा के लिए सुपरवाइजर को भेजें',
    close: 'बंद करें',
    cancel: 'रद्द करें',

    supervisorTitle: 'सुपरवाइजर ऑडिट और समाधान डेस्क',
    supervisorSubtitle: 'फ्लैग किए गए शिफ्ट रिकॉर्ड की समीक्षा करें और आधिकारिक समाधान दें।',
    filterPendingCases: 'लंबित समीक्षाएं',
    allWorkerRecords: 'सभी मजदूर रिकॉर्ड',
    updateStatus: 'समाधान स्थिति अपडेट करें',
    supervisorNotes: 'सुपरवाइजर का स्पष्टीकरण / टिप्पणी',
    supervisorResolutionSummary: 'आधिकारिक समाधान सारांश (श्रमिक को दिखेगा)',
    markResolved: 'हल किया गया मार्क करें',
    markUnderReview: 'समीक्षाधीन मार्क करें',
    requestMoreInfo: 'अधिक जानकारी मांगें',
  },
};

export function getTranslation(lang: LanguageCode): Translations {
  return TRANSLATIONS[lang] || TRANSLATIONS.en;
}
