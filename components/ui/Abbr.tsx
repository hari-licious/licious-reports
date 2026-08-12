"use client";
import { useRef, useState } from "react";

export function Abbr({ children, tip, align }: {
  children: React.ReactNode;
  tip: string;
  align?: "left" | "center" | "right";
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [autoPos, setAutoPos] = useState<"left" | "center" | "right">("center");

  const handleMouseEnter = () => {
    if (align || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const mid = rect.left + rect.width / 2;
    const vw = window.innerWidth;
    // w-48 = 192px; keep 8px away from viewport edge
    if (mid - 96 < 8) setAutoPos("left");
    else if (mid + 96 > vw - 8) setAutoPos("right");
    else setAutoPos("center");
  };

  const pos = align ?? autoPos;
  const posClass =
    pos === "left"  ? "left-0" :
    pos === "right" ? "right-0" :
    "left-1/2 -translate-x-1/2";

  return (
    <span ref={ref} onMouseEnter={handleMouseEnter} className="relative inline-block group">
      <span className="border-b border-dotted border-gray-400 cursor-help">
        {children}
      </span>
      <span className={`pointer-events-none absolute bottom-full ${posClass} z-50 mb-2 w-48 rounded-lg bg-gray-900 px-3 py-2 text-center text-xs leading-relaxed text-white opacity-0 transition-opacity group-hover:opacity-100 shadow-lg`}>
        {tip}
      </span>
    </span>
  );
}
