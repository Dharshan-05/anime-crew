import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const WEB = '/assets/web.png'
const HANGING_SPIDER = '/assets/spider-hanging.png'

const SKILLS = [
  { name: 'VISUAL STORYTELLING', category: 'Storytelling', level: 'Advanced' },
  { name: 'CHARACTER DESIGN', category: 'Character Art', level: 'Advanced' },
  { name: 'ANIME & MANGA', category: 'Illustration', level: 'Advanced' },
  { name: 'HUMAN ANATOMY & GESTURE', category: 'Drawing', level: 'Advanced' },
  { name: 'PERSPECTIVE & ENVIRONMENTS', category: 'Visual Development', level: 'Proficient' },
  { name: 'COMPOSITION & LIGHTING', category: 'Visual Design', level: 'Proficient' },
  { name: 'COLOUR THEORY & SHADING', category: 'Rendering', level: 'Proficient' },
  { name: 'DIGITAL ILLUSTRATION', category: 'Digital Art', level: 'Advanced' },
  { name: 'WORLD BUILDING', category: 'Story Development', level: 'Proficient' },
  { name: 'STORYBOARDING & COMIC PANELS', category: 'Storytelling', level: 'Proficient' },
  { name: 'ANIMATION', category: 'Motion & Animation', level: 'Proficient' },
  { name: 'UI/UX DESIGN', category: 'Digital Design', level: 'Certified' },
]

export default function Skills() {
  const sectionRef = useRef(null)
  const headerRef = useRef(null)
  const bgWebRef = useRef(null)
  const spiderRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
            once: true,
          },
        })
        .fromTo(
          headerRef.current,
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.3, ease: 'power3.out' },
        )
        .fromTo(
          '.matrix-item',
          { y: 20, opacity: 0, x: -10 },
          {
            y: 0,
            opacity: 1,
            x: 0,
            duration: 0.3,
            stagger: 0.02,
            ease: 'power3.out',
          },
          '-=0.15',
        )

      gsap.to(bgWebRef.current, {
        scale: 1.05,
        opacity: 0.06,
        repeat: -1,
        yoyo: true,
        duration: 5,
        ease: 'sine.inOut',
      })
      gsap.to(spiderRef.current, {
        rotation: 5,
        transformOrigin: 'top center',
        repeat: -1,
        yoyo: true,
        duration: 3.2,
        ease: 'sine.inOut',
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="relative w-full bg-white text-gray-900 py-16 px-6 md:px-16 lg:px-24 flex flex-col items-center justify-center overflow-hidden border-t border-gray-100"
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0">
        <img
          ref={bgWebRef}
          src={WEB}
          alt="Background Web"
          className="w-[600px] h-[600px] md:w-[800px] md:h-[800px] object-contain opacity-[0.04] mix-blend-multiply"
        />
      </div>

      <div
        ref={spiderRef}
        className="absolute top-0 right-8 md:right-16 z-30 pointer-events-none flex flex-col items-center origin-top"
      >
        <div className="w-[2px] h-16 md:h-24 bg-gradient-to-b from-transparent to-gray-400 opacity-60" />
        <img
          src={HANGING_SPIDER}
          alt="Hanging Spider-Man"
          className="w-28 md:w-40 h-auto object-contain drop-shadow-lg -mt-2"
        />
      </div>

      <div ref={headerRef} className="flex flex-col items-center text-center mb-10 z-10">
        <span className="text-[#a31515] font-bold uppercase text-[10px] md:text-xs tracking-[0.2em] mb-2">
          Creative Expertise
        </span>
        <h2
          className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic text-gray-900"
          style={{ textShadow: '2px 2px 0px #fca5a5' }}
        >
          ART, STORYTELLING & ANIMATION.
        </h2>
        <div className="w-12 h-1 bg-[#a31515] mt-2 rounded-full" />
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 md:gap-4 z-10">
        {SKILLS.map((skill) => (
          <div
            key={skill.name}
            className="matrix-item group relative bg-gray-50/90 backdrop-blur-sm border border-gray-200 hover:border-[#a31515] px-5 py-3.5 rounded-xl transition-all duration-300 flex items-center justify-between cursor-pointer overflow-hidden shadow-sm hover:shadow-[0_8px_20px_rgba(163,21,21,0.15)] transform hover:-translate-y-0.5"
          >
            <div className="absolute inset-0 bg-[#a31515] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-400 ease-out z-0" />
            <div className="relative z-10 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#a31515] group-hover:bg-white transition-colors duration-300 shadow-[0_0_8px_rgba(163,21,21,0.6)]" />
              <div className="flex flex-col">
                <span className="text-sm md:text-base font-black uppercase tracking-tight text-gray-900 group-hover:text-white transition-colors duration-300">
                  {skill.name}
                </span>
                <span className="text-[10px] font-semibold text-gray-400 group-hover:text-gray-200 transition-colors duration-300 uppercase tracking-widest">
                  {skill.category}
                </span>
              </div>
            </div>
            <div className="relative z-10">
              <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 bg-white text-gray-700 group-hover:bg-black group-hover:text-white rounded-full transition-colors duration-300 shadow-sm">
                {skill.level}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
