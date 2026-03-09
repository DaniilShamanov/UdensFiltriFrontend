"use client";

import React from "react";

type NotificationBannerProps = {
  title: string;
  description?: string;
  onDismiss?: () => void;
  className?: string;
};

export default function NotificationBanner({ title, description, onDismiss, className = "" }: NotificationBannerProps) {
  return (
    <div className={`border-t border-primary/20 bg-amber-100/60 px-4 py-2 text-sm text-amber-900 ${className}`} role="status" aria-live="polite">
      <div className="container mx-auto flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold">{title}</p>
          {description ? <p>{description}</p> : null}
        </div>
        {onDismiss ? (
          <button type="button" onClick={onDismiss} className="cursor-pointer font-medium underline">
            Dismiss
          </button>
        ) : null}
      </div>
    </div>
  );
}
