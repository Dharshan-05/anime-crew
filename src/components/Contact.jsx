import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const WEB = '/assets/web.png'
const HANGING_SPIDER = '/assets/spider-hanging.png'
const CONTACT_EMAIL = 'premkumar.artworks@gmail.com'

const INQUIRY_TYPES = [
  'Anime / Film Production',
  'Character Design',
  'Original Comic / Manga',
  'Portrait Art',
  'General Collaboration',
]

const TIMELINES = ['Urgent (< 2 Weeks)', 'Standard (1 - 2 Months)', 'Flexible / Exploring']

export default function Contact() {
  const sectionRef = useRef(null)
  const headerRef = useRef(null)
  const contentRef = useRef(null)
  const bgWebRef = useRef(null)
  const spiderRef = useRef(null)

  const [selectedType, setSelectedType] = useState(INQUIRY_TYPES[0])
  const [selectedTimeline, setSelectedTimeline] = useState(TIMELINES[1])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [sent, setSent] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        })
        .fromTo(
          headerRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' },
        )
        .fromTo(
          contentRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' },
          '-=0.3',
        )

      gsap.to(bgWebRef.current, {
        scale: 1.12,
        opacity: 0.06,
        repeat: -1,
        yoyo: true,
        duration: 4.5,
        ease: 'sine.inOut',
      })

      if (spiderRef.current) {
        gsap.to(spiderRef.current, {
          rotation: 5,
          transformOrigin: 'top center',
          repeat: -1,
          yoyo: true,
          duration: 2.6,
          ease: 'sine.inOut',
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
    setTimeout(() => {
      setSent(false)
      setFormData({ name: '', email: '', subject: '', message: '' })
    }, 5000)
  }

  const copyEmail = () => {
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(CONTACT_EMAIL).catch(() => {})
      } else {
        const textArea = document.createElement('textarea')
        textArea.value = CONTACT_EMAIL
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
    } catch (_) {}
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  // Generate dynamic mailto link populated with the user's filled data
  const getDynamicMailto = () => {
    const subj = encodeURIComponent(
      formData.subject || `[${selectedType}] Creative Inquiry - ${formData.name || 'Anime Crew'}`,
    )
    const bodyText = encodeURIComponent(
      `Hi Prem,\n\nI am contacting you regarding: ${selectedType}\nEstimated Timeline: ${selectedTimeline}\n\nClient Name: ${formData.name || '[Your Name]'}\nClient Email: ${formData.email || '[Your Email]'}\n\nProject Details:\n${formData.message || '[Share your vision, references, or scope]'}\n\nBest regards,\n${formData.name || ''}`,
    )
    return `mailto:${CONTACT_EMAIL}?subject=${subj}&body=${bodyText}`
  }

  // Direct Gmail web compose link
  const getGmailComposeLink = () => {
    const subj = encodeURIComponent(
      formData.subject || `[${selectedType}] Creative Inquiry - ${formData.name || 'Anime Crew'}`,
    )
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT_EMAIL}&su=${subj}`
  }

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative w-full bg-white text-gray-900 py-20 px-6 sm:px-10 md:px-14 lg:px-20 flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background Web Watermark */}
      <div className="absolute bottom-0 left-0 pointer-events-none overflow-hidden z-0">
        <img
          ref={bgWebRef}
          src={WEB}
          alt="Background Web"
          className="w-[450px] h-[450px] md:w-[650px] md:h-[650px] object-contain opacity-[0.04] mix-blend-multiply -translate-x-1/4 translate-y-1/4"
        />
      </div>

      {/* Hanging Gear 5 Luffy Graphic (Placed safely on the right so it never obstructs content) */}
      <div
        ref={spiderRef}
        className="hidden 2xl:flex absolute top-0 right-10 z-20 pointer-events-none flex-col items-center origin-top opacity-85 hover:opacity-100 transition-opacity"
      >
        <div className="w-[2px] h-28 bg-gradient-to-b from-transparent to-gray-300 opacity-60" />
        <img
          src={HANGING_SPIDER}
          alt="Luffy Graphic"
          className="w-44 h-auto object-contain drop-shadow-xl -mt-2"
        />
      </div>

      {/* Header */}
      <div ref={headerRef} className="flex flex-col items-center text-center mb-12 z-10 max-w-2xl">
        <span className="text-[#a31515] font-bold uppercase text-[10px] md:text-xs tracking-[0.25em] mb-2 flex items-center gap-2">
          <svg className="w-4 h-4 text-[#a31515]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          Direct Mail & Collaboration
        </span>
        <h2
          className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter uppercase italic text-gray-900"
          style={{ textShadow: '2px 2px 0px #fca5a5' }}
        >
          CONTACT & INQUIRIES.
        </h2>
        <div className="w-16 h-1 bg-[#a31515] mt-3 rounded-full" />
        <p className="text-gray-600 text-xs sm:text-sm font-medium mt-3 max-w-lg">
          Whether you have an upcoming anime project, manga storyboarding, character design concept, or want to discuss creative work — send a detailed inquiry below.
        </p>
      </div>

      {/* Main Grid: Detailed Mail Hub (Left) + Detailed Mail Inquiry Form (Right) */}
      <div
        ref={contentRef}
        className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 z-10"
      >
        {/* Left Column: Comprehensive Mail & Production Details (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Main Direct Mailbox Card */}
          <div className="bg-gray-50/90 backdrop-blur-sm border border-gray-200 hover:border-[#a31515]/50 rounded-2xl p-6 shadow-sm transition-all duration-300 flex flex-col gap-4 group relative overflow-hidden">
            {/* Top Accent Strip */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#a31515] via-red-500 to-[#a31515]" />

            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#a31515] bg-red-100/70 border border-red-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#a31515] animate-pulse" />
                Official Artist Mailbox
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                ● Inquiries Open
              </span>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Primary Direct Email
              </p>
              <a
                href={getDynamicMailto()}
                className="text-base sm:text-lg md:text-xl font-black text-gray-900 group-hover:text-[#a31515] transition-colors duration-200 tracking-tight break-all flex items-center gap-2"
                title="Send email via your mail client"
              >
                <span>{CONTACT_EMAIL}</span>
                <svg
                  className="w-4 h-4 text-gray-400 group-hover:text-[#a31515] group-hover:translate-x-1 transition-transform shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>

            {/* Quick Action Buttons: Copy, Gmail, Default App */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200/70">
              <button
                type="button"
                onClick={copyEmail}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 border ${
                  copied
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {copied ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    <span>Copy Address</span>
                  </>
                )}
              </button>

              <a
                href={getGmailComposeLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 border bg-white text-gray-700 border-gray-200 hover:border-[#a31515]/40 hover:text-[#a31515] hover:bg-red-50/50"
              >
                <svg className="w-3.5 h-3.5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
                <span>Open Gmail</span>
              </a>
            </div>
          </div>

          {/* Response & Delivery Details Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Response Time */}
            <div className="bg-gray-50/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col gap-1.5">
              <div className="w-8 h-8 rounded-xl bg-red-100/60 border border-red-200 flex items-center justify-center text-[#a31515] mb-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Response Speed</span>
              <span className="text-xs font-black text-gray-900">Within 24 Hours</span>
              <span className="text-[11px] text-gray-500 font-medium">Monday to Saturday</span>
            </div>

            {/* Global Reach */}
            <div className="bg-gray-50/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col gap-1.5">
              <div className="w-8 h-8 rounded-xl bg-red-100/60 border border-red-200 flex items-center justify-center text-[#a31515] mb-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                  />
                </svg>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Timezone & Reach</span>
              <span className="text-xs font-black text-gray-900">Worldwide Remote</span>
              <span className="text-[11px] text-gray-500 font-medium">IST (UTC+5:30) Active</span>
            </div>
          </div>

          {/* Project Capabilities & What to Expect */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                Accepted Inquiries & Deliverables
              </span>
              <span className="text-[10px] font-bold text-[#a31515]">Direct Delivery</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                'Anime Key Visuals',
                'Concept Character Sheets',
                'Manga Layouts & Storyboards',
                'Cinematic Illustration',
                'Commercial Licensing',
                'Private Commissions',
              ].map((scope) => (
                <span
                  key={scope}
                  className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg hover:border-gray-300"
                >
                  {scope}
                </span>
              ))}
            </div>

            <p className="text-[11px] text-gray-500 font-medium leading-relaxed pt-2 border-t border-gray-100">
              For large studio contracts or confidential NDAs, mention your studio name in the project title or body.
            </p>
          </div>
        </div>

        {/* Right Column: Detailed Interactive Mail Composer Form (7 cols) */}
        <div className="lg:col-span-7 bg-gray-50/90 backdrop-blur-sm border border-gray-200 p-6 sm:p-8 rounded-2xl shadow-sm relative flex flex-col justify-between">
          {sent ? (
            <div className="py-16 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#a31515] text-white rounded-full flex items-center justify-center text-3xl font-black mb-5 shadow-xl animate-bounce">
                ✓
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#a31515] bg-red-100/70 border border-red-200 px-3 py-1 rounded-full mb-3">
                Inquiry Dispatched
              </span>
              <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-gray-900 mb-2">
                Thank You for Reaching Out!
              </h3>
              <p className="text-sm text-gray-600 font-medium max-w-md mb-6 leading-relaxed">
                Your message has been recorded. Prem Kumar will review your project details and respond to your email address within 24 hours.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <a
                  href={getDynamicMailto()}
                  className="px-5 py-2.5 bg-[#a31515] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#821010] transition-colors"
                >
                  Open in Email Client
                </a>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-100 transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Category Selector Chips */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center justify-between">
                  <span>1. Select Project Category *</span>
                  <span className="text-[10px] text-gray-400 font-normal">Choose inquiry type</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {INQUIRY_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedType(type)}
                      className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                        selectedType === type
                          ? 'bg-[#a31515] text-white border-[#a31515] shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timeline Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center justify-between">
                  <span>2. Target Timeline</span>
                  <span className="text-[10px] text-gray-400 font-normal">When is this needed?</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {TIMELINES.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTimeline(time)}
                      className={`text-[11px] font-bold py-2 px-3 rounded-xl border transition-all duration-200 cursor-pointer text-center ${
                        selectedTimeline === time
                          ? 'bg-[#a31515]/10 text-[#a31515] border-[#a31515]'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Email Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-gray-600">
                    Your Name / Studio *
                  </label>
                  <input
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    type="text"
                    placeholder="e.g. Monkey D. Luffy"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#a31515] focus:ring-1 focus:ring-[#a31515] transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-gray-600">
                    Your Email Address *
                  </label>
                  <input
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    type="email"
                    placeholder="e.g. contact@nakama.com"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#a31515] focus:ring-1 focus:ring-[#a31515] transition-all"
                  />
                </div>
              </div>

              {/* Subject Field */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="subject" className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Subject / Project Title
                </label>
                <input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  type="text"
                  placeholder={`Inquiry: ${selectedType} collaboration`}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#a31515] focus:ring-1 focus:ring-[#a31515] transition-all"
                />
              </div>

              {/* Detailed Message Textarea */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center justify-between">
                  <span>Project Details & Specifications *</span>
                  <span className="text-[10px] text-gray-400 font-normal">Style, references, scope</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Share a brief overview of your story, characters, references, or expected deliverables..."
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#a31515] focus:ring-1 focus:ring-[#a31515] transition-all resize-none"
                />
              </div>

              {/* Dual Action: Send Message + Compose in Mail App */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                <button
                  type="submit"
                  className="px-8 bg-[#a31515] hover:bg-[#851010] text-white py-3.5 rounded-xl font-bold uppercase text-xs tracking-widest transition-all duration-300 shadow-[0_4px_15px_rgba(163,21,21,0.3)] hover:shadow-[0_6px_20px_rgba(163,21,21,0.5)] cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Send Message</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>

                <a
                  href={getDynamicMailto()}
                  className="px-5 py-3 rounded-xl border border-gray-200 bg-white hover:border-[#a31515]/40 hover:text-[#a31515] text-gray-700 font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2"
                  title="Open in your default email application"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Open in Mail App</span>
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
