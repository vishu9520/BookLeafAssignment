import React from 'react';

export default function BookLeafLogo({ className = "w-10 h-10", withText = false, subtitle = "Publishing" }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`relative flex-shrink-0 ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Back Cover / Hardcover Shadow (Crimson #ba2c43) */}
          <path d="M23 23 H78 V78 H25 L23 76 Z" fill="#ba2c43" />
          {/* Paper Pages Block (White #ffffff) */}
          <path d="M23 23 H75 V75 H23 Z" fill="#ffffff" />
          {/* Front Cover (BookLeaf Coral Pink #eb5467) */}
          <rect x="20" y="20" width="53" height="53" rx="1.5" fill="#eb5467" />
          {/* White Diagonal Slash (/) */}
          <line x1="42.5" y1="63.5" x2="54.5" y2="33.5" stroke="#ffffff" stroke-width="4.8" stroke-linecap="round" />
        </svg>
      </div>

      {withText && (
        <div className="leading-tight">
          <div className="flex items-baseline gap-1.5">
            <span className="font-extrabold text-lg text-slate-900 tracking-tight">BookLeaf</span>
            <span className="text-xs font-bold text-rose-600 tracking-wide uppercase">{subtitle}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium tracking-wider block">www.bookleafpub.in</span>
        </div>
      )}
    </div>
  );
}
