'use client'
import { Modal } from './Modal'

type Props = {
  message?: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export function ConfirmDialog({ message = '¿Estás seguro? Esta acción no se puede deshacer.', onConfirm, onCancel, loading }: Props) {
  return (
    <Modal
      title="Confirmar eliminación"
      onClose={onCancel}
      footer={
        <>
          <button className="btn" onClick={onCancel} disabled={loading}>Cancelar</button>
          <button className="btn" style={{ background: 'var(--zm-red)', borderColor: 'var(--zm-red)', color: '#fff' }} onClick={onConfirm} disabled={loading}>
            {loading ? 'Eliminando…' : 'Eliminar'}
          </button>
        </>
      }
    >
      <p style={{ margin: 0, color: 'var(--zm-text-2)' }}>{message}</p>
    </Modal>
  )
}
