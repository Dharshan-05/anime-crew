import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const WEB = '/assets/web.png'
const SPIDER = '/assets/spider.png'
const HANGING_SPIDER = '/assets/spider-hanging.png'

export default function Contact() {
  const sectionRef = useRef(null)
  const headerRef = useRef(null)
  const formRef = useRef(null)
  const bgWebRef = useRef(null)
  const spiderRef = useRef(null)
  const [sent, setSent] = useState(false)

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
          formRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: 'back.out(1.4)' },
          '-=0.3',
        )

      gsap.to(bgWebRef.current, {
        scale: 1.15,
        opacity: 0.06,
        repeat: -1,
        yoyo: true,
        duration: 4.5,
        ease: 'sine.inOut',
      })
      gsap.to(spiderRef.current, {
        rotation: 8,
        transformOrigin: 'top center',
        repeat: -1,
        yoyo: true,
        duration: 2,
        ease: 'sine.inOut',
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
    setTimeout(() => setSent(false), 4000)
  }

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative w-full bg-white text-gray-900 py-16 px-6 md:px-16 lg:px-24 flex flex-col items-center justify-center overflow-hidden border-t border-gray-100"
    >
      <div className="absolute bottom-0 left-0 pointer-events-none overflow-hidden z-0">
        <img
          ref={bgWebRef}
          src={WEB}
          alt="Background Web"
          className="w-[500px] h-[500px] md:w-[700px] md:h-[700px] object-contain opacity-[0.04] mix-blend-multiply -translate-x-1/4 translate-y-1/4"
        />
      </div>

      <div
        ref={spiderRef}
        className="absolute top-0 right-8 md:right-20 z-30 pointer-events-none flex flex-col items-center origin-top"
      >
        <div className="w-[2px] h-24 md:h-36 bg-gradient-to-b from-transparent to-gray-400 opacity-60" />
        <img
          src={HANGING_SPIDER}
          alt="Hanging Spider-Man"
          className="w-40 md:w-60 h-auto object-contain drop-shadow-2xl -mt-2"
        />
      </div>

      <div ref={headerRef} className="flex flex-col items-center text-center mb-10 z-10">
        <span className="text-[#a31515] font-bold uppercase text-[10px] md:text-xs tracking-[0.2em] mb-2 flex items-center gap-1.5">
          <img src={SPIDER} alt="Spider" className="w-4 h-4 object-contain" />
          Get In Touch
        </span>
        <h2
          className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic text-gray-900"
          style={{ textShadow: '2px 2px 0px #fca5a5' }}
        >
          CONTACT.
        </h2>
        <div className="w-12 h-1 bg-[#a31515] mt-2 rounded-full" />
      </div>

      <div className="w-full max-w-2xl bg-gray-50/90 backdrop-blur-sm border border-gray-200 p-8 rounded-2xl shadow-sm relative z-10">
        {sent ? (
          <div className="py-12 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-[#a31515] text-white rounded-full flex items-center justify-center text-xl font-black mb-4 shadow-md animate-bounce">
              ✓
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight text-gray-900 mb-2">
              Message Sent!
            </h3>
            <p className="text-sm text-gray-600 font-medium">
              Thanks for reaching out. I'll get back to you shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="name"
                  className="text-xs font-bold uppercase tracking-wider text-gray-600"
                >
                  Your Name
                </label>
                <input
                  id="name"
                  name="name"
                  required
                  type="text"
                  placeholder="Peter Parker"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#a31515] focus:ring-1 focus:ring-[#a31515] transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-bold uppercase tracking-wider text-gray-600"
                >
                  Your Email
                </label>
                <input
                  id="email"
                  name="email"
                  required
                  type="email"
                  placeholder="peter@stark.com"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#a31515] focus:ring-1 focus:ring-[#a31515] transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="message"
                className="text-xs font-bold uppercase tracking-wider text-gray-600"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows="4"
                placeholder="Let's build something amazing together..."
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#a31515] focus:ring-1 focus:ring-[#a31515] transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#a31515] hover:bg-[#7a0f0f] text-white py-3.5 rounded-xl font-bold uppercase text-xs tracking-widest transition-all duration-300 shadow-[0_4px_15px_rgba(163,21,21,0.3)] hover:shadow-[0_6px_20px_rgba(163,21,21,0.5)] cursor-pointer mt-2"
            >
              Send Message
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
