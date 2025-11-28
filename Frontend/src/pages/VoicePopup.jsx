// src/components/VoicePopup.jsx
import { useState, useRef, useEffect } from "react";
import { Mic, Square, Trash2, Globe2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { isLoggedIn, getCurrentUser } from "../utlis/auth";

/* ---------------------------------
   Language config (same idea as VoiceCalculatorPage)
--------------------------------- */
const LANGS = [
  { key: "ta", label: "Tamil 🇮🇳", recog: "ta-IN", ttsCode: "ta-IN", speaker: "vidya" },
  { key: "hi", label: "Hindi 🇮🇳", recog: "hi-IN", ttsCode: "hi-IN", speaker: "manisha" },
  { key: "en", label: "English 🇬🇧", recog: "en-IN", ttsCode: "en-IN", speaker: "anushka" },
  { key: "te", label: "Telugu 🇮🇳", recog: "te-IN", ttsCode: "te-IN", speaker: "anushka" },
  { key: "kn", label: "Kannada 🇮🇳", recog: "kn-IN", ttsCode: "kn-IN", speaker: "arya" },
  { key: "ml", label: "Malayalam 🇮🇳", recog: "ml-IN", ttsCode: "ml-IN", speaker: "karun" },
];

/* -------------------------
   English helpers (Indian scale)
------------------------- */
const enOnes = [
  "zero","one","two","three","four","five","six","seven","eight","nine","ten",
  "eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"
];
const enTens = ["", "", "twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];

function enTwoDigit(n){
  if (n < 20) return enOnes[n];
  const t = Math.floor(n/10), r = n%10;
  return r===0 ? enTens[t] : `${enTens[t]}-${enOnes[r]}`;
}
function enIntToWords_IN(n){
  if (n === 0) return enOnes[0];
  if (n < 100) return enTwoDigit(n);
  if (n < 1000){
    const h = Math.floor(n/100), rest = n%100;
    return rest===0 ? `${enOnes[h]} hundred` : `${enOnes[h]} hundred ${enIntToWords_IN(rest)}`;
  }
  if (n < 100000){
    const k = Math.floor(n/1000), rest = n%1000;
    return rest===0 ? `${enIntToWords_IN(k)} thousand` : `${enIntToWords_IN(k)} thousand ${enIntToWords_IN(rest)}`;
  }
  if (n < 10000000){
    const l = Math.floor(n/100000), rest = n%100000;
    return rest===0 ? `${enIntToWords_IN(l)} lakh` : `${enIntToWords_IN(l)} lakh ${enIntToWords_IN(rest)}`;
  }
  if (n < 1000000000){
    const c = Math.floor(n/10000000), rest = n%10000000;
    return rest===0 ? `${enIntToWords_IN(c)} crore` : `${enIntToWords_IN(c)} crore ${enIntToWords_IN(rest)}`;
  }
  return String(n);
}

/* -------------------------
   Hindi helpers
------------------------- */
const hiOnes = [
  "शून्य","एक","दो","तीन","चार","पाँच","छह","सात","आठ","नौ","दस",
  "ग्यारह","बारह","तेरह","चौदह","पंद्रह","सोलह","सत्रह","अठारह","उन्नीस"
];
const hiTens = ["","", "बीस","तीस","चालीस","पचास","साठ","सत्तर","अस्सी","नब्बे"];
function hiIntToWords(n) {
  if (n < 20) return hiOnes[n];
  if (n < 100) {
    const t = Math.floor(n/10), r = n%10;
    return r === 0 ? hiTens[t] : `${hiTens[t]} ${hiOnes[r]}`;
  }
  if (n < 1000) {
    const h = Math.floor(n/100), rest = n%100;
    return rest === 0 ? `${hiOnes[h]} सौ` : `${hiOnes[h]} सौ ${hiIntToWords(rest)}`;
  }
  if (n < 100000) {
    const k = Math.floor(n/1000), rest = n%1000;
    return rest === 0 ? `${hiIntToWords(k)} हज़ार` : `${hiIntToWords(k)} हज़ार ${hiIntToWords(rest)}`;
  }
  if (n < 10000000) {
    const l = Math.floor(n/100000), rest = n%100000;
    return rest === 0 ? `${hiIntToWords(l)} लाख` : `${hiIntToWords(l)} लाख ${hiIntToWords(rest)}`;
  }
  if (n < 1000000000) {
    const cr = Math.floor(n/10000000), rest = n%10000000;
    return rest === 0 ? `${hiIntToWords(cr)} करोड़` : `${hiIntToWords(cr)} करोड़ ${hiIntToWords(rest)}`;
  }
  return String(n);
}

/* -------------------------
   Tamil helpers with your custom rules
------------------------- */
const USE_COLLOQUIAL_TA = true;
const USE_TA_SLANG_THITHI = true;      // ஆயிரத்தி
const USE_TA_HUNDRED_CONNECT_THITHI = false;
const USE_TA_THOUSAND_AYOOR = false;

const taOnes = [
  "பூஜ்ஜியம்","ஒன்று","இரண்டு","மூன்று","நான்கு","ஐந்து","ஆறு","ஏழு","எட்டு","ஒன்பது","பத்து",
  "பதினொன்று","பன்னிரண்டு","பதின்மூன்று","பதினான்கு","பதினைந்து","பதினாறு","பதினேழு","பதினெட்டு","பத்தொன்பது"
];
const taTens = ["","", "இருபது","முப்பது","நாற்பது","ஐம்பது","அறுபது","எழுபது","எண்பது","தொண்ணூறு"];

function sanitizeTamil(s) {
  if (!s || typeof s !== "string") return s;
  return s.replace(/\s+/g, " ").trim();
}
function taFuseTensOnes(tensWord, onesWord) {
  const tens = tensWord.replace(/து$/, "த்து");
  return `${tens} ${onesWord}`;
}
function formalTamilFix(formal) {
  if (!formal || typeof formal !== "string") return formal;
  let s = formal;
  s = s.replace(/\bபதிமூன்று\b/g, "பதின்மூன்று");
  s = s.replace(/\bபதிமொன்று\b/g, "பதினொன்று");
  s = s.replace(/\bஇரண்டு\s+நூறு\b/g, "இருநூறு");
  s = s.replace(/\bமூன்று\s+நூறு\b/g, "மூநூறு");
  s = s.replace(/\bநான்கு\s+நூறு\b/g, "நாநூறு");
  s = s.replace(/\bஐந்து\s+நூறு\b/g, "ஐநூறு");
  s = s.replace(/\bமூன்று\s+ஆயிரம்\b/g, "மூவாயிரம்");
  s = s.replace(/\bஇரண்டு\s+ஆயிரம்\b/g, "இருநாயிரம்");
  s = s.replace(/\bநான்கு\s+ஆயிரம்\b/g, "நாலாயிரம்");
  s = s.replace(/\bஐந்து\s+ஆயிரம்\b/g, "அஞ்சாயிரம்");
  return s.replace(/\s+/g, " ").trim();
}
function colloquialTamil(formal) {
  if (!formal || typeof formal !== "string") return formal;
  let s = formal;
  s = s.replace(/\bஇருபது\b/g, "இருவத்தி");
  return s.replace(/\s+/g, " ").trim();
}
function taHundredWord(h, slang) {
  if (h === 0) return "";
  if (slang && h === 9) return "தொள்ளாயிரம்";
  const fusedHundreds = {
    1: "நூறு",
    2: "இருநூறு",
    3: "மூநூறு",
    4: "நாநூறு",
    5: "ஐநூறு",
    6: "அறுநூறு",
    7: "ஏழுநூறு",
    8: "எட்டுநூறு",
    9: "ஒன்பதுநூறு",
  };
  return fusedHundreds[h] || "";
}
function taHundredJoin(base, restWords, slang) {
  if (slang && base === "தொள்ளாயிரம்") return "தொள்ளாயிரத்தி " + restWords;
  if (/நூறு$/.test(base)) {
    const connector = USE_TA_HUNDRED_CONNECT_THITHI ? "நூத்தி" : "நூற்று";
    return base.replace(/நூறு$/, connector) + " " + restWords;
  }
  return base + " " + restWords;
}
function taThousandBase(k) {
  if (k <= 0) return "";
  const fusedThousands = {
    1: "ஆயிரம்",
    2: "இரண்டாயிரம்",
    3: "மூன்றாயிரம்",
    4: "நாலாயிரம்",
    5: "அஞ்சாயிரம்",
    6: "ஆறாயிரம்",
    7: "ஏழாயிரம்",
    8: "எட்டாயிரம்",
    9: "ஒன்பதாயிரம்"
  };
  let base = fusedThousands[k];
  if (!base) {
    const kWords = taIntToWords(k, false, USE_TA_SLANG_THITHI);
    base = `${kWords} ஆயிரம்`.replace(/து ஆயிரம்$/, "தாயிரம்");
  }
  if (USE_TA_THOUSAND_AYOOR && base) {
    base = base.replace(/ஆயிரம்\b/g, "ஆயூரம்");
  }
  return sanitizeTamil(base);
}
function taThousandJoinWord(base) {
  if (!base) return "";
  const suffix = USE_TA_SLANG_THITHI ? "த்தி" : "த்து";
  return base.replace(/ம்$/, suffix);
}
function taIntToWords(n, colloquial = false, slangThthi = USE_TA_SLANG_THITHI) {
  if (n < 20) return taOnes[n];

  if (n < 100) {
    const t = Math.floor(n / 10), r = n % 10;
    const tensWord = taTens[t];
    if (r === 0) return tensWord;
    const onesWord = taOnes[r];
    return taFuseTensOnes(tensWord, onesWord);
  }

  if (n < 1000) {
    const h = Math.floor(n / 100), rest = n % 100;
    const base = taHundredWord(h, slangThthi) || `${taOnes[h]} நூறு`;
    if (rest === 0) return base;
    const restWords = taIntToWords(rest, colloquial, slangThthi);
    return taHundredJoin(base, restWords, slangThthi);
  }

  if (n < 100000) {
    const k = Math.floor(n / 1000), rest = n % 1000;
    const base = taThousandBase(k);
    if (rest === 0) return base;
    const joined = taThousandJoinWord(base);
    const restWords = taIntToWords(rest, colloquial, slangThthi);
    return `${joined} ${restWords}`;
  }

  if (n < 10000000) {
    const l = Math.floor(n / 100000), rest = n % 100000;
    const lWord = (l === 1) ? "ஒரு" : taIntToWords(l, colloquial, slangThthi);
    return rest === 0
      ? `${lWord} லட்சம்`
      : `${lWord} லட்சம் ${taIntToWords(rest, colloquial, slangThthi)}`;
  }

  if (n < 1000000000) {
    const cr = Math.floor(n / 10000000), rest = n % 10000000;
    const crWord = (cr === 1) ? "ஒரு" : taIntToWords(cr, colloquial, slangThthi);
    return rest === 0
      ? `${crWord} கோடி`
      : `${crWord} கோடி ${taIntToWords(rest, colloquial, slangThthi)}`;
  }

  return String(n);
}

/* -------------------------
   Telugu
------------------------- */
const teOnes = [
  "శూన్యం","ఒకటి","రెండు","మూడు","నాలుగు","ఐదు","ఆరు","ఏడు","ఎనిమిది","తొమ్మిది","పది",
  "పదకొండు","పన్నెండు","పదమూడు","పద్నాలుగు","పదిహేను","పధహారు","పదిహేడు","పద్దెనిమిది","పంతొమ్మిది"
];
const teTens = ["","", "ఇరవై","ముప్పై","నలభై","యాభై","అరవై","డెబ్బై","ఎనభై","తొంభై"];
function teIntToWords(n) {
  if (n < 20) return teOnes[n];
  if (n < 100) {
    const t = Math.floor(n/10), r = n%10;
    return r===0? teTens[t] : `${teTens[t]} ${teOnes[r]}`;
  }
  if (n < 1000) {
    const h = Math.floor(n/100), rest = n%100;
    return rest===0? `${teOnes[h]} వంద` : `${teOnes[h]} వంద ${teIntToWords(rest)}`;
  }
  if (n < 100000) {
    const k = Math.floor(n/1000), rest=n%1000;
    return rest===0? `${teIntToWords(k)} వేయి` : `${teIntToWords(k)} వేయి ${teIntToWords(rest)}`;
  }
  if (n < 10000000) {
    const l = Math.floor(n/100000), rest=n%100000;
    return rest===0? `${teIntToWords(l)} లక్ష` : `${teIntToWords(l)} లక్ష ${teIntToWords(rest)}`;
  }
  if (n < 1000000000) {
    const cr = Math.floor(n/10000000), rest=n%10000000;
    return rest===0? `${teIntToWords(cr)} కోటి` : `${teIntToWords(cr)} కోటి ${teIntToWords(rest)}`;
  }
  return String(n);
}

/* -------------------------
   Kannada
------------------------- */
const knOnes = [
  "ಸೂನ್ಯ","ಒಂದು","ಎರಡು","ಮೂರು","ನಾಲ್ಕು","ಐದು","ಆರು","ಏಳು","ಎಂಟು","ಒಂಬತ್ತು","ಹತ್ತು",
  "ಹನ್ನೊಂದು","ಹನ್ನೆರಡು","ಹದಿಮೂರು","ಹದಿನಾಲ್ಕು","ಹದಿನೈದು","ಹದಿನಾರು","ಹದಿನೇಳು","ಹದಿನೆಂಟು","ಹತ್ತೊಂಬತ್ತು"
];
const knTens = ["","", "ಇಪ್ಪತ್ತು","ಮೂವತ್ತು","ನಲವತ್ತು","ಐವತ್ತು","ಅರವತ್ತು","ಎಪ್ಪತ್ತು","ಎಂಬತ್ತು","ತೊಂಬತ್ತು"];
function knIntToWords(n) {
  if (n < 20) return knOnes[n];
  if (n < 100) {
    const t = Math.floor(n/10), r=n%10;
    return r===0? knTens[t] : `${knTens[t]} ${knOnes[r]}`;
  }
  if (n < 1000) {
    const h = Math.floor(n/100), rest=n%100;
    return rest===0? `${knOnes[h]} ನೂರು` : `${knOnes[h]} ನೂರು ${knIntToWords(rest)}`;
  }
  if (n < 100000) {
    const k = Math.floor(n/1000), rest=n%1000;
    return rest===0? `${knIntToWords(k)} ಸಾವಿರ` : `${knIntToWords(k)} ಸಾವಿರ ${knIntToWords(rest)}`;
  }
  if (n < 10000000) {
    const l = Math.floor(n/100000), rest=n%100000;
    return rest===0? `${knIntToWords(l)} ಲಕ್ಷ` : `${knIntToWords(l)} ಲಕ್ಷ ${knIntToWords(rest)}`;
  }
  if (n < 1000000000) {
    const cr = Math.floor(n/10000000), rest=n%10000000;
    return rest===0? `${knIntToWords(cr)} ಕೋಟಿ` : `${knIntToWords(cr)} ಕೋಟಿ ${knIntToWords(rest)}`;
  }
  return String(n);
}

/* -------------------------
   Malayalam
------------------------- */
const mlOnes = [
  "പൂജ്യം","ഒന്ന്","രണ്ട്","മൂന്ന്","നാല്","അഞ്ച്","ആറ്","ഏഴ്","എട്ട്","ഒൻപത്","പത്ത്",
  "പതിനൊന്ന്","പന്ത്രണ്ട്","പതിമൂന്ന്","പതിനാല്","പതിനഞ്ച്","പതിനാറ്","പതിനേഴ്","പതിനെട്ട്","പത്തൊൻപത്"
];
const mlTens = ["","", "ഇരുപത്","മുപ്പത്","നാല്പത്","അമ്പത്","അറുപത്","എഴുപത്","എൺപത്","തൊണ്ണൂറ്"];
function mlIntToWords(n) {
  if (n < 20) return mlOnes[n];
  if (n < 100) {
    const t=Math.floor(n/10), r=n%10;
    return r===0? mlTens[t] : `${mlTens[t]} ${mlOnes[r]}`;
  }
  if (n < 1000) {
    const h=Math.floor(n/100), rest=n%100;
    return rest===0? `${mlOnes[h]} നൂറ്` : `${mlOnes[h]} നൂറ് ${mlIntToWords(rest)}`;
  }
  if (n < 100000) {
    const k=Math.floor(n/1000), rest=n%1000;
    return rest===0? `${mlIntToWords(k)} ആയിരം` : `${mlIntToWords(k)} ആയിരം ${mlIntToWords(rest)}`;
  }
  if (n < 10000000) {
    const l=Math.floor(n/100000), rest=n%100000;
    return rest===0? `${mlIntToWords(l)} ലക്ഷം` : `${mlIntToWords(l)} ലക്ഷം ${mlIntToWords(rest)}`;
  }
  if (n < 1000000000) {
    const cr=Math.floor(n/10000000), rest=n%10000000;
    return rest===0? `${mlIntToWords(cr)} കോടി` : `${mlIntToWords(cr)} കോടി ${mlIntToWords(rest)}`;
  }
  return String(n);
}

/* -------------------------
   Number → words wrapper
------------------------- */
function numberToWords(langKey, value, opts = {}) {
  if (value === null || value === undefined || value === "") return "";
  let neg = false;
  let num = Number(value);
  if (isNaN(num)) return String(value);
  if (num < 0) { neg = true; num = Math.abs(num); }

  const intPart = Math.floor(num);
  const frac = String(num).includes(".") ? String(num).split(".")[1] : null;

  let intWords = "";
  switch (langKey) {
    case "en": intWords = enIntToWords_IN(intPart); break;
    case "hi": intWords = hiIntToWords(intPart); break;
    case "ta": intWords = taIntToWords(intPart, !!opts.colloquialTamil, USE_TA_SLANG_THITHI); break;
    case "te": intWords = teIntToWords(intPart); break;
    case "kn": intWords = knIntToWords(intPart); break;
    case "ml": intWords = mlIntToWords(intPart); break;
    default: intWords = enIntToWords_IN(intPart);
  }

  if (langKey === "ta") {
    intWords = opts.colloquialTamil ? colloquialTamil(intWords) : formalTamilFix(intWords);
    intWords = sanitizeTamil(intWords);
  }

  if (frac && frac.length) {
    if (langKey === "ta") {
      const fracStr = String(frac).replace(/[^\d]/g, "");
      const m = fracStr.match(/^0+/);
      const leadingZeros = m ? m[0].length : 0;
      const restDigits = fracStr.slice(leadingZeros);

      const parts = [];
      for (let i = 0; i < leadingZeros; i++) parts.push(taOnes[0]);

      if (restDigits.length) {
        const restNum = parseInt(restDigits, 10);
        parts.push(
          restNum === 0
            ? taOnes[0]
            : taIntToWords(restNum, !!opts.colloquialTamil, USE_TA_SLANG_THITHI)
        );
      } else {
        parts.push(taOnes[0]);
      }

      const pointWordTa = "புள்ளி";
      return (neg ? (langKey==="hi" ? "ऋण " : "minus ") : "") +
             intWords + " " + pointWordTa + " " + parts.join(" ");
    }

    const digitWords = [];
    for (const ch of frac) {
      const d = parseInt(ch, 10);
      if (isNaN(d)) continue;
      let w = "";
      switch (langKey) {
        case "en": w = enOnes[d]; break;
        case "hi": w = hiOnes[d]; break;
        case "te": w = teOnes[d]; break;
        case "kn": w = knOnes[d]; break;
        case "ml": w = mlOnes[d]; break;
        default:   w = enOnes[d];
      }
      digitWords.push(w);
    }
    const pointWord = { en: "point", hi: "दशमलव", te: "పాయింట్", kn: "ದಶಮಾಂಶ", ml: "ഡെസിമൽ" }[langKey] || "point";
    return (neg ? (langKey==="hi" ? "ऋण " : "minus ") : "") +
           intWords + " " + pointWord + " " + digitWords.join(" ");
  }

  return (neg ? (langKey==="hi" ? "ऋण " : "minus ") : "") + intWords;
}

/* -------------------------
   Eval + voice helpers
------------------------- */
function safeEvaluate(expr) {
  const cleaned = (expr || "").replace(/\s+/g, "");
  if (!/^[\d+\-*/().%]+$/.test(cleaned)) throw new Error("Invalid characters");
  if (/[\/*+\-]{3,}/.test(cleaned)) throw new Error("Malformed expression");
  const normalized = cleaned.replace(/(\d+(\.\d+)?)%/g, "($1/100)");
  // eslint-disable-next-line no-new-func
  const fn = new Function(`return (${normalized});`);
  const val = fn();
  if (typeof val !== "number" || !isFinite(val)) throw new Error("Not a finite number");
  return val;
}

const VOICE_ALIASES = [
  { re: /கூட்டல்|கூட்டு|சேர்த்து|பிளஸ்|plus|add/giu, to: " + " },
  { re: /கழித்தல்|கழித்து|மைனஸ்|minus/giu, to: " - " },
  { re: /பெருக்கல்|பெருக்கி|இன்டு|x|×|times|into|multiply/giu, to: " * " },
  { re: /வகுத்தல்|வகுத்து|÷|divide|divided\s*by|over/giu, to: " / " },
  { re: /சதவீதம்|percent|%/giu, to: " % " },
  { re: /புள்ளி|point/giu, to: " . " },
];
function normalizeVoiceToMath(text) {
  if (!text) return "";
  let s = ` ${text.toLowerCase()} `;
  for (const { re, to } of VOICE_ALIASES) s = s.replace(re, ` ${to} `);
  s = s.replace(/[^0-9+\-*/().%\s]/g, "").replace(/\s+/g, "");
  return s;
}

/* -------------------------
   COMPONENT
------------------------- */
export default function VoicePopup() {
  const [isListening, setIsListening] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [result, setResult] = useState("");
  const [resultWords, setResultWords] = useState("");
  const [error, setError] = useState("");
  const [playing, setPlaying] = useState(false);

  const [langKey, setLangKey] = useState("ta"); // Tamil default
  const [showDropdown, setShowDropdown] = useState(false);

  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();
  const user = getCurrentUser(); // not used yet, but available if needed

  const lang = LANGS.find(l => l.key === langKey) || LANGS[0];

  // 🔐 Protect this page – only logged-in users allowed
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login", { state: { from: "/voice-popup" } });
    }
  }, [navigate]);

  // 🧠 Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ----- TTS (Sarvam + fallback) ----- */
  const speak = async (text) => {
    if (!text) return;

    // 1) Try Sarvam AI (backend proxy)
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/sarvam-tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          target_language_code: lang.ttsCode,
          speaker: lang.speaker,
        }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        setPlaying(true);
        audio.play().catch(() => {});
        audio.onended = () => {
          URL.revokeObjectURL(url);
          setPlaying(false);
        };
        return; // ✅ Sarvam worked, no need fallback
      }
    } catch (err) {
      console.warn("Sarvam TTS failed, falling back to browser TTS:", err);
    }

    // 2) Fallback: browser speechSynthesis
    try {
      const synth = window.speechSynthesis;
      if (!synth) return;
      const u = new SpeechSynthesisUtterance(String(text));
      u.lang = lang.ttsCode;
      synth.cancel();
      synth.speak(u);
      setPlaying(true);
      u.onend = () => setPlaying(false);
    } catch (e) {
      console.error("Browser TTS failed:", e);
    }
  };

  /* ----- Evaluate / Calculate ----- */
  const evaluateExpression = (expr) => {
    try {
      const val = safeEvaluate(expr);
      setResult(val);
      setError("");
      const words = numberToWords(langKey, val, { colloquialTamil: USE_COLLOQUIAL_TA });
      setResultWords(words);
      speak(words);
    } catch {
      setResult("");
      setResultWords("");
      const msg =
        langKey === "hi" ? "मैं समझ नहीं पाया। फिर कोशिश करें।"
        : langKey === "ta" ? "புரியவில்லை, மறுபடி முயற்சிக்கவும்."
        : langKey === "te" ? "అర్థం కాలేదు, దయచేసి మళ్లీ ప్రయత్నించండి."
        : langKey === "kn" ? "ಅರ್ಥವಾಗಲಿಲ್ಲ, ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
        : langKey === "ml" ? "എനിക്ക് മനസ്സിലായില്ല, വീണ്ടും ശ്രമിക്കുക."
        : "I couldn't evaluate that expression.";
      setError("Invalid expression");
      speak(msg);
    }
  };

  const handleCalculate = () => {
    const normalized = normalizeVoiceToMath(manualInput);
    const expr = normalized || manualInput;
    if (!expr.trim()) return;
    evaluateExpression(expr);
  };

  const clearAll = () => {
    setManualInput("");
    setResult("");
    setResultWords("");
    setError("");
  };

  /* ----- STT: Voice Recognition ----- */
  /* ----- STT: Voice Recognition (fixed — no await in non-async handler) ----- */
const startListening = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Speech recognition not supported in this browser.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = lang.recog;
  recognition.interimResults = true;
  recognition.continuous = false;

  recognition.onstart = () => {
    recognitionRef.current = recognition;
    setIsListening(true);
    setError("");
  };

  recognition.onresult = (event) => {
    const text = Array.from(event.results)
      .map((r) => r[0].transcript)
      .join("");
    setManualInput(text);

    // when final result arrives
    if (event.results[0].isFinal) {
      const parsed = normalizeVoiceToMath(text);

      // --- record usage (fire-and-forget) ---
      try {
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/analytics/voice-input`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    userId: getCurrentUser()?._id || null,
    lang: langKey,
    rawText: text,
    parsed: parsed || null,
    // optional meta
    meta: { userAgent: navigator.userAgent },
  }),
}).catch(err => console.warn("analytics post failed:", err));

      } catch (e) {
        console.warn("analytics post threw:", e);
      }

      // Evaluate parsed math (or speak not-understood)
      if (parsed) {
        evaluateExpression(parsed);
      } else {
        const msg =
          langKey === "ta"
            ? "புரியவில்லை"
            : langKey === "hi"
            ? "समझ नहीं आया"
            : langKey === "te"
            ? "అర్థం కాలేదు"
            : langKey === "kn"
            ? "ಅರ್ಥವಾಗಲಿಲ್ಲ"
            : langKey === "ml"
            ? "മനസ്സിലായില്ല"
            : "I did not understand.";
        speak(msg);
      }
    }
  };

  recognition.onerror = () => stopListening();
  recognition.onend = () => stopListening();

  recognition.start();
  timeoutRef.current = setTimeout(stopListening, 10000);
};

const stopListening = () => {
  try {
    recognitionRef.current?.stop?.();
  } catch (e) {}
  recognitionRef.current = null;
  if (timeoutRef.current) clearTimeout(timeoutRef.current);
  setIsListening(false);
};


  /* ----- UI ----- */
  return (
    <main className="relative w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white via-pink-50 to-purple-100 text-gray-900 overflow-hidden px-4 sm:px-10 pt-[110px] pb-20">
      {/* 🌈 Floating Backgrounds */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-10 w-[300px] h-[300px] bg-gradient-to-br from-pink-300 via-purple-300 to-indigo-400 opacity-25 blur-3xl rounded-full animate-blob" />
        <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-gradient-to-tr from-purple-400 via-pink-300 to-indigo-400 opacity-25 blur-3xl rounded-full animate-blob animation-delay-2000" />
      </div>

      {/* --- HEADING --- */}
      <section className="text-center mb-10 px-6 animate-fade-up">
        <h2 className="text-sm font-semibold tracking-widest text-pink-600 uppercase mb-3">
          The Future of Voice-Math Interaction
        </h2>

        <div className="w-40 h-[3px] mx-auto bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 rounded-full mb-5"></div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-[#0F172A] mb-3">
          Think clearly, speak{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 animate-gradient-x">
            intelligently, solve fast
          </span>
        </h1>

        <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
          EzyVoiceCalc lets you compute effortlessly — just speak your math, and
          let intelligence do the rest.
        </p>
      </section>

      {/* 🎙️ Voice Calculator Section */}
      <div className="relative w-full max-w-2xl bg-white/80 border border-gray-200 rounded-2xl shadow-2xl p-10 backdrop-blur-md animate-fade-up">
        {/* 🧭 Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-3 sm:gap-0">
          <h3 className="text-lg sm:text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 text-center sm:text-left">
            VoiceCalc
          </h3>

          {/* 🌐 Smart Language Dropdown */}
          <div
            ref={dropdownRef}
            className="relative inline-block text-left w-full sm:w-auto"
          >
            <button
              onClick={() => setShowDropdown((prev) => !prev)}
              className="flex items-center justify-center sm:justify-between w-full sm:w-auto gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full shadow-inner cursor-pointer hover:shadow-md transition"
            >
              <Globe2 size={20} className="text-purple-600" />
              <span className="text-sm font-medium text-gray-700">
                {lang.label}
              </span>
              <svg
                className={`w-4 h-4 text-purple-600 transform transition-transform ${
                  showDropdown ? "rotate-180" : "rotate-0"
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 animate-fade-in z-20">
                {LANGS.map((l) => (
                  <button
                    key={l.key}
                    onClick={() => {
                      setLangKey(l.key);
                      setShowDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm rounded-lg transition ${
                      langKey === l.key
                        ? "text-purple-600 font-semibold bg-purple-50"
                        : "text-gray-700 hover:bg-gradient-to-r from-purple-50 to-pink-50"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 🎛️ Mic Button */}
        <div className="flex flex-col items-center justify-center gap-6 mb-8">
          <div
            onClick={isListening ? stopListening : startListening}
            className={`cursor-pointer w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 ${
              isListening || playing
                ? "bg-gradient-to-r from-pink-500 to-purple-600 animate-pulse shadow-[0_0_30px_rgba(236,72,153,0.6)]"
                : "bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-90 shadow-[0_0_20px_rgba(79,70,229,0.4)]"
            }`}
          >
            {isListening ? (
              <Square size={38} className="text-white" />
            ) : (
              <Mic size={38} className="text-white" />
            )}
          </div>

          <p className="text-gray-500 text-sm">
            “Speak your equation — let your voice calculate.”
          </p>
        </div>

        {/* ✍️ Input Section */}
        <div className="w-full bg-white/70 border border-gray-200 p-6 rounded-2xl shadow-md backdrop-blur-lg">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Try saying or typing: 12 plus 8 divided by 2"
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:border-pink-500 transition text-gray-700"
          />

          <div className="flex justify-between gap-3 mt-5">
            <button
              onClick={handleCalculate}
              className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-lg hover:opacity-90 shadow-md transition-all duration-300"
            >
              Calculate
            </button>

            <button
              onClick={clearAll}
              className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-lg hover:opacity-90 shadow-md transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Trash2 size={16} /> Clear
            </button>
          </div>

          {error && (
            <div className="mt-3 text-center text-sm text-red-600">
              {error}
            </div>
          )}

          {result !== "" && !error && (
            <div className="mt-4 text-center">
              <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
                Result = {result}
              </div>
              <div className="mt-2 text-sm text-gray-700">
                In words ({lang.label.split(" ")[0]}): {resultWords}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{styles}</style>
    </main>
  );
}

/* ✨ Animations */
const styles = `
@keyframes blob {
  0%, 100% { transform: translate(0px, 0px) scale(1); }
  50% { transform: translate(25px, -15px) scale(1.05); }
}
.animate-blob { animation: blob 10s ease-in-out infinite; }
.animation-delay-2000 { animation-delay: 2s; }

@keyframes fade-up {
  0% { opacity: 0; transform: translateY(30px); }
  100% { opacity: 1; transform: translateY(0); }
}
.animate-fade-up { animation: fade-up 0.8s ease-out forwards; }

@keyframes gradient-x {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
.animate-gradient-x { background-size: 200% 200%; animation: gradient-x 6s ease infinite; }

@keyframes fade-in {
  0% { opacity: 0; transform: translateY(-8px); }
  100% { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fade-in 0.25s ease-out; }
`;
