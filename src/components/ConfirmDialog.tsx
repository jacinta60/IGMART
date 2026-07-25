"use client";

import { X, AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  type = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const colors = {
    danger: { bg: "bg-red-600", icon: "bg-red-100 text-red-600" },
    warning: { bg: "bg-amber-600", icon: "bg-amber-100 text-amber-600" },
    info: { bg: "bg-blue-600", icon: "bg-blue-100 text-blue-600" },
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className={`p-4 ${colors[type].icon} flex items-center gap-3`}>
          <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">This action cannot be undone</p>
          </div>
        </div>
        
        <div className="p-6">
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2 ${colors[type].bg} text-white rounded-lg font-medium hover:opacity-90 transition-colors`}
            >
              {confirmText}
            </button>
          </div>
        </div>
        
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    </div>
  );
}
