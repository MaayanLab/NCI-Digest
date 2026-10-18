import React from "react"

const CELL = "/cells/cancer-cell.jpg"

const CELLS = [
  { top: "4%", left: "6%", width: "40vw", max: 540, anim: "cell-drift-a", duration: "28s", opacity: 0.95, z: 2 },
  { top: "8%", left: "52%", width: "36vw", max: 500, anim: "cell-drift-c", duration: "32s", opacity: 0.75, z: 1 },
  { top: "48%", left: "38%", width: "30vw", max: 400, anim: "cell-drift-b", duration: "26s", opacity: 0.6, z: 1 },
  { top: "52%", left: "8%", width: "26vw", max: 340, anim: "cell-drift-c", duration: "34s", opacity: 0.5, z: 0 },
  { top: "58%", left: "68%", width: "22vw", max: 280, anim: "cell-drift-a", duration: "24s", opacity: 0.45, z: 0 },
]

const ANTIBODIES = [
  { top: "22%", left: "44%", size: 16, color: "#fb7185", duration: "16s" },
  { top: "36%", left: "78%", size: 24, color: "#e879f9", duration: "22s" },
  { top: "64%", left: "30%", size: 14, color: "#f472b6", duration: "18s" },
  { top: "18%", left: "14%", size: 12, color: "#f9a8d4", duration: "20s" },
]

export default function CellVideoBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0b2438]" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#1a3a5c_0%,_#0b2438_55%,_#07151f_100%)]" />
      {CELLS.map((cell, index) => (
        <img
          key={index}
          src={CELL}
          alt=""
          className="absolute pointer-events-none select-none will-change-transform"
          style={{
            top: cell.top,
            left: cell.left,
            width: cell.width,
            maxWidth: cell.max,
            opacity: cell.opacity,
            zIndex: cell.z,
            mixBlendMode: "screen",
            WebkitMaskImage: "radial-gradient(ellipse 72% 70% at 50% 50%, #000 52%, transparent 78%)",
            maskImage: "radial-gradient(ellipse 72% 70% at 50% 50%, #000 52%, transparent 78%)",
            animation: `${cell.anim} ${cell.duration} ease-in-out infinite`,
          }}
        />
      ))}
      {ANTIBODIES.map((dot, index) => (
        <span
          key={`ab-${index}`}
          className="absolute rounded-full will-change-transform"
          style={{
            top: dot.top,
            left: dot.left,
            width: dot.size,
            height: dot.size,
            background: `radial-gradient(circle at 30% 30%, #fecdd3, ${dot.color} 55%, transparent 72%)`,
            animation: `cell-drift-c ${dot.duration} ease-in-out infinite`,
          }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/40 to-[#07151f]" />
    </div>
  )
}
