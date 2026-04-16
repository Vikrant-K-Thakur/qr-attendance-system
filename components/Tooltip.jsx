"use client";

import { useState, useRef, useEffect } from "react";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Tooltip({ text, className }) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState("top");
  const ref = useRef(null);

  useEffect(() => {
    if (visible && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      // If too close to top, show below
      setPosition(rect.top < 80 ? "bottom" : "top");
    }
  }, [visible]);

  return (
    <span
      ref={ref}
      className={cn("relative inline-flex items-center", className)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-help transition-colors" />
      {visible && (
        <span
          className={cn(
            "absolute z-50 w-56 rounded-md border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md left-1/2 -translate-x-1/2",
            position === "top" ? "bottom-full mb-2" : "top-full mt-2"
          )}
        >
          {text}
          {/* Arrow */}
          <span className={cn(
            "absolute left-1/2 -translate-x-1/2 border-4 border-transparent",
            position === "top"
              ? "top-full border-t-border -mt-px after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:bottom-[1px] after:border-4 after:border-transparent after:border-t-popover"
              : "bottom-full border-b-border mb-[-1px] after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:top-[1px] after:border-4 after:border-transparent after:border-b-popover"
          )} />
        </span>
      )}
    </span>
  );
}
