"use client";

import { useEffect, useRef } from "react";
import { CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";

const TYPE_CONFIG = {
    info: {
        icon: Info,
        iconClass: "text-indigo-600",
        bgClass: "bg-indigo-50",
        btnClass: "bg-indigo-600 hover:bg-indigo-700 text-white",
    },
    success: {
        icon: CheckCircle,
        iconClass: "text-green-600",
        bgClass: "bg-green-50",
        btnClass: "bg-green-600 hover:bg-green-700 text-white",
    },
    error: {
        icon: XCircle,
        iconClass: "text-red-600",
        bgClass: "bg-red-50",
        btnClass: "bg-red-600 hover:bg-red-700 text-white",
    },
    warning: {
        icon: AlertTriangle,
        iconClass: "text-amber-600",
        bgClass: "bg-amber-50",
        btnClass: "bg-amber-500 hover:bg-amber-600 text-white",
    },
};

export default function Modal({
    isOpen,
    onClose,
    title,
    message,
    primaryAction,
    primaryLabel = "OK",
    secondaryAction,
    secondaryLabel,
    type = "info",
}) {
    const modalRef = useRef(null);
    const config = TYPE_CONFIG[type] || TYPE_CONFIG.info;
    const Icon = config.icon;

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape" && isOpen) onClose();
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen && modalRef.current) modalRef.current.focus();
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Card */}
            <div
                ref={modalRef}
                tabIndex={-1}
                className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 outline-none animate-fade-in"
            >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl ${config.bgClass} flex items-center justify-center mx-auto mb-5`}>
                    <Icon className={`w-6 h-6 ${config.iconClass}`} />
                </div>

                {/* Title */}
                {title && (
                    <h2
                        id="modal-title"
                        className="text-lg font-semibold text-gray-900 text-center mb-2"
                    >
                        {title}
                    </h2>
                )}

                {/* Message */}
                <p className="text-sm text-gray-500 text-center whitespace-pre-line leading-relaxed mb-7">
                    {message}
                </p>

                {/* Actions */}
                <div className={`flex gap-3 ${secondaryAction ? '' : 'justify-center'}`}>
                    {secondaryAction && (
                        <button
                            onClick={secondaryAction}
                            className="flex-1 btn btn-secondary"
                        >
                            {secondaryLabel}
                        </button>
                    )}
                    <button
                        onClick={primaryAction || onClose}
                        className={`flex-1 btn font-medium ${config.btnClass} border-transparent rounded-lg`}
                    >
                        {primaryLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
