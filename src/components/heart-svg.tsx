'use client'

import React from 'react'

export function HeartSVG({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>
      </defs>
      <path
        d="M32 56S6 38 6 20.5C6 12.5 12.5 6 20.5 6c5 0 9.2 2.5 11.5 6.3C34.3 8.5 38.5 6 43.5 6 51.5 6 58 12.5 58 20.5 58 38 32 56 32 56z"
        fill="url(#heartGrad)"
        className="animate-[heartbeat_1.5s_ease-in-out_infinite]"
      />
    </svg>
  )
}

export function PulseHeartSVG({ size = 64, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="pulseHeartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="50%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#B91C1C" />
        </linearGradient>
      </defs>
      <path
        d="M50 85S10 60 10 33C10 20 20 10 33 10c8 0 14 4 17 10 3-6 9-10 17-10 13 0 23 10 23 23 0 27-40 52-40 52z"
        fill="url(#pulseHeartGrad)"
      >
        <animate
          attributeName="d"
          dur="1.2s"
          repeatCount="indefinite"
          values="
            M50 85S10 60 10 33C10 20 20 10 33 10c8 0 14 4 17 10 3-6 9-10 17-10 13 0 23 10 23 23 0 27-40 52-40 52z;
            M50 85S10 60 10 30C10 17 20 7 33 7c8 0 14 4 17 10 3-6 9-10 17-10 13 0 23 10 23 23 0 30-40 55-40 55z;
            M50 85S10 60 10 33C10 20 20 10 33 10c8 0 14 4 17 10 3-6 9-10 17-10 13 0 23 10 23 23 0 27-40 52-40 52z
          "
        />
      </path>
    </svg>
  )
}
