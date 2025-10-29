import React from 'react'

interface ToastProps {
    message: string
    type?: 'info' | 'success' | 'error'
    onClose?: () => void
}

export default function Toast({ message, type = 'info', onClose }: ToastProps) {
    const bg = type === 'error' ? 'bg-red-600' : type === 'success' ? 'bg-green-600' : 'bg-blue-600'
    return (
        <div className="fixed top-4 right-4 z-50">
            <div className={`${bg} text-white px-4 py-3 rounded-lg shadow-md max-w-sm`} role="alert">
                <div className="flex items-start justify-between">
                    <div className="mr-3">{message}</div>
                    <button aria-label="Dismiss" onClick={onClose} className="opacity-90 hover:opacity-100">
                        ✕
                    </button>
                </div>
            </div>
        </div>
    )
}
