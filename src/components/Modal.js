"use client";

import { useEffect, useRef } from "react";

export default function Modal({
    isOpen,
    onClose,
    title,
    message,
    primaryAction,
    primaryLabel = "OK",
    secondaryAction,
    secondaryLabel,
    type = "info", // 'info', 'success', 'error', 'warning'
}) {
    const modalRef = useRef(null);

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    // Focus trap
    useEffect(() => {
        if (isOpen && modalRef.current) {
            modalRef.current.focus();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const typeStyles = {
        info: "bg-indigo-100 text-indigo-600",
        success: "bg-green-100 text-green-600",
        error: "bg-red-100 text-red-600",
        warning: "bg-amber-100 text-amber-600",
    };

    const typeIcons = {
        info: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        success: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        error: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        warning: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        ),
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/40 animate-[fadeIn_250ms_ease-out]"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                ref={modalRef}
                tabIndex={-1}
                className="relative bg-white rounded-2xl shadow-xl max-w-md w-[90%] mx-4 p-6 animate-[modalIn_250ms_ease-out]"
            >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${typeStyles[type]}`}>
                    {typeIcons[type]}
                </div>

                {/* Title */}
                {title && (
                    <h2
                        id="modal-title"
                        className="text-xl font-semibold text-slate-800 text-center mb-3"
                    >
                        {title}
                    </h2>
                )}

                {/* Message */}
                <p className="text-gray-600 text-center whitespace-pre-line mb-6">
                    {message}
                </p>

                {/* Actions */}
                <div className={`flex gap-3 ${secondaryAction ? 'justify-between' : 'justify-center'}`}>
                    {secondaryAction && (
                        <button
                            onClick={secondaryAction}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                        >
                            {secondaryLabel}
                        </button>
                    )}
                    <button
                        onClick={primaryAction || onClose}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
                    >
                        {primaryLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
