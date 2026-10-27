import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>
const base = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true }
export const BoltIcon = (props: IconProps) => <svg {...base} {...props}><path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z" /></svg>
export const CalendarIcon = (props: IconProps) => <svg {...base} {...props}><path d="M8 2v4M16 2v4M3 9h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z" /></svg>
export const HistoryIcon = (props: IconProps) => <svg {...base} {...props}><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5M12 7v5l3 2" /></svg>
export const SettingsIcon = (props: IconProps) => <svg {...base} {...props}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" /></svg>
export const ArrowIcon = (props: IconProps) => <svg {...base} {...props}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
export const CheckIcon = (props: IconProps) => <svg {...base} {...props}><path d="m5 12 4 4L19 6" /></svg>
export const PlayIcon = (props: IconProps) => <svg {...base} {...props}><path d="m8 5 11 7-11 7V5Z" /></svg>
export const PauseIcon = (props: IconProps) => <svg {...base} {...props}><path d="M8 5v14M16 5v14" /></svg>
export const CloudIcon = (props: IconProps) => <svg {...base} {...props}><path d="M17.5 19H6a4 4 0 0 1-.5-8A6.5 6.5 0 0 1 18 9a5 5 0 0 1-.5 10Z" /></svg>
export const ShieldIcon = (props: IconProps) => <svg {...base} {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-5" /></svg>
