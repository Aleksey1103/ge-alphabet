type IconButtonProps = {
  icon: 'close' | 'back';
  /** The button's accessible name, since it shows only an icon. */
  label: string;
  onClick: () => void;
};

const ICON_PATHS = {
  close: 'M6 6l12 12M18 6L6 18',
  back: 'M15 5l-7 7 7 7',
};

/** A round, icon-only button for a screen's header, such as Exit or Back. */
export default function IconButton({icon, label, onClick}: IconButtonProps) {
  return (
    <button
      type="button"
      className="grid size-touch place-items-center rounded-full bg-surface
        text-muted"
      onClick={onClick}
      aria-label={label}
    >
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path
          d={ICON_PATHS[icon]}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
