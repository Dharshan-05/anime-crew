import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const WEB = '/assets/web.png'
const LUFFY_GEAR5 = '/assets/luffy-gear5.png'
const PROJECT_STICK = '/assets/project-stick.png'

// Aligned character coordinates
const STICK_POS = {
  x: 7,
  y: 33,
  scale: 0.86,
  zIndex: 20,
}

const GEAR5_POS = {
  x: 0,
  y: 0,
  scale: 1,
}

const FRUIT_POS = {
  x: 0,
  y: 0,
  scale: 1,
  opacity: 0.04,
}

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
  const stickRef = useRef(null)
  const stickImgRef = useRef(null)
  const bgWebRef = useRef(null)
  const luffyRef = useRef(null)

  // Cursor-following spotlight mask animation (matching Hero mask)
  const stickSpot = useRef({
    x: 100,
    y: 50,
    alpha: 1,
    size: 50,
  }).current
  const stickXTo = useRef(null)
  const stickYTo = useRef(null)

  useEffect(() => {
    stickXTo.current = gsap.quickTo(stickSpot, 'x', { duration: 0.3, ease: 'power4.out' })
    stickYTo.current = gsap.quickTo(stickSpot, 'y', { duration: 0.3, ease: 'power4.out' })

    const update = () => {
      if (!stickImgRef.current) return
      const { x, y, alpha, size } = stickSpot
      const gradient = `radial-gradient(circle ${size}px at ${x}px ${y}px, rgba(0,0,0,${alpha}) 0%, rgba(0,0,0,0.85) 40%, rgba(0,0,0,1) 100%)`
      stickImgRef.current.style.webkitMaskImage = gradient
      stickImgRef.current.style.maskImage = gradient
    }

    update()
    gsap.ticker.add(update)
    return () => gsap.ticker.remove(update)
  }, [stickSpot])

  const handleStickMouseMove = (e) => {
    if (!stickImgRef.current) return
    const rect = stickImgRef.current.getBoundingClientRect()
    stickXTo.current?.(e.clientX - rect.left)
    stickYTo.current?.(e.clientY - rect.top)
  }

  const handleStickMouseEnter = () => {
    gsap.to(stickSpot, {
      alpha: 0,
      size: 160,
      duration: 0.8,
      ease: 'elastic.out(1, 0.7)',
      overwrite: 'auto',
    })
  }

  const handleStickMouseLeave = () => {
    gsap.to(stickSpot, {
      alpha: 1,
      size: 50,
      duration: 1.2,
      ease: 'power4.inOut',
      overwrite: 'auto',
    })
  }

  const stickPos = STICK_POS
  const gear5Pos = GEAR5_POS
  const fruitPos = FRUIT_POS

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
      onMouseMove={handleStickMouseMove}
      onMouseEnter={handleStickMouseEnter}
      onMouseLeave={handleStickMouseLeave}
      className="relative w-full bg-white text-gray-900 py-16 px-6 md:px-16 lg:px-24 flex flex-col items-center justify-center overflow-hidden"
    >
      <div
        className="absolute top-0 right-0 pointer-events-none overflow-hidden z-0"
        style={{
          transform: `translate3d(${fruitPos.x}px, ${fruitPos.y}px, 0px) scale(${fruitPos.scale})`,
          opacity: fruitPos.opacity ?? 0.04,
        }}
      >
        <img
          ref={bgWebRef}
          src={WEB}
          alt="Background Web"
          className="w-[500px] h-[500px] md:w-[700px] md:h-[700px] object-contain mix-blend-multiply translate-x-1/4 -translate-y-1/4"
        />
      </div>

      {/* Luffy Gear 5 */}
      <div
        className="absolute bottom-2 md:bottom-8 left-2 sm:left-4 md:left-8 lg:left-12 z-30 pointer-events-none"
        style={{
          transform: `translate3d(${gear5Pos.x}px, ${gear5Pos.y}px, 0px) scale(${gear5Pos.scale})`,
        }}
      >
        <div ref={luffyRef} className="pointer-events-none">
          <img
            src={LUFFY_GEAR5}
            alt="Monkey D. Luffy Gear 5"
            className="w-36 sm:w-48 md:w-60 lg:w-72 h-auto object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.2)] select-none pointer-events-none"
            draggable={false}
          />
        </div>
      </div>

      <div className="flex flex-col items-center text-center mb-10 z-10 relative">
        {/* Luffy Peeking */}
        <div
          className="relative origin-bottom select-none pointer-events-none"
          style={{
            transform: `translate3d(${stickPos.x}px, ${stickPos.y}px, 0px) scale(${stickPos.scale})`,
            zIndex: stickPos.zIndex ?? 20,
          }}
        >
          <div
            ref={stickRef}
            className="relative pointer-events-none -mb-3 sm:-mb-5 md:-mb-6 origin-bottom"
          >
            <img
              ref={stickImgRef}
              src={PROJECT_STICK}
              alt="Luffy Peeking"
              className="w-32 sm:w-40 md:w-48 lg:w-56 h-auto object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.12)] select-none pointer-events-none"
              style={{ WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat' }}
              draggable={false}
            />
          </div>
        </div>

        <div ref={headerRef} className="flex flex-col items-center">
          <h2
            className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic text-gray-900 relative z-10"
            style={{ textShadow: '2px 2px 0px #fca5a5' }}
          >
            FEATURED PROJECTS.
          </h2>
          <div className="w-12 h-1 bg-[#a31515] mt-2 rounded-full" />
        </div>
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
