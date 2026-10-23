import { Fragment, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import AOS from 'aos'

gsap.registerPlugin(ScrollTrigger)

const HERO_MASK = '/assets/hero-mask.png'
const HERO_BASE = '/assets/hero-portrait.png'
const WEB = '/assets/web.png'
const SPIDER = '/assets/spider.png'

const MARQUEE_ITEMS = [
  'ART & ILLUSTRATION',
  'CHARACTER DEVELOPMENT',
  'WORLD BUILDING',
  'STORYTELLING',
  'ANIMATION',
]

function MarqueeTrack() {
  return (
    <>
      {Array.from({ length: 2 }, (_, n) => (
        <div key={n} className="flex items-center h-full shrink-0">
          {MARQUEE_ITEMS.map((item, t) => (
            <Fragment key={`${n}-${t}`}>
              <span className="marquee-text mx-3 sm:mx-4 md:mx-6 text-sm md:text-base lg:text-xl font-black uppercase italic tracking-widest whitespace-nowrap shrink-0 drop-shadow-sm">
                {item}
              </span>
              <img
                src={t % 2 === 0 ? SPIDER : WEB}
                alt="Separator"
                className="mx-3 sm:mx-4 md:mx-6 h-5 sm:h-6 md:h-8 lg:h-10 w-auto object-contain shrink-0 drop-shadow-md"
              />
            </Fragment>
          ))}
        </div>
      ))}
    </>
  )
}

export default function Hero() {
  const sectionRef = useRef(null)
  const maskRef = useRef(null)
  const webRef = useRef(null)
  const kickerRef = useRef(null)
  const titleRef = useRef(null)
  const ctaRef = useRef(null)
  const marqueeTopRef = useRef(null)
  const marqueeBottomRef = useRef(null)

  const spot = useRef({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 500,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 500,
    alpha: 1,
    size: 50,
  }).current

  const xTo = useRef(null)
  const yTo = useRef(null)
  const marqueeTopTween = useRef(null)
  const marqueeBottomTween = useRef(null)

  useEffect(() => {
    AOS.init({ duration: 1000, once: true, easing: 'ease-out-expo' })

    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: 'back.out(1.7)' } })
        .fromTo(
          webRef.current.children,
          { opacity: 0, scale: 0.5 },
          { opacity: 0.5, scale: 1, duration: 2, stagger: 0.4, ease: 'power3.out' },
        )
        .fromTo(
          kickerRef.current,
          { x: -100, opacity: 0 },
          { x: 0, opacity: 1, duration: 1.2 },
          '-=1.5',
        )
        .fromTo(
          titleRef.current,
          { x: -150, opacity: 0, skewX: -15 },
          { x: 0, opacity: 1, skewX: 0, duration: 1.2 },
          '-=1.0',
        )
        .fromTo(
          ctaRef.current.children,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'back.out(2)' },
          '-=0.8',
        )

      gsap.to(webRef.current.children, {
        rotation: 360,
        duration: 120,
        repeat: -1,
        ease: 'linear',
      })
      gsap.to(webRef.current.children, {
        scale: 1.1,
        duration: 4,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      })

      marqueeTopTween.current = gsap.to(marqueeTopRef.current, {
        x: '-50%',
        repeat: -1,
        duration: 15,
        ease: 'none',
      })
      gsap.set(marqueeBottomRef.current, { x: '-50%' })
      marqueeBottomTween.current = gsap.to(marqueeBottomRef.current, {
        x: '0%',
        repeat: -1,
        duration: 20,
        ease: 'none',
      })

      gsap.to('.marquee-text', {
        y: -4,
        yoyo: true,
        repeat: -1,
        duration: 0.8,
        ease: 'sine.inOut',
        stagger: 0.1,
      })
    })

    return () => ctx.revert()
  }, [])

  // Cursor-following spotlight mask over the top hero layer.
  useEffect(() => {
    xTo.current = gsap.quickTo(spot, 'x', { duration: 0.3, ease: 'power4.out' })
    yTo.current = gsap.quickTo(spot, 'y', { duration: 0.3, ease: 'power4.out' })

    const update = () => {
      if (!maskRef.current) return
      const { x, y, alpha, size } = spot
      const gradient = `radial-gradient(circle ${size}px at ${x}px ${y}px, rgba(0,0,0,${alpha}) 0%, rgba(0,0,0,0.85) 40%, rgba(0,0,0,1) 100%)`
      maskRef.current.style.webkitMaskImage = gradient
      maskRef.current.style.maskImage = gradient
    }

    update()
    gsap.ticker.add(update)
    return () => gsap.ticker.remove(update)
  }, [spot])

  const handleMouseMove = (e) => {
    xTo.current?.(e.clientX)
    yTo.current?.(e.clientY)
  }

  const handleMouseEnter = () => {
    gsap.to(spot, {
      alpha: 0,
      size: 700,
      duration: 0.8,
      ease: 'elastic.out(1, 0.7)',
      overwrite: 'auto',
    })
  }

  const handleMouseLeave = () => {
    gsap.to(spot, {
      alpha: 1,
      size: 50,
      duration: 1.2,
      ease: 'power4.inOut',
      overwrite: 'auto',
    })
  }

  const slowMarquee = () => {
    if (marqueeTopTween.current && marqueeBottomTween.current) {
      gsap.to([marqueeTopTween.current, marqueeBottomTween.current], {
        timeScale: 0.1,
        duration: 0.8,
        ease: 'power2.out',
      })
    }
  }

  const resumeMarquee = () => {
    if (marqueeTopTween.current && marqueeBottomTween.current) {
      gsap.to([marqueeTopTween.current, marqueeBottomTween.current], {
        timeScale: 1,
        duration: 0.8,
        ease: 'power2.out',
      })
    }
  }

  return (
    <main className="w-full flex flex-col bg-white overflow-hidden">
      <section
        ref={sectionRef}
        className="relative w-full h-screen overflow-hidden flex items-center justify-center cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <img
          src={HERO_BASE}
          alt="Bottom Identity Layer"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none z-10"
        />
        <img
          ref={maskRef}
          src={HERO_MASK}
          alt="Top Mask Layer"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none z-20"
          style={{ WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat' }}
        />

        <div ref={webRef} className="absolute inset-0 pointer-events-none z-[25] overflow-hidden">
          <img
            src={WEB}
            alt="Spider Web Top"
            className="absolute top-0 left-0 w-44 h-44 sm:w-64 sm:h-64 md:w-[400px] md:h-[400px] object-contain opacity-40 sm:opacity-50 -translate-x-1/4 -translate-y-1/4 mix-blend-multiply"
          />
          <img
            src={WEB}
            alt="Spider Web Bottom"
            className="absolute bottom-0 right-0 w-52 h-52 sm:w-72 sm:h-72 md:w-[500px] md:h-[500px] object-contain opacity-40 sm:opacity-50 translate-x-1/4 translate-y-1/4 mix-blend-multiply"
          />
        </div>

        <div className="absolute top-1/2 -translate-y-1/2 left-6 md:left-12 lg:left-24 z-30 flex flex-col gap-3 pointer-events-none drop-shadow-md max-w-lg w-full">
          <span
            ref={kickerRef}
            className="text-[#a31515] font-bold uppercase text-xs md:text-sm tracking-[0.2em] opacity-0"
          >
            THE FREE-SPIRITED ARTIST
          </span>
          <h1
            ref={titleRef}
            className="text-gray-900 text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-none opacity-0 italic uppercase"
            style={{ textShadow: '4px 4px 0px #ef4444, 7px 7px 0px #a31515' }}
          >
            PREM
            <br />
            KUMAR.
          </h1>
          <div ref={ctaRef} className="flex flex-wrap items-center gap-4 mt-6 pointer-events-auto">
            <button
              type="button"
              onClick={() =>
                document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })
              }
              className="relative overflow-hidden bg-[#a31515] hover:bg-[#7a0f0f] text-white px-8 py-3 rounded-lg font-bold text-sm tracking-wide transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(163,21,21,0.4)] cursor-pointer uppercase border border-[#a31515]"
            >
              Explore Projects
            </button>
            <a
              href="/sde_resume.pdf"
              download
              className="flex items-center gap-2 text-white bg-gray-900 hover:bg-black px-6 py-3 rounded-lg font-bold transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(0,0,0,0.2)] uppercase text-sm group"
            >
              <svg
                className="w-4 h-4 fill-current transition-transform group-hover:scale-110"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
              </svg>
              sde_resume.pdf
            </a>
          </div>
        </div>
      </section>

      <section
        className="relative w-full h-[20vh] md:h-[30vh] bg-white overflow-hidden flex items-center justify-center z-40"
        onMouseEnter={slowMarquee}
        onMouseLeave={resumeMarquee}
        aria-label="Skills marquee"
      >
        <div className="absolute w-[110vw] h-12 md:h-16 lg:h-20 bg-[#a31515] text-white border-y-[3px] border-black rotate-[4deg] -translate-y-4 md:-translate-y-6 shadow-[0_10px_20px_rgba(0,0,0,0.4)] z-20 flex items-center overflow-hidden scale-105">
          <div ref={marqueeTopRef} className="flex items-center h-full w-max">
            <MarqueeTrack />
          </div>
        </div>
        <div className="absolute w-[110vw] h-12 md:h-16 lg:h-20 bg-[#111111] text-[#a31515] border-y-[3px] border-[#a31515] rotate-[-4deg] translate-y-4 md:translate-y-6 shadow-[0_5px_15px_rgba(0,0,0,0.5)] z-10 flex items-center overflow-hidden scale-105">
          <div ref={marqueeBottomRef} className="flex items-center h-full w-max">
            <MarqueeTrack />
          </div>
        </div>
      </section>
    </main>
  )
}
