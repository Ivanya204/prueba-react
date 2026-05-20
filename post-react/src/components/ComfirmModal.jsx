import { useRef, useEffect } from 'react'
const ConfirmModal = ({ title, message, onConfirm, onCancel, isOpen = false, isDangerous = false }) => {
    const overlayRef = useRef(null)
    useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel && onCancel()
    }

    if (isOpen) {
      window.addEventListener('keydown', onKey)
    }

    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onCancel])

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      onCancel && onCancel()
    }
  }
  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      onMouseDown={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
      aria-modal="true"
      role="dialog"
    >
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-lg ring-1 ring-slate-200">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm text-slate-600">{message}</p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => onCancel && onCancel()}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={() => onConfirm && onConfirm()}
            className={`rounded-2xl px-4 py-2 text-sm font-semibold text-white transition ${
              isDangerous
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-indigo-600 hover:bg-indigo-500'
            }`}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal