import type { AssistantMode } from '../hooks/useAssistant';

interface AssistantAvatarProps {
  mode: AssistantMode;
  muted: boolean;
}

/**
 * Flat vector assistant matching the supplied reference: smaller full-body
 * character, fair skin, lavender hijab and outfit, moving hands and lipsync.
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
          @keyframes asFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
          @keyframes asSpin { to{transform:rotate(360deg)} }
          @keyframes asBlink { 0%,92%,100%{transform:scaleY(1)} 95%{transform:scaleY(.08)} }
          @keyframes asTalk { 0%,100%{transform:scaleY(.6)} 50%{transform:scaleY(1.45)} }
          @keyframes asWave { 0%,100%{transform:rotate(-12deg)} 50%{transform:rotate(20deg)} }
          @keyframes asGesture { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-9deg)} }
          @keyframes asPulse { 0%,100%{opacity:.35} 50%{opacity:.8} }
        `}</style>

        <defs>
          <linearGradient id="asHijab" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#cbb3ef" />
            <stop offset="0.55" stopColor="#b28ce6" />
            <stop offset="1" stopColor="#9a72d8" />
          </linearGradient>
          <linearGradient id="asRobe" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d6c2f5" />
            <stop offset="1" stopColor="#b795e8" />
          </linearGradient>
          <linearGradient id="asPanel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#b28ce6" />
            <stop offset="1" stopColor="#8b5cf6" />
          </linearGradient>
          <radialGradient id="asGlow" cx="50%" cy="45%" r="55%">
            <stop offset="0" stopColor="#c084fc" stopOpacity=".18" />
            <stop offset="1" stopColor="#c084fc" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient glow, rings and floating labels */}
        <circle cx="260" cy="270" r="230" fill="url(#asGlow)" />
        <circle cx="260" cy="270" r="205" fill="none" stroke="#b794f6" strokeOpacity=".3" strokeWidth="1" />
        <circle className="as-ring" cx="260" cy="270" r="170" fill="none" stroke="#c4b5fd" strokeOpacity=".42" strokeWidth="1.2" strokeDasharray="3 9" />
        <circle className="as-ring-rev" cx="260" cy="270" r="138" fill="none" stroke="#a78bfa" strokeOpacity=".32" strokeWidth="1" strokeDasharray="2 12" />
        <circle className="as-pulse" cx="446" cy="132" r="4" fill="#c084fc" />
        <circle className="as-pulse" cx="74" cy="392" r="3" fill="#c084fc" />

        <g transform="translate(46 178)">
          <rect width="76" height="30" rx="15" fill="#f7f2ff" stroke="#b794f6" strokeOpacity=".6" />
          <circle cx="16" cy="15" r="3" fill="#8b5cf6" />
          <text x="44" y="20" textAnchor="middle" fontSize="13" fill="#5b3a8f" fontFamily="inherit">react</text>
        </g>
        <g transform="translate(58 352)">
          <rect width="56" height="30" rx="15" fill="#f7f2ff" stroke="#b794f6" strokeOpacity=".6" />
          <text x="28" y="20" textAnchor="middle" fontSize="13" fill="#5b3a8f" fontFamily="inherit">&lt;/&gt;</text>
        </g>
        <g transform="translate(430 150)">
          <rect width="48" height="28" rx="14" fill="#f7f2ff" stroke="#b794f6" strokeOpacity=".6" />
          <text x="24" y="19" textAnchor="middle" fontSize="13" fill="#5b3a8f" fontFamily="inherit">ai</text>
        </g>

        {/* Character — smaller, full body, lavender outfit */}
        <g className="as-float">
          {/* Robe */}
          <path d="M186 312 C176 380 168 462 158 528 L362 528 C352 462 344 380 334 312 Z" fill="url(#asRobe)" />
          <path d="M238 316 L282 316 L296 528 L224 528 Z" fill="url(#asPanel)" opacity=".65" />
          <path d="M186 312 C176 380 168 462 158 528 L204 528 C208 452 212 380 216 316 Z" fill="#b28ce6" opacity=".4" />
          <path d="M334 312 C344 380 352 462 362 528 L316 528 C312 452 308 380 304 316 Z" fill="#b28ce6" opacity=".4" />

          {/* Flower accent */}
          <g transform="translate(260 348)">
            {[0, 72, 144, 216, 288].map((angle) => (
              <ellipse key={angle} cx="0" cy="-8" rx="4.8" ry="8" fill="#f3e8ff" transform={`rotate(${angle})`} />
            ))}
            <circle r="4" fill="#fcd34d" />
          </g>

          {/* Hijab drape */}
          <path d="M260 112 C196 112 160 162 160 230 C160 302 156 360 144 418 L204 418 C214 356 214 296 214 236 C214 194 234 166 260 166 C286 166 306 194 306 236 C306 296 306 356 316 418 L376 418 C364 360 360 302 360 230 C360 162 324 112 260 112 Z" fill="url(#asHijab)" />
          <path d="M260 126 C210 126 182 168 182 222 C182 278 212 306 260 306 C308 306 338 278 338 222 C338 168 310 126 260 126 Z" fill="#8b5cf6" opacity=".22" />

          {/* Face — fair skin */}
          <ellipse cx="260" cy="214" rx="55" ry="62" fill="#f1d8c9" />
          <ellipse cx="207" cy="220" rx="6" ry="9" fill="#e8c5b5" />
          <ellipse cx="313" cy="220" rx="6" ry="9" fill="#e8c5b5" />

          {/* Eyes, brows, lashes */}
          <g className="as-blink">
            {[240, 280].map((x) => (
              <g key={x}>
                <ellipse cx={x} cy="204" rx="11" ry="7" fill="#fffdfb" />
                <circle cx={x} cy="204" r="5.6" fill="#7c3aed" />
                <circle cx={x} cy="204" r="2.8" fill="#2a164f" />
                <circle cx={x - 2} cy="201.5" r="1.6" fill="#fff" />
              </g>
            ))}
          </g>
          <path d="M226 189 Q240 183 253 189" stroke="#6b4a63" strokeWidth="2.6" strokeLinecap="round" fill="none" />
          <path d="M267 189 Q280 183 294 189" stroke="#6b4a63" strokeWidth="2.6" strokeLinecap="round" fill="none" />
          <path d="M226 189 l-5 -4 M294 189 l5 -4" stroke="#6b4a63" strokeWidth="1.8" strokeLinecap="round" />

          {/* Blush + nose */}
          <ellipse cx="228" cy="230" rx="9" ry="5.5" fill="#e79ba0" opacity=".25" />
          <ellipse cx="292" cy="230" rx="9" ry="5.5" fill="#e79ba0" opacity=".25" />
          <path d="M258 218 q5 7 -2 10" stroke="#d1a08d" strokeWidth="2.2" strokeLinecap="round" fill="none" />

          {/* Small, subtle lipsync mouth */}
          {speaking ? (
            <ellipse className="as-talk" cx="260" cy="248" rx="4" ry="2.6" fill={muted ? '#b97a8b' : '#a05468'} />
          ) : (
            <path d="M248 245 Q260 255 272 245" stroke={muted ? '#b97a8b' : '#a05468'} strokeWidth="2.8" strokeLinecap="round" fill="none" />
          )}
          {listening && <circle cx="260" cy="276" r="2.6" fill="#b794f6" />}

          {/* Hands — visible and animated */}
          <g className={waving ? 'as-wave' : speaking ? 'as-gesture' : ''}>
            <ellipse cx="354" cy="486" rx="18" ry="25" fill="#f1d8c9" />
            <path d="M344 470 q10 -7 20 0" stroke="#e8c5b5" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          </g>
          <g className={speaking ? 'as-gesture' : ''}>
            <ellipse cx="166" cy="486" rx="18" ry="25" fill="#f1d8c9" />
            <path d="M156 470 q10 -7 20 0" stroke="#e8c5b5" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          </g>
        </g>
      </svg>
    </div>
  );
}
