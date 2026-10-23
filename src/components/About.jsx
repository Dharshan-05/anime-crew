import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const WEB = '/assets/web.png'
const SPIDER = '/assets/spider.png'
const PROFILE = '/assets/profile.png'

const STACK = [
  'Visual Storytelling',
  'Character Design',
  'Anime & Manga',
  'World Building',
  'Portrait Art',
  'Animation',
]

export default function About() {
  const sectionRef = useRef(null)
  const webLeftRef = useRef(null)
  const webRightRef = useRef(null)
  const kickerRef = useRef(null)
  const titleRef = useRef(null)
  const bodyRef = useRef(null)
  const pillsRef = useRef(null)
  const photoRef = useRef(null)

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
          [webLeftRef.current, webRightRef.current],
          { y: -150, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.35,
            ease: 'power3.out',
            stagger: 0.05,
          },
        )
        .fromTo(
          photoRef.current,
          { y: -250, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.35, ease: 'power3.out' },
          '<0.05',
        )
        .fromTo(
          kickerRef.current,
          { x: -20, opacity: 0, clipPath: 'polygon(0 0, 0 0, 0 100%, 0% 100%)' },
          {
            x: 0,
            opacity: 1,
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)',
            duration: 0.25,
            ease: 'power3.out',
          },
          '<',
        )
        .fromTo(
          titleRef.current,
          { y: 20, opacity: 0, clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)' },
          {
            y: 0,
            opacity: 1,
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)',
            duration: 0.25,
            ease: 'power3.out',
          },
          '<0.05',
        )
        .fromTo(
          bodyRef.current.children,
          { y: 15, opacity: 0, rotationX: -10 },
          {
            y: 0,
            opacity: 1,
            rotationX: 0,
            duration: 0.3,
            stagger: 0.04,
            ease: 'power2.out',
          },
          '<0.05',
        )
        .fromTo(
          pillsRef.current.children,
          { scale: 0.85, opacity: 0, y: 10 },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 0.2,
            stagger: 0.02,
            ease: 'back.out(1.8)',
          },
          '<0.05',
        )

      gsap.to('.bg-web-left', {
        rotation: 360,
        transformOrigin: 'center center',
        repeat: -1,
        duration: 70,
        ease: 'linear',
      })
      gsap.to('.bg-web-right', {
        rotation: -360,
        transformOrigin: 'center center',
        repeat: -1,
        duration: 90,
        ease: 'linear',
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative w-full min-h-screen bg-gray-50 text-gray-900 py-24 flex items-center justify-center overflow-hidden"
    >
      <div
        ref={webLeftRef}
        className="absolute top-[-50px] left-[-5%] md:left-[2%] flex flex-col items-center pointer-events-none z-0"
      >
        <div className="w-[1px] h-[250px] md:h-[350px] bg-gradient-to-b from-transparent to-gray-300" />
        <img
          src={WEB}
          alt="Hanging Web"
          className="bg-web-left w-64 h-64 md:w-96 md:h-96 object-contain -mt-12 opacity-[0.12] mix-blend-multiply"
        />
      </div>

      <div
        ref={webRightRef}
        className="absolute top-[-50px] right-[-5%] md:right-[2%] flex flex-col items-center pointer-events-none z-0"
      >
        <div className="w-[1px] h-[200px] md:h-[300px] bg-gradient-to-b from-transparent to-gray-300" />
        <img
          src={WEB}
          alt="Hanging Web"
          className="bg-web-right w-56 h-56 md:w-80 md:h-80 object-contain -mt-10 opacity-[0.12] mix-blend-multiply"
        />
      </div>

      <div className="container mx-auto px-6 md:px-12 lg:px-24 flex flex-col-reverse lg:flex-row items-center lg:items-start gap-12 lg:gap-20 z-10 relative">
        <div className="flex-1 flex flex-col gap-6 mt-10 lg:mt-0 relative z-20">
          <div className="overflow-hidden">
            <span
              ref={kickerRef}
              className="inline-flex items-center gap-2 text-[#a31515] font-bold uppercase text-xs md:text-sm tracking-[0.2em]"
            >
              <img src={SPIDER} alt="Spider" className="w-5 h-5 object-contain drop-shadow-sm" />
              The Artist Behind the Stories
            </span>
          </div>

          <div className="overflow-hidden py-2">
            <h2
              ref={titleRef}
              className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter uppercase italic text-gray-900"
              style={{ textShadow: '2px 2px 0px #fca5a5' }}
            >
              Prem Kumar.
            </h2>
          </div>

          <div
            ref={bodyRef}
            className="flex flex-col gap-6 text-gray-700 text-base md:text-lg leading-relaxed max-w-xl font-medium mt-2"
            style={{ perspective: '1000px' }}
          >
            <p className="origin-bottom">
              I'm an artist and visual storyteller driven by curiosity, imagination, and the desire to create stories that make people feel something.
            </p>
            <p className="origin-bottom">
              From portrait art to anime-inspired characters and original worlds, I explore how visuals can communicate emotions, ideas, and experiences beyond words. My goal is to create stories that celebrate freedom, individuality, and the courage to imagine beyond limitations.
            </p>
          </div>

          <div className="mt-6">
            <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-6 font-bold border-b border-gray-300 pb-2 inline-block">
              Creative Focus
            </h3>
            <div ref={pillsRef} className="flex flex-wrap gap-3">
              {STACK.map((tech) => (
                <div
                  key={tech}
                  className="tech-pill px-5 py-2.5 border border-[#a31515]/30 bg-white text-[#a31515] rounded-xl text-sm font-bold tracking-wider hover:bg-[#a31515] hover:text-white hover:border-[#a31515] shadow-sm hover:shadow-[0_8px_20px_rgba(163,21,21,0.3)] transition-colors duration-300 cursor-default"
                >
                  {tech}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 relative flex justify-center items-start min-h-[550px] w-full pt-0">
          <div ref={photoRef} className="flex flex-col items-center z-30 group">
            <div className="w-[2px] h-[200px] md:h-[350px] bg-gradient-to-b from-transparent via-[#a31515]/60 to-[#a31515]" />
            <div className="glow-frame relative w-64 h-64 md:w-[340px] md:h-[340px] rounded-full border-[6px] border-[#a31515] p-2 bg-white shadow-2xl transition-transform duration-500 group-hover:scale-105">
              <img
                src={PROFILE}
                alt="Prem Kumar Profile"
                className="w-full h-full object-cover rounded-full grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
