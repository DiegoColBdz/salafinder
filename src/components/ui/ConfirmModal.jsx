import Modal from './Modal'

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = '¿Estás seguro?',
    message,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    danger = false,
}) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            footer={
                <>
                    <button onClick={onClose} className="btn-secondary">
                        {cancelLabel}
                    </button>
                    <button
                        onClick={() => { onConfirm(); onClose() }}
                        className={danger ? 'btn-danger' : 'btn-primary'}
                        autoFocus
                    >
                        {confirmLabel}
                    </button>
                </>
            }
        >
            <p className="text-sm text-gray-600">{message}</p>
        </Modal>
    )
}
