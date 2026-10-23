import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const WEB = '/assets/web.png'
const LUFFY_GEAR5 = '/assets/luffy-gear5.png'

const PROJECTS = [
  {
    title: 'Original Anime Series & Studio Production',
    status: 'In Progress',
    description:
      "Developing an original anime series with a creative team in the studio. Episode 1's story is complete, while character development, visual direction, world building, and further production work continue.",
    tags: ['Anime', 'Story Development', 'Character Design', 'World Building', 'Team Collaboration'],
    link: '#',
  },
  {
    title: 'TEDxKPRCAS Promotional Film',
    status: 'In Progress',
    description:
      'Taking creative responsibility for a TEDxKPRCAS promotional video, bringing together storytelling, direction, cinematography, and artistic vision to shape the film from concept to final production.',
    tags: ['Film Direction', 'Storytelling', 'Cinematography', 'Art Direction'],
    link: '#',
  },
  {
    title: 'Original Comic / Manga',
    status: 'Active Project',
    description:
      'Creating an original comic/manga with its story and planning established, while artwork and production progress smoothly. Bringing the narrative to life through characters, sequential art, and cinematic panels.',
    tags: ['Manga', 'Comic Art', 'Storyboarding', 'Visual Storytelling'],
    link: '#',
  },
  {
    title: 'Portrait Art & Illustration',
    status: '70+ Artworks',
    description:
      'A collection of 70+ portrait artworks exploring likeness, proportions, facial expressions, shading, and the details that bring each subject to life.',
    tags: ['Portraiture', 'Pencil Art', 'Observation', 'Shading'],
    link: '#',
  },
]

export default function Projects() {
  const sectionRef = useRef(null)
  const headerRef = useRef(null)
  const bgWebRef = useRef(null)
  const luffyRef = useRef(null)

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
          '.project-item',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.35, stagger: 0.05, ease: 'power3.out' },
          '-=0.15',
        )
        .fromTo(
          luffyRef.current,
          { y: 50, scale: 0.85, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(1.5)' },
          '-=0.2',
        )

      gsap.set(bgWebRef.current, { transformOrigin: 'top right' })
      gsap.to(bgWebRef.current, {
        rotation: 8,
        repeat: -1,
        yoyo: true,
        duration: 6,
        ease: 'sine.inOut',
      })
      gsap.to(bgWebRef.current, {
        scale: 1.1,
        opacity: 0.07,
        repeat: -1,
        yoyo: true,
        duration: 4,
        ease: 'sine.inOut',
      })
      gsap.to(luffyRef.current, {
        y: -12,
        rotation: 2.5,
        repeat: -1,
        yoyo: true,
        duration: 2.4,
        ease: 'sine.inOut',
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative w-full bg-white text-gray-900 py-16 px-6 md:px-16 lg:px-24 flex flex-col items-center justify-center overflow-hidden border-t border-gray-100"
    >
      <div className="absolute top-0 right-0 pointer-events-none overflow-hidden z-0">
        <img
          ref={bgWebRef}
          src={WEB}
          alt="Background Web"
          className="w-[500px] h-[500px] md:w-[700px] md:h-[700px] object-contain opacity-[0.04] mix-blend-multiply translate-x-1/4 -translate-y-1/4"
        />
      </div>

      <div
        ref={luffyRef}
        className="absolute bottom-2 md:bottom-8 left-2 sm:left-4 md:left-8 lg:left-12 z-30 pointer-events-none"
      >
        <img
          src={LUFFY_GEAR5}
          alt="Monkey D. Luffy Gear 5"
          className="w-36 sm:w-48 md:w-60 lg:w-72 h-auto object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.2)]"
        />
      </div>

      <div ref={headerRef} className="flex flex-col items-center text-center mb-10 z-10">
        <span className="text-[#a31515] font-bold uppercase text-[10px] md:text-xs tracking-[0.2em] mb-2">
          Featured Works
        </span>
        <h2
          className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic text-gray-900"
          style={{ textShadow: '2px 2px 0px #fca5a5' }}
        >
          PROJECTS.
        </h2>
        <div className="w-12 h-1 bg-[#a31515] mt-2 rounded-full" />
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 z-10">
        {PROJECTS.map((project) => (
          <div
            key={project.title}
            className="project-item group relative bg-gray-50/90 backdrop-blur-sm border border-gray-200 hover:border-[#a31515] p-6 rounded-2xl transition-all duration-300 flex flex-col justify-between cursor-pointer overflow-hidden shadow-sm hover:shadow-[0_10px_25px_rgba(163,21,21,0.15)] transform hover:-translate-y-1"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-[#a31515] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                {project.status && (
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#a31515] bg-red-100/70 border border-red-200 px-2.5 py-0.5 rounded-full">
                    {project.status}
                  </span>
                )}
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-[#a31515] transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300 ml-auto shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </div>
              <h3 className="text-base md:text-lg font-black uppercase tracking-tight text-gray-900 group-hover:text-[#a31515] transition-colors duration-300 mb-2">
                {project.title}
              </h3>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed font-medium mb-6">
                {project.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200/60">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-white border border-gray-200 text-gray-600 group-hover:border-[#a31515]/30 group-hover:text-[#a31515] rounded-md transition-colors duration-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
