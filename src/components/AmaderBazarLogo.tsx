import React from 'react';

interface AmaderBazarLogoProps {
  className?: string;
  size?: number | string;
  variant?: 'full' | 'icon' | 'horizontal';
  showText?: boolean;
}

export const AmaderBazarLogo: React.FC<AmaderBazarLogoProps> = ({
  className = '',
  size = 48,
  variant = 'icon',
  showText = false,
}) => {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Official Business Vector Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-md"
      >
        <defs>
          {/* Bag Gradient (Warm Amber to Deep Orange) */}
          <linearGradient id="abBagGrad" x1="40" y1="20" x2="130" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="35%" stopColor="#f59e0b" />
            <stop offset="85%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#c2410c" />
          </linearGradient>

          {/* Bag Shadow/Glow */}
          <linearGradient id="abBagInner" x1="70" y1="30" x2="110" y2="110" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0.2" />
          </linearGradient>

          {/* Magnifier Rim Gradient (Deep Blue/Teal) */}
          <linearGradient id="abMagRim" x1="50" y1="40" x2="130" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="40%" stopColor="#0e7490" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Magnifier Lens Interior Light */}
          <radialGradient id="abLensLight" cx="75" cy="75" r="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.95" />
          </radialGradient>

          {/* Letter 'A' Gradient */}
          <linearGradient id="abLetterA" x1="60" y1="50" x2="95" y2="105" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#082f49" />
            <stop offset="40%" stopColor="#0e7490" />
            <stop offset="100%" stopColor="#042f2e" />
          </linearGradient>

          {/* Gold Text Gradient */}
          <linearGradient id="abGoldText" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>

        {/* 1. Speed lines on left (Speed/Delivery) */}
        <g stroke="#f59e0b" strokeWidth="4.5" strokeLinecap="round">
          <line x1="22" y1="62" x2="44" y2="62" />
          <line x1="18" y1="74" x2="40" y2="74" />
          <line x1="25" y1="86" x2="42" y2="86" />
        </g>

        {/* 2. Top-Right Cart/Bag Handle extension */}
        <path
          d="M102 38 L118 36 L124 58"
          stroke="#f59e0b"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 3. Shopping Bag Main Body */}
        <path
          d="M52 42 C52 38 55 35 59 35 L101 35 C105 35 108 38 108 42 L118 108 C118.5 113 115 117 110 117 L50 117 C45 117 41.5 113 42 108 Z"
          fill="url(#abBagGrad)"
          stroke="#b45309"
          strokeWidth="1.5"
        />

        {/* Bag Handles (Dual Curved Top Handles) */}
        <path
          d="M68 36 C68 22 92 22 92 36"
          fill="none"
          stroke="#78350f"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M72 36 C72 26 88 26 88 36"
          fill="none"
          stroke="#fbbf24"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Bag Inner Highlight / Shimmer */}
        <path
          d="M58 44 L102 44 L110 102 C100 108 60 108 50 102 Z"
          fill="url(#abBagInner)"
        />

        {/* 4. Magnifying Glass Rim (Outer Dark Blue Ring) */}
        <circle
          cx="76"
          cy="76"
          r="34"
          fill="url(#abLensLight)"
          stroke="url(#abMagRim)"
          strokeWidth="8.5"
        />

        {/* Magnifying Glass Inner Rim Highlight */}
        <circle
          cx="76"
          cy="76"
          r="29.5"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="1"
          strokeOpacity="0.4"
        />

        {/* 5. Letter 'A' Graphic inside the Glass */}
        <g fill="url(#abLetterA)">
          {/* Left leg of A */}
          <path d="M76 52 L62 98 L70 98 L73.5 86 L78.5 86 L82 98 L90 98 L76 52 Z M76 65 L77.5 80 L74.5 80 Z" />
          {/* Modern 3D Facet on A */}
          <path
            d="M76 52 L76 65 L77.5 80 L82 80 L80 72 Z"
            fill="#0284c7"
            fillOpacity="0.3"
          />
        </g>

        {/* 6. Magnifying Glass Handle (Angled down-right) */}
        <path
          d="M100 100 L120 120"
          stroke="url(#abMagRim)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Handle tip grip details */}
        <path
          d="M112 112 L120 120"
          stroke="#38bdf8"
          strokeWidth="4"
          strokeLinecap="round"
          strokeOpacity="0.8"
        />

        {/* Dynamic Light Sparkle / Lens Reflection */}
        <path
          d="M58 60 A24 24 0 0 1 76 54"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeOpacity="0.7"
        />
      </svg>

      {/* Horizontal or Full Text Branding if requested */}
      {(showText || variant === 'full' || variant === 'horizontal') && (
        <div className="flex flex-col">
          <span className="font-['Outfit',sans-serif] font-black text-xl md:text-2xl text-amber-400 tracking-wider leading-none drop-shadow uppercase">
            AMADER BAZAR
          </span>
          <span className="text-[10px] md:text-[11.5px] font-semibold text-slate-200 italic tracking-widest mt-1">
            BEST DEALS. SMART SHOPPING.
          </span>
        </div>
      )}
    </div>
  );
};
