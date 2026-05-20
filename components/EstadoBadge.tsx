type Props = { estado: string }

const MAP: Record<string, [string, string]> = {
  completada:  ['badge-green', 'Completada'],
  'en-proceso': ['badge-blue', 'En proceso'],
  pendiente:   ['badge-gray', 'Pendiente'],
  retrasada:   ['badge-red', 'Retrasada'],
  cancelada:   ['badge-gray', 'Cancelada'],
  pagada:      ['badge-green', 'Pagada'],
}

export function EstadoBadge({ estado }: Props) {
  const [cls, label] = MAP[estado] ?? ['badge-gray', estado]
  return <span className={'badge ' + cls}>{label}</span>
}
