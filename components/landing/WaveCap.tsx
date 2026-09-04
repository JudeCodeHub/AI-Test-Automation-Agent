type Props = {
  position: "top" | "bottom"
  fill: string
}

/**
 * A curved wedge that sits flush against a section's own background (zero
 * gap - same fill color) and fades to transparent on its curved edge, so the
 * section appears to grow out of / melt back into the page instead of
 * showing a hard rectangular seam.
 */
export default function WaveCap({ position, fill }: Props) {
  const d =
    position === "top"
      ? "M0,120 L0,40 C260,100 1180,100 1440,40 L1440,120 Z"
      : "M0,0 L1440,0 L1440,80 C1180,20 260,20 0,80 Z"

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute left-0 h-16 w-full md:h-20 ${
        position === "top" ? "top-0 -translate-y-full" : "bottom-0 translate-y-full"
      }`}
    >
      <path d={d} fill={fill} />
    </svg>
  )
}
