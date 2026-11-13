import { useState, useRef, useEffect, useCallback } from 'react'

export default function JoystickController({
  stickPos,
  setStickPos,
  gear5Pos,
  setGear5Pos,
  fruitPos,
  setFruitPos,
}) {
  const [isOpen, setIsOpen] = useState(true)
  const [activeTarget, setActiveTarget] = useState('stick') // 'stick' | 'gear5' | 'fruit'
  const [stepSize, setStepSize] = useState(2)
  const [copied, setCopied] = useState(false)

  // Floating window position (draggable)
  const [panelPos, setPanelPos] = useState(() => {
    return { x: 24, y: 100 }
  })
  const panelRef = useRef(null)
  const isDraggingPanel = useRef(false)
  const panelDragOffset = useRef({ x: 0, y: 0 })

  // Current selected position & updater
  const currentPos =
    activeTarget === 'stick'
      ? stickPos
      : activeTarget === 'gear5'
      ? gear5Pos
      : fruitPos

  const updateCurrentPos = useCallback(
    (updater) => {
      if (activeTarget === 'stick') {
        setStickPos((prev) => {
          const next = typeof updater === 'function' ? updater(prev) : updater
          try {
            localStorage.setItem('anime_project_stick_pos', JSON.stringify(next))
          } catch {}
          return next
        })
      } else if (activeTarget === 'gear5') {
        setGear5Pos((prev) => {
          const next = typeof updater === 'function' ? updater(prev) : updater
          try {
            localStorage.setItem('anime_project_gear5_pos', JSON.stringify(next))
          } catch {}
          return next
        })
      } else {
        setFruitPos((prev) => {
          const next = typeof updater === 'function' ? updater(prev) : updater
          try {
            localStorage.setItem('anime_project_fruit_pos', JSON.stringify(next))
          } catch {}
          return next
        })
      }
    },
    [activeTarget, setStickPos, setGear5Pos, setFruitPos]
  )

  // Virtual Joystick mechanics
  const joystickBaseRef = useRef(null)
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 })
  const isJoystickActive = useRef(false)
  const joystickVector = useRef({ x: 0, y: 0 })
  const animFrameId = useRef(null)
  const MAX_RADIUS = 42

  const updateLoop = useCallback(() => {
    if (!isJoystickActive.current) return

    const { x: vx, y: vy } = joystickVector.current
    if (Math.abs(vx) > 0.05 || Math.abs(vy) > 0.05) {
      const speedMultiplier = 0.12 * stepSize
      const dx = vx * speedMultiplier
      const dy = vy * speedMultiplier

      updateCurrentPos((prev) => ({
        ...prev,
        x: Math.round((prev.x + dx) * 10) / 10,
        y: Math.round((prev.y + dy) * 10) / 10,
      }))
    }

    animFrameId.current = requestAnimationFrame(updateLoop)
  }, [stepSize, updateCurrentPos])

  const handleJoystickPointerDown = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const target = e.currentTarget
    target.setPointerCapture(e.pointerId)
    isJoystickActive.current = true

    const rect = target.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const clientX = e.clientX
    const clientY = e.clientY

    let dx = clientX - centerX
    let dy = clientY - centerY
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist > MAX_RADIUS) {
      dx = (dx / dist) * MAX_RADIUS
      dy = (dy / dist) * MAX_RADIUS
    }

    setKnobPos({ x: dx, y: dy })
    joystickVector.current = { x: dx, y: dy }

    cancelAnimationFrame(animFrameId.current)
    animFrameId.current = requestAnimationFrame(updateLoop)
  }

  const handleJoystickPointerMove = (e) => {
    if (!isJoystickActive.current) return
    e.preventDefault()
    const target = joystickBaseRef.current
    if (!target) return

    const rect = target.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    let dx = e.clientX - centerX
    let dy = e.clientY - centerY
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist > MAX_RADIUS) {
      dx = (dx / dist) * MAX_RADIUS
      dy = (dy / dist) * MAX_RADIUS
    }

    setKnobPos({ x: dx, y: dy })
    joystickVector.current = { x: dx, y: dy }
  }

  const handleJoystickPointerUp = (e) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {}
    isJoystickActive.current = false
    joystickVector.current = { x: 0, y: 0 }
    setKnobPos({ x: 0, y: 0 })
    cancelAnimationFrame(animFrameId.current)
  }

  // D-Pad single nudge
  const nudge = (dx, dy) => {
    updateCurrentPos((prev) => ({
      ...prev,
      x: prev.x + dx * stepSize,
      y: prev.y + dy * stepSize,
    }))
  }

  // Draggable panel header
  const handlePanelHeaderDown = (e) => {
    if (e.target.closest('button')) return
    isDraggingPanel.current = true
    panelDragOffset.current = {
      x: e.clientX - panelPos.x,
      y: e.clientY - panelPos.y,
    }
  }

  useEffect(() => {
    const onMove = (e) => {
      if (!isDraggingPanel.current) return
      setPanelPos({
        x: Math.max(10, Math.min(window.innerWidth - 340, e.clientX - panelDragOffset.current.x)),
        y: Math.max(10, Math.min(window.innerHeight - 450, e.clientY - panelDragOffset.current.y)),
      })
    }
    const onUp = () => {
      isDraggingPanel.current = false
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      cancelAnimationFrame(animFrameId.current)
    }
  }, [])

  const copyConfig = () => {
    const config = `// Aligned Coordinates for Projects.jsx:
const DEFAULT_STICK_POS = ${JSON.stringify(stickPos, null, 2)};
const DEFAULT_GEAR5_POS = ${JSON.stringify(gear5Pos, null, 2)};
const DEFAULT_FRUIT_POS = ${JSON.stringify(fruitPos, null, 2)};`
    navigator.clipboard?.writeText(config)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const resetTarget = () => {
    if (activeTarget === 'stick') {
      updateCurrentPos({ x: 7, y: 33, scale: 0.86, zIndex: 20 })
    } else if (activeTarget === 'gear5') {
      updateCurrentPos({ x: 0, y: 0, scale: 1 })
    } else {
      updateCurrentPos({ x: 0, y: 0, scale: 1, opacity: 0.04 })
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#a31515] hover:bg-[#851010] text-white px-4 py-2.5 rounded-full shadow-2xl font-bold text-xs uppercase tracking-wider cursor-pointer border border-white/20 transition-all hover:scale-105"
        title="Open Alignment Joystick"
      >
        <span className="text-base">🕹️</span>
        <span>Align Joystick</span>
      </button>
    )
  }

  return (
    <div
      ref={panelRef}
      style={{
        left: `${panelPos.x}px`,
        top: `${panelPos.y}px`,
      }}
      className="fixed z-50 w-80 bg-neutral-900/95 backdrop-blur-md text-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-red-500/30 overflow-hidden font-sans select-none"
    >
      {/* Header (Draggable Handle) */}
      <div
        onPointerDown={handlePanelHeaderDown}
        className="bg-neutral-950/80 px-4 py-2.5 flex items-center justify-between cursor-move border-b border-white/10"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">🕹️</span>
          <span className="font-extrabold text-xs uppercase tracking-wider text-red-400">
            Joystick Alignment Tool
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsOpen(false)}
            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white rounded hover:bg-white/10 transition-colors text-xs font-bold"
            title="Minimize"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="p-3.5 flex flex-col gap-3">
        {/* Target Switcher Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTarget('stick')}
            className={`py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
              activeTarget === 'stick'
                ? 'bg-[#a31515] text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            Luffy Stick
          </button>
          <button
            onClick={() => setActiveTarget('gear5')}
            className={`py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
              activeTarget === 'gear5'
                ? 'bg-[#a31515] text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            Gear 5
          </button>
          <button
            onClick={() => setActiveTarget('fruit')}
            className={`py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
              activeTarget === 'fruit'
                ? 'bg-[#a31515] text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            BG Fruit
          </button>
        </div>

        {/* Joystick & D-Pad Section */}
        <div className="flex items-center justify-between gap-2 bg-neutral-950/60 p-3 rounded-xl border border-white/5">
          {/* Virtual Joystick */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">
              Analog Stick
            </span>
            <div
              ref={joystickBaseRef}
              onPointerDown={handleJoystickPointerDown}
              onPointerMove={handleJoystickPointerMove}
              onPointerUp={handleJoystickPointerUp}
              className="relative w-28 h-28 rounded-full bg-gradient-to-b from-neutral-800 to-neutral-950 border-2 border-red-500/40 shadow-inner flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
            >
              {/* Center Crosshairs */}
              <div className="absolute w-full h-[1px] bg-white/10" />
              <div className="absolute h-full w-[1px] bg-white/10" />
              <div className="absolute w-12 h-12 rounded-full border border-white/5 pointer-events-none" />

              {/* Joystick Thumb Knob */}
              <div
                style={{
                  transform: `translate3d(${knobPos.x}px, ${knobPos.y}px, 0)`,
                  transition: isJoystickActive.current ? 'none' : 'transform 0.15s ease-out',
                }}
                className="w-12 h-12 rounded-full bg-gradient-to-b from-red-600 to-red-800 border-2 border-red-300 shadow-[0_4px_12px_rgba(239,68,68,0.5)] flex items-center justify-center pointer-events-none"
              >
                <div className="w-4 h-4 rounded-full bg-red-400/80 shadow-inner" />
              </div>
            </div>
          </div>

          {/* D-Pad Buttons */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">
              D-Pad (Nudge)
            </span>
            <div className="grid grid-cols-3 gap-1 w-24">
              <div />
              <button
                onClick={() => nudge(0, -1)}
                className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-red-700 active:scale-95 text-xs font-black flex items-center justify-center border border-white/10 transition-colors"
              >
                ▲
              </button>
              <div />

              <button
                onClick={() => nudge(-1, 0)}
                className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-red-700 active:scale-95 text-xs font-black flex items-center justify-center border border-white/10 transition-colors"
              >
                ◄
              </button>
              <button
                onClick={resetTarget}
                title="Reset to 0,0"
                className="w-7 h-7 rounded-lg bg-red-950/80 hover:bg-red-800 active:scale-95 text-[9px] font-bold text-red-300 flex items-center justify-center border border-red-500/40 transition-colors"
              >
                ●
              </button>
              <button
                onClick={() => nudge(1, 0)}
                className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-red-700 active:scale-95 text-xs font-black flex items-center justify-center border border-white/10 transition-colors"
              >
                ►
              </button>

              <div />
              <button
                onClick={() => nudge(0, 1)}
                className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-red-700 active:scale-95 text-xs font-black flex items-center justify-center border border-white/10 transition-colors"
              >
                ▼
              </button>
              <div />
            </div>

            {/* Step size pills */}
            <div className="flex gap-1 mt-1">
              {[1, 5, 20].map((sz) => (
                <button
                  key={sz}
                  onClick={() => setStepSize(sz)}
                  className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                    stepSize === sz
                      ? 'bg-red-600 text-white'
                      : 'bg-neutral-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {sz}px
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sliders & Values */}
        <div className="flex flex-col gap-2 bg-black/40 p-2.5 rounded-xl border border-white/5 text-xs">
          {/* Scale */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] uppercase font-bold text-gray-400 w-12">
              Scale
            </span>
            <input
              type="range"
              min="0.2"
              max="2.5"
              step="0.02"
              value={currentPos.scale || 1}
              onChange={(e) =>
                updateCurrentPos((prev) => ({
                  ...prev,
                  scale: parseFloat(e.target.value),
                }))
              }
              className="flex-1 accent-red-600 h-1.5 bg-neutral-800 rounded cursor-pointer"
            />
            <span className="font-mono text-[10px] w-10 text-right text-red-300">
              {(currentPos.scale || 1).toFixed(2)}x
            </span>
          </div>

          {/* Coordinates readout */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-gray-500">X:</span>
              <input
                type="number"
                value={Math.round(currentPos.x || 0)}
                onChange={(e) =>
                  updateCurrentPos((prev) => ({
                    ...prev,
                    x: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full bg-neutral-800 border border-white/10 rounded px-1.5 py-0.5 font-mono text-[11px] text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-gray-500">Y:</span>
              <input
                type="number"
                value={Math.round(currentPos.y || 0)}
                onChange={(e) =>
                  updateCurrentPos((prev) => ({
                    ...prev,
                    y: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full bg-neutral-800 border border-white/10 rounded px-1.5 py-0.5 font-mono text-[11px] text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Z-Index toggle for Luffy Stick */}
          {activeTarget === 'stick' && (
            <div className="flex items-center justify-between pt-1 border-t border-white/5">
              <span className="text-[10px] font-bold text-gray-400">Layer Order:</span>
              <button
                onClick={() =>
                  updateCurrentPos((prev) => ({
                    ...prev,
                    zIndex: prev.zIndex === 0 ? 20 : 0,
                  }))
                }
                className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border transition-colors ${
                  (currentPos.zIndex ?? 20) > 10
                    ? 'bg-red-950/80 border-red-500/40 text-red-300'
                    : 'bg-neutral-800 border-white/10 text-gray-300'
                }`}
              >
                {(currentPos.zIndex ?? 20) > 10 ? 'Front (z:20)' : 'Behind Title (z:0)'}
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={copyConfig}
            className="flex-1 bg-red-600 hover:bg-red-700 active:scale-95 text-white py-1.5 px-3 rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <span>{copied ? '✓ Copied Config!' : '📋 Copy Position Code'}</span>
          </button>
          <button
            onClick={resetTarget}
            className="bg-neutral-800 hover:bg-neutral-700 text-gray-300 py-1.5 px-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}
