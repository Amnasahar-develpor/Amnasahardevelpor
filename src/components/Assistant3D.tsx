import type { AssistantMode } from '../hooks/useAssistant';

interface AssistantAvatarProps {
  mode: AssistantMode;
  muted: boolean;
}

/**
 * Flat vector-style virtual assistant matching the new brand illustration.
 * The file name/export is kept so Hero.tsx and all voice logic stay untouched.
 */
export default function Assistant3D({ mode, muted }: AssistantAvatarProps) {
  const speaking = mode === 'speaking';
  const waving = mode === 'waving';
  const listening = mode === 'listening';

  return (
    <div className="character-canvas" aria-label="Animated virtual assistant">
      <svg viewBox="0 0 520 560" width="100%" height="100%" role="img" aria-label="Amna Sahar virtual assistant">
        <style>{`
          .as-float { animation: asFloat 4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
          .as-ring { animation: asSpin 40s linear infinite; transform-box: fill-box; transform-origin: center; }
          .as-ring-rev { animation: asSpin 55s linear infinite reverse; transform-box: fill-box; transform-origin: center; }
          .as-blink { animation: asBlink 4.2s infinite; transform-box: fill-box; transform-origin: center; }
          .as-talk { animation: asTalk 260ms ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
          .as-wave { animation: asWave 700ms ease-in-out infinite; transform-box: fill-box; transform-origin: 85% 90%; }
          .as-gesture { animation: asGesture 1.6s ease-in-out infinite; transform-box: fill-box; transform-origin: 20% 90%; }
          .as-pulse { animation: asPulse 2.4s ease-in-out infinite; }
          @keyframes asFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
          @keyframes asSpin { to{transform:rotate(360deg)} }
          @keyframes asBlink { 0%,92%,100%{transform:scaleY(1)} 95%{transform:scaleY(.08)} }
          @keyframes asTalk { 0%,100%{transform:scaleY(.6)} 50%{transform:scaleY(1.45)} }
          @keyframes asWave { 0%,100%{transform:rotate(-12deg)} 50%{transform:rotate(20deg)} }
          @keyframes asGesture { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-9deg)} }
          @keyframes asPulse { 0%,100%{opacity:.35} 50%{opacity:.8} }
        `}</style>

        <defs>
          <linearGradient id="asHijab" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#4c2580" />
            <stop offset="0.55" stopColor="#3a1c66" />
            <stop offset="1" stopColor="#2a164f" />
          </linearGradient>
          <linearGradient id="asRobe" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4a247d" />
            <stop offset="1" stopColor="#2c1851" />
          </linearGradient>
          <linearGradient id="asPanel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8b5cf6" />
            <stop offset="1" stopColor="#5b2a91" />
          </linearGradient>
          <radialGradient id="asGlow" cx="50%" cy="45%" r="55%">
            <stop offset="0" stopColor="#a855f7" stopOpacity=".22" />
            <stop offset="1" stopColor="#a855f7" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient glow and orbiting rings */}
        <circle cx="260" cy="255" r="235" fill="url(#asGlow)" />
        <circle cx="260" cy="255" r="205" fill="none" stroke="#b794ff" strokeOpacity=".28" strokeWidth="1" />
        <circle className="as-ring" cx="260" cy="255" r="172" fill="none" stroke="#c4b5fd" strokeOpacity=".4" strokeWidth="1.2" strokeDasharray="3 9" />
        <circle className="as-ring-rev" cx="260" cy="255" r="140" fill="none" stroke="#a78bfa" strokeOpacity=".3" strokeWidth="1" strokeDasharray="2 12" />
        <circle className="as-pulse" cx="448" cy="118" r="4" fill="#d8b4fe" />
        <circle className="as-pulse" cx="72" cy="388" r="3" fill="#d8b4fe" />

        {/* Floating tech labels */}
        <g transform="translate(44 168)">
          <rect width="78" height="32" rx="16" fill="#1d1033" stroke="#7c3aed" strokeOpacity=".55" />
          <circle cx="17" cy="16" r="3" fill="#c084fc" />
          <text x="45" y="21" textAnchor="middle" fontSize="13" fill="#ede9fe" fontFamily="inherit">react</text>
        </g>
        <g transform="translate(56 344)">
          <rect width="58" height="32" rx="16" fill="#1d1033" stroke="#7c3aed" strokeOpacity=".55" />
          <text x="29" y="21" textAnchor="middle" fontSize="13" fill="#ddd6fe" fontFamily="inherit">&lt;/&gt;</text>
        </g>
        <g transform="translate(430 138)">
          <rect width="50" height="30" rx="15" fill="#1d1033" stroke="#7c3aed" strokeOpacity=".55" />
          <text x="25" y="20" textAnchor="middle" fontSize="13" fill="#ddd6fe" fontFamily="inherit">ai</text>
        </g>

        {/* Character */}
        <g className="as-float">
          {/* Robe */}
          <path d="M168 300 C156 372 146 456 134 548 L386 548 C374 456 364 372 352 300 Z" fill="url(#asRobe)" />
          <path d="M232 306 L288 306 L304 548 L216 548 Z" fill="url(#asPanel)" opacity=".62" />
          <path d="M168 300 C156 372 146 456 134 548 L186 548 C190 450 196 370 202 306 Z" fill="#5b2a91" opacity=".45" />
          <path d="M352 300 C364 372 374 456 386 548 L334 548 C330 450 324 370 318 306 Z" fill="#5b2a91" opacity=".45" />

          {/* Small flower accent */}
          <g transform="translate(260 338)">
            {[0, 72, 144, 216, 288].map((angle) => (
              <ellipse key={angle} cx="0" cy="-9" rx="5.5" ry="9" fill="#e9d5ff" transform={`rotate(${angle})`} />
            ))}
            <circle r="4.5" fill="#fcd34d" />
          </g>

          {/* Hijab outer drape */}
          <path d="M260 92 C184 92 142 150 142 226 C142 306 138 372 122 432 L196 432 C208 360 208 292 208 232 C208 186 230 154 260 154 C290 154 312 186 312 232 C312 292 312 360 324 432 L398 432 C382 372 378 306 378 226 C378 150 336 92 260 92 Z" fill="url(#asHijab)" />
          <path d="M260 108 C202 108 170 156 170 218 C170 282 202 314 260 314 C318 314 350 282 350 218 C350 156 318 108 260 108 Z" fill="#281448" opacity=".55" />

          {/* Face */}
          <ellipse cx="260" cy="214" rx="60" ry="67" fill="#e9a98a" />
          <ellipse cx="202" cy="220" rx="7" ry="10" fill="#dda086" />
          <ellipse cx="318" cy="220" rx="7" ry="10" fill="#dda086" />

          {/* Eyes + brows */}
          <g className="as-blink">
            {[238, 282].map((x) => (
              <g key={x}>
                <ellipse cx={x} cy="204" rx="12" ry="7.5" fill="#fffdfb" />
                <circle cx={x} cy="204" r="6.2" fill="#7c3aed" />
                <circle cx={x} cy="204" r="3" fill="#21133a" />
                <circle cx={x - 2.2} cy="201.5" r="1.8" fill="#fff" />
              </g>
            ))}
          </g>
          <path d="M224 188 Q238 181 252 188" stroke="#3b2445" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M268 188 Q282 181 296 188" stroke="#3b2445" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M224 188 l-6 -4 M296 188 l6 -4" stroke="#3b2445" strokeWidth="2" strokeLinecap="round" />

          {/* Blush + nose */}
          <ellipse cx="224" cy="230" rx="10" ry="6" fill="#e07f8f" opacity=".28" />
          <ellipse cx="296" cy="230" rx="10" ry="6" fill="#e07f8f" opacity=".28" />
          <path d="M258 218 q6 8 -2 11" stroke="#c77f68" strokeWidth="2.4" strokeLinecap="round" fill="none" />

          {/* Mouth: animated while speaking, otherwise a soft smile */}
          {speaking ? (
            <ellipse className="as-talk" cx="260" cy="248" rx="5" ry="3.2" fill={muted ? '#b97385' : '#9c4f68'} />
          ) : (
            <path d="M246 244 Q260 257 274 244" stroke={muted ? '#b97385' : '#9c4f68'} strokeWidth="3.2" strokeLinecap="round" fill="none" />
          )}
          {listening && <circle cx="260" cy="278" r="3" fill="#c084fc" />}

          {/* Hands */}
          <g className={waving ? 'as-wave' : speaking ? 'as-gesture' : ''} transform="translate(0 0)">
            <ellipse cx="372" cy="474" rx="21" ry="29" fill="#e9a98a" />
            <path d="M360 456 q12 -8 24 0" stroke="#dda086" strokeWidth="3" strokeLinecap="round" fill="none" />
          </g>
          <g className={speaking ? 'as-gesture' : ''}>
            <ellipse cx="148" cy="474" rx="21" ry="29" fill="#e9a98a" />
            <path d="M136 456 q12 -8 24 0" stroke="#dda086" strokeWidth="3" strokeLinecap="round" fill="none" />
          </g>
        </g>
      </svg>
    </div>
  );
}
