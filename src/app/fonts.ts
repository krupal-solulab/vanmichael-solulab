import { Bricolage_Grotesque, Cormorant_Garamond, Instrument_Serif, Manrope } from "next/font/google";

// Self-hosted at build time: no request to Google from visitors' browsers.
// Two faces per family keeps the font budget small (brief T07).

export const cormorant = Cormorant_Garamond({ subsets: ["latin", "latin-ext"], weight: ["300", "400", "500"], style: ["normal", "italic"], variable: "--font-cormorant", display: "swap", preload: false });
export const manrope = Manrope({ subsets: ["latin", "latin-ext"], variable: "--font-manrope", display: "swap" });
export const bricolage = Bricolage_Grotesque({ subsets: ["latin", "latin-ext"], variable: "--font-bricolage", display: "swap", preload: false });
export const instrument = Instrument_Serif({ subsets: ["latin", "latin-ext"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument", display: "swap", preload: false });

export const fontVariables = [cormorant.variable, manrope.variable, bricolage.variable, instrument.variable].join(" ");
