import type { SVGProps } from 'react';

/**
 * Ícones desenhados inline em SVG.
 * Nenhuma biblioteca de ícones: menos JavaScript, menos requisições.
 * Todos herdam a cor do texto (`currentColor`) e são decorativos por padrão.
 */

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const ChevronDown = (p: IconProps) => (
  <Icon {...p}>
    <path d="m6 9 6 6 6-6" />
  </Icon>
);

export const ChevronLeft = (p: IconProps) => (
  <Icon {...p}>
    <path d="m15 18-6-6 6-6" />
  </Icon>
);

export const ChevronRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="m9 18 6-6-6-6" />
  </Icon>
);

export const ArrowRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
);

export const Menu = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Icon>
);

export const Close = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Icon>
);

export const Check = (p: IconProps) => (
  <Icon {...p}>
    <path d="m4 12.5 5 5L20 6.5" />
  </Icon>
);

export const Calendar = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2.5" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </Icon>
);

export const Users = (p: IconProps) => (
  <Icon {...p}>
    <path d="M16 20v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20" />
    <circle cx="9" cy="7" r="3.2" />
    <path d="M22 20v-1.5a4 4 0 0 0-3-3.87M16.5 4.2a3.2 3.2 0 0 1 0 5.6" />
  </Icon>
);

export const Luggage = (p: IconProps) => (
  <Icon {...p}>
    <rect x="4" y="7" width="16" height="13" rx="2.5" />
    <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M9 11v5M15 11v5" />
  </Icon>
);

export const Gearbox = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="4.6" r="2" />
    <path d="M12 6.6v5.6M5.8 12.2h12.4M5.8 12.2v6.4M12 12.2v6.4M18.2 12.2v6.4" />
  </Icon>
);

export const Fuel = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 20V5.5A2.5 2.5 0 0 1 6.5 3h4A2.5 2.5 0 0 1 13 5.5V20M3 20h11" />
    <path d="M13 9h3.5a2 2 0 0 1 2 2v5.5a1.8 1.8 0 0 0 3.5.6V8.5L19 5.5" />
    <path d="M6.5 7.5h4" />
  </Icon>
);

export const Door = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 21h16M6 21V4.8a1.8 1.8 0 0 1 2.1-1.78l8 1.3A1.8 1.8 0 0 1 17.6 6.1V21" />
    <circle cx="14.4" cy="12.4" r="0.9" fill="currentColor" stroke="none" />
  </Icon>
);

export const Snowflake = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9" />
    <path d="M12 6.4 9.7 4.1M12 6.4l2.3-2.3M12 17.6l-2.3 2.3M12 17.6l2.3 2.3" />
  </Icon>
);

export const MapPin = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.6" />
  </Icon>
);

export const Clock = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5.2l3.2 2" />
  </Icon>
);

export const Shield = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3 5 6v5.5c0 4.4 3 8.2 7 9.5 4-1.3 7-5.1 7-9.5V6l-7-3Z" />
    <path d="m9.2 12 2 2 3.6-3.8" />
  </Icon>
);

export const Sparkle = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3.5 13.7 9l5.5 1.7-5.5 1.7L12 18l-1.7-5.6L4.8 10.7 10.3 9 12 3.5Z" />
  </Icon>
);

export const Route = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="6" cy="18" r="2.6" />
    <circle cx="18" cy="6" r="2.6" />
    <path d="M8.6 18h5.9a3.5 3.5 0 0 0 0-7h-5a3.5 3.5 0 0 1 0-7h5.9" />
  </Icon>
);

export const Alert = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v5.2" />
    <circle cx="12" cy="16.4" r="0.9" fill="currentColor" stroke="none" />
  </Icon>
);

export const Search = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </Icon>
);

export const Filter = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 5.5h18M6.5 12h11M10 18.5h4" />
  </Icon>
);

/** Ícone oficial do WhatsApp (sólido). */
export const WhatsApp = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
    <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.07 2.86 1.22 3.06c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.71 2-1.4.25-.69.25-1.28.17-1.4-.07-.13-.27-.2-.57-.35Z" />
    <path d="M12.04 2C6.6 2 2.18 6.42 2.18 11.86c0 1.74.46 3.44 1.32 4.94L2.1 22l5.34-1.39a9.83 9.83 0 0 0 4.6 1.16h.01c5.43 0 9.85-4.42 9.86-9.86A9.79 9.79 0 0 0 19 4.87 9.78 9.78 0 0 0 12.04 2Zm5.8 15.66a8.2 8.2 0 0 1-11.35 1.1l-.36-.26-3.17.83.85-3.09-.24-.38a8.19 8.19 0 1 1 14.27 1.8Z" />
  </svg>
);

export const Instagram = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
  </Icon>
);
