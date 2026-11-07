type SpeakerIconProps = {
  /** Width and height in pixels. */
  size: number;
  /** Shows a cross instead of sound waves, for a sound that can't play. */
  muted?: boolean;
};

/** A speaker drawn in the current text color. Decorative: label its button instead. */
export default function SpeakerIcon({size, muted = false}: SpeakerIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M3 9.5v5a1 1 0 0 0 1 1h3l4.3 3.6a1 1 0 0 0 1.7-.8V5.7a1 1 0 0 0-1.7-.8L7 8.5H4a1 1 0 0 0-1 1Z" />
      <path
        d={
          muted
            ? 'M16 9.5l5 5M21 9.5l-5 5'
            : 'M16 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13'
        }
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
