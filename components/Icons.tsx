type IconProps = { size?: number }

const Ic = ({ d, size = 18 }: { d: string | string[]; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
)

export const Icons = {
  dashboard: ({ size = 18 }: IconProps) => <Ic size={size} d={["M4 13h6V4H4z","M14 20h6v-9h-6z","M4 20h6v-4H4z","M14 8h6V4h-6z"]} />,
  calendar:  ({ size = 18 }: IconProps) => <Ic size={size} d={["M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z","M16 3v4","M8 3v4","M4 11h16","M8 15h2v2H8z"]} />,
  users:     ({ size = 18 }: IconProps) => <Ic size={size} d={["M9 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0","M3 21v-2a4 4 0 0 1 4-4h4","M16 3.13a4 4 0 0 1 0 7.75","M21 21v-2a4 4 0 0 0-3-3.85"]} />,
  paw:       ({ size = 18 }: IconProps) => <Ic size={size} d={["M14.7 13.6a3.5 3.5 0 0 1 1.3-.6c2-.3 4 1.4 4.5 3.7s-.7 4.4-2.7 4.7c-2 .3-3.4-2-5.7-2s-3.8 2.3-5.8 2c-2-.3-3.2-2.4-2.7-4.7s2.5-4 4.5-3.7c.5.1 1 .3 1.3.6","M9 6.5a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0","M19 6.5a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0","M16 11a2 2 0 1 0-4 0 2 2 0 0 0 4 0","M11 11a2 2 0 1 0-4 0 2 2 0 0 0 4 0"]} />,
  history:   ({ size = 18 }: IconProps) => <Ic size={size} d={["M12 8v4l3 2","M3.05 11a9 9 0 1 1 .5 4","M3 4v5h5"]} />,
  invoice:   ({ size = 18 }: IconProps) => <Ic size={size} d={["M5 3h14v18l-3-2-3 2-3-2-3 2-2-2z","M9 7h6","M9 11h6","M9 15h4"]} />,
  package:   ({ size = 18 }: IconProps) => <Ic size={size} d={["M3 7l9-4 9 4","M3 7v10l9 4 9-4V7","M3 7l9 4 9-4","M12 11v10"]} />,
  search:    ({ size = 18 }: IconProps) => <Ic size={size} d={["M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14","M21 21l-6-6"]} />,
  plus:      ({ size = 18 }: IconProps) => <Ic size={size} d={["M12 5v14","M5 12h14"]} />,
  close:     ({ size = 18 }: IconProps) => <Ic size={size} d={["M18 6L6 18","M6 6l12 12"]} />,
  bot:       ({ size = 18 }: IconProps) => <Ic size={size} d={["M12 2v2","M5 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2","M9 13v.01","M15 13v.01","M9 17h6"]} />,
  bell:      ({ size = 18 }: IconProps) => <Ic size={size} d={["M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9","M10 21a2 2 0 0 0 4 0"]} />,
  alert:     ({ size = 18 }: IconProps) => <Ic size={size} d={["M12 9v4","M12 17v.01","M5.07 19h13.86a2 2 0 0 0 1.74-3L13.74 4a2 2 0 0 0-3.48 0L3.33 16a2 2 0 0 0 1.74 3"]} />,
  clock:     ({ size = 18 }: IconProps) => <Ic size={size} d={["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18","M12 7v5l3 2"]} />,
  check:     ({ size = 18 }: IconProps) => <Ic size={size} d={["M5 12l5 5L20 7"]} />,
  phone:     ({ size = 18 }: IconProps) => <Ic size={size} d={["M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"]} />,
  cash:      ({ size = 18 }: IconProps) => <Ic size={size} d={["M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z","M12 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4","M6 9v.01","M18 15v.01"]} />,
  filter:    ({ size = 18 }: IconProps) => <Ic size={size} d={["M4 4h16l-6 8v6l-4 2v-8z"]} />,
  menu:      ({ size = 18 }: IconProps) => <Ic size={size} d={["M4 6h16","M4 12h16","M4 18h16"]} />,
  chevron:   ({ size = 18 }: IconProps) => <Ic size={size} d={["M9 6l6 6-6 6"]} />,
  trash:     ({ size = 18 }: IconProps) => <Ic size={size} d={["M4 7h16","M10 11v6","M14 11v6","M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12","M9 7V4h6v3"]} />,
  edit:      ({ size = 18 }: IconProps) => <Ic size={size} d={["M7 7H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-1","M20.385 6.585a2.1 2.1 0 0 0-2.97-2.97L9 12v3h3z","M16 5l3 3"]} />,
  trend:     ({ size = 18 }: IconProps) => <Ic size={size} d={["M3 17l6-6 4 4 8-8","M14 7h7v7"]} />,
}
