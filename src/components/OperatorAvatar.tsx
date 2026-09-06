import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';

interface OperatorAvatarProps {
  photoUrl?: string;
  name?: string;
  callsign?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showStatus?: boolean;
  status?: 'online' | 'busy' | 'offline';
  className?: string;
  ringColor?: string;
  onClick?: () => void;
}

export const OperatorAvatar: React.FC<OperatorAvatarProps> = ({
  photoUrl,
  name = 'Basem Alsaeed',
  callsign = 'OP-7740',
  size = 'md',
  showStatus = true,
  status = 'online',
  className = '',
  ringColor,
  onClick
}) => {
  const [hasError, setHasError] = useState(false);

  // Reset error state if photoUrl changes
  useEffect(() => {
    setHasError(false);
  }, [photoUrl]);

  // Extract up to 2 initials (e.g. "Basem Alsaeed" -> "BA")
  const getInitials = (str: string) => {
    const parts = str.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    if (parts[0]) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return 'OP';
  };

  const initials = getInitials(name || callsign);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[9px]',
    sm: 'w-8 h-8 text-[11px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-14 h-14 text-sm',
    xl: 'w-16 h-16 text-base',
    '2xl': 'w-20 h-20 text-lg'
  }[size];

  const statusDotSizes = {
    xs: 'w-2 h-2 -bottom-0.5 -right-0.5',
    sm: 'w-2.5 h-2.5 -bottom-0.5 -right-0.5',
    md: 'w-3 h-3 -bottom-0.5 -right-0.5',
    lg: 'w-3.5 h-3.5 bottom-0 right-0',
    xl: 'w-4 h-4 bottom-0.5 right-0.5',
    '2xl': 'w-4.5 h-4.5 bottom-1 right-1'
  }[size];

  const statusColors = {
    online: 'bg-emerald-400 ring-2 ring-[#07090e] shadow-[0_0_8px_#34d399]',
    busy: 'bg-amber-400 ring-2 ring-[#07090e] shadow-[0_0_8px_#fbbf24]',
    offline: 'bg-slate-500 ring-2 ring-[#07090e]'
  }[status];

  const showImage = Boolean(photoUrl && !hasError);

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center shrink-0 rounded-2xl select-none ${
        onClick ? 'cursor-pointer group' : ''
      } ${className}`}
    >
      <div
        className={`${sizeClasses} rounded-2xl overflow-hidden flex items-center justify-center font-mono font-bold tracking-wider border shadow-md transition-all duration-200 ${
          ringColor || 'border-cyan-400/30 bg-gradient-to-br from-[#0c1424] via-[#101b30] to-[#070c18] text-cyan-300'
        } ${onClick ? 'group-hover:border-cyan-400 group-hover:shadow-[0_0_15px_rgba(76,215,246,0.3)]' : ''}`}
      >
        {showImage ? (
          <img
            src={photoUrl}
            alt={name}
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-cyan-950/60 via-slate-900 to-indigo-950 text-cyan-300 p-0.5">
            {initials ? (
              <span className="font-mono font-bold leading-none">{initials}</span>
            ) : (
              <User className="w-1/2 h-1/2 opacity-80" />
            )}
          </div>
        )}
      </div>

      {showStatus && (
        <span
          className={`absolute rounded-full pointer-events-none ${statusDotSizes} ${statusColors}`}
          title={`Status: ${status.toUpperCase()}`}
        />
      )}
    </div>
  );
};
