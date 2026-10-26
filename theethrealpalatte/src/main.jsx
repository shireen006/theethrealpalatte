import React, { useEffect, useState, useMemo } from "react";
import { createRoot } from "react-dom/client";
import {
  Search,
  Heart,
  ShoppingBag,
  UserRound,
  Menu,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  MessageCircle,
} from "lucide-react";

import heroBouquet from "./images/download (5).jpg";
import crochetHero from "./images/crochet-hero.jpg";
import paintingHero from "./images/painting-hero.jpeg";
import sunflowerbouquet from "./images/sunflowerbouquet.jpg";
import sunflowerkeychain from "./images/keychain.jpg";
import fourleafcloverkeychain from "./images/fourleafcloverkeychain.jpg";
import butterflyhairtie from "./images/butterflyhairtie.jpg";
import bowhairtie from "./images/bowhairtie.jpeg";
import bluedreambouquet from "./images/bluedreambouquet.jpg";
import crimsonlilybouquet from "./images/crimsonlilybouquet.jpg";
import miniforeverbouquet from "./images/miniforeverbouquet.jpg";

import "./styles.css";
import { BUSINESS_CONFIG } from "./config.js";
import AuthModal from "./components/AuthModal.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";

const ANNOUNCEMENT_MESSAGES = [
  "Handmade with love",
  "Made to order",
  "Customization available",
];

const slides = [
  {
    eyebrow: "HANDMADE",
    title: "Crochet",
    text: "Little pieces, made slowly.",
    image: crochetHero,
    alt: "Handmade crochet collection",
    filter: "Crochet",
    position: "center center",
  },
  {
    eyebrow: "CHENILLE BOUQUETS",
    title: "Bloom Studio",
    text: "Chenille Flower Bouquets",
    image: heroBouquet,
    alt: "Handmade chenille flower bouquets",
    filter: "Bloom Studio",
    position: "center center",
  },
];

const products = [
  {
    id: 1,
    name: "Crochet Sunflower Bouquet",
    price: 350,
    type: "Crochet",
    image: sunflowerbouquet,
    description:
      "Handmade sunshine, just for you.\nA cheerful crochet sunflower bouquet made with love.",
  },
  {
    id: 2,
    name: "Crochet Flower Keychains",
    price: 130,
    type: "Crochet",
    image: sunflowerkeychain,
    description:
      "A tiny handmade flower for your everyday essentials.\nPerfect for keys, bags, or gifting.\n[Custamization available.]",
  },
  {
    id: 3,
    name: "Four Leaf Clover Keychain",
    price: 150,
    type: "Crochet",
    image: fourleafcloverkeychain,
    description:
      "A little handmade lucky charm.\nCarry a touch of luck wherever you go.",
  },
  {
    id: 4,
    name: "Butterfly Hairtie",
    price: 250,
    type: "Crochet",
    image: butterflyhairtie,
    description:
      "A delicate butterfly made to brighten your hairstyle.\nHandmade with soft crochet details.",
  },
  {
    id: 5,
    name: "Crochet Bow Clip",
    price: 150,
    type: "Crochet",
    image: bowhairtie,
    description:
      "A sweet handmade bow for your everyday look.\nSimple, delicate, and made with love.",
  },
  {
    id: 7,
    name: "Blue Dream Bouquet",
    price: 199,
    type: "Bloom Studio",
    image: bluedreambouquet,
    description:
      "A dreamy handcrafted blue flower bouquet with an elegant birthday card and delicate ribbon.\nMade slowly and thoughtfully with love.",
  },
  {
    id: 9,
    name: "Crimson Lily Bouquet",
    price: 300,
    type: "Bloom Studio",
    image: crimsonlilybouquet,
    description:
      "Handmade burgundy and white chenille flower bouquet finished with a soft pink ribbon.\nMade slowly and thoughtfully with love.",
  },
  {
    id: 10,
    name: "Mini Forever Bouquet",
    price: 250,
    type: "Bloom Studio",
    image: miniforeverbouquet,
    description:
      "A delicate mini eternal bouquet crafted slowly and thoughtfully with love.\nAn everlasting keepsake for someone special.",
  },
];

/**
 * EXACT 6-STAGE CAT AND YARN ANIMATION (AS PICTURED IN USER SCREENSHOTS)
 * Frame 1: Sage yarn ball falling from above with motion lines, white kitten head peeking at bottom left.
 * Frame 2: Yarn ball falling midway, kitten looking up attentively.
 * Frame 3: BONK / Bounce on kitten's head, comical '!? ' and sweat/surprise marks.
 * Frame 4: Yarn ball resting snugly on kitten's head, kitten smiling peacefully (^w^).
 * Frame 5: Kitten pops up higher, raises both paws, and lifts the yarn ball with paws!
 * Frame 6: Kitten sits happily with yarn ball to the left, thread connecting, crocheting a green patch with needles/hook, music note floating!
 */
const STAGE_DURATIONS = {
  1: 650,  // Yarn starts falling from sky
  2: 500,  // Yarn zooming toward kitten
  3: 550,  // Impact BONK / !? surprise
  4: 950,  // Contented smile (^w^) with yarn on head
  5: 850,  // Lifts yarn with raised paws
  6: 2000, // Crocheting with needles and floating music note
};

function HeroCatAnimation({ isMobile = false }) {
  const [stage, setStage] = useState(1);

  useEffect(() => {
    // Dynamic natural stage timings for smooth lively animation
    const timer = setTimeout(() => {
      setStage((prev) => (prev >= 6 ? 1 : prev + 1));
    }, STAGE_DURATIONS[stage] || 800);

    return () => clearTimeout(timer);
  }, [stage]);

  return (
    <div
      className={isMobile ? "hero-cat-wrapper hero-cat-mobile" : "hero-cat-wrapper hero-cat-desktop"}
      title="Click to replay kitty crochet animation! 🧶"
      onClick={() => setStage((prev) => (prev >= 6 ? 1 : prev + 1))}
    >
      <svg
        className="hero-cat-svg"
        viewBox="0 0 150 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="soft-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.1" />
          </filter>
        </defs>

        {/* =========================================================
            STAGE 1: YARN BALL FALLING FROM SKY, CAT PEEKING
            ========================================================= */}
        {stage === 1 && (
          <g className="stage-1-group cat-stage-group">
            {/* Speed streaks above yarn */}
            <line x1="75" y1="5" x2="75" y2="28" stroke="#a0b898" strokeWidth="2" strokeDasharray="4 3" />
            <line x1="64" y1="12" x2="64" y2="34" stroke="#a0b898" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="86" y1="10" x2="86" y2="32" stroke="#a0b898" strokeWidth="1.5" strokeDasharray="3 3" />

            {/* Sage Green Yarn Ball falling smoothly from top */}
            <g className="yarn-fall-1" transform="translate(75, 48)">
              <circle cx="0" cy="0" r="17" fill="#88A878" stroke="#5C7A4E" strokeWidth="1.8" />
              {/* Yarn thread lines */}
              <path d="M -11 -7 Q 0 -13 11 -7" stroke="#4B683E" strokeWidth="1.4" fill="none" />
              <path d="M -13 1 Q 0 -4 13 1" stroke="#4B683E" strokeWidth="1.4" fill="none" />
              <path d="M -10 9 Q 0 4 10 9" stroke="#4B683E" strokeWidth="1.4" fill="none" />
              <path d="M -7 -12 Q -1 0 5 12" stroke="#4B683E" strokeWidth="1.2" fill="none" />
              <circle cx="-5" cy="-5" r="3" fill="#A4C294" opacity="0.6" />
            </g>

            {/* White Kitten Head peeking from bottom */}
            <g transform="translate(75, 238)">
              {/* Ears */}
              <path d="M -34 -20 Q -40 -48 -18 -38 Z" fill="#FFFFFF" stroke="#222222" strokeWidth="2.4" strokeLinejoin="round" />
              <path d="M -30 -22 Q -34 -41 -22 -35 Z" fill="#FFAEC9" />
              <path d="M 34 -20 Q 40 -48 18 -38 Z" fill="#FFFFFF" stroke="#222222" strokeWidth="2.4" strokeLinejoin="round" />
              <path d="M 30 -22 Q 34 -41 22 -35 Z" fill="#FFAEC9" />

              {/* Head */}
              <ellipse cx="0" cy="0" rx="36" ry="28" fill="#FFFFFF" stroke="#222222" strokeWidth="2.4" />

              {/* Cute Eyes (looking forward/up) */}
              <circle cx="-14" cy="-3" r="3.8" fill="#222222" />
              <circle cx="-15.2" cy="-4.5" r="1.3" fill="#FFFFFF" />
              <circle cx="14" cy="-3" r="3.8" fill="#222222" />
              <circle cx="12.8" cy="-4.5" r="1.3" fill="#FFFFFF" />

              {/* Rosy Cheeks */}
              <ellipse cx="-23" cy="4" rx="5.5" ry="3.5" fill="#FFAAA6" opacity="0.75" />
              <ellipse cx="23" cy="4" rx="5.5" ry="3.5" fill="#FFAAA6" opacity="0.75" />

              {/* Nose & Happy Mouth (:3) */}
              <ellipse cx="0" cy="1" rx="1.6" ry="1.2" fill="#FFAEC9" />
              <path d="M -5 4 Q -2.5 7 0 4 Q 2.5 7 5 4" stroke="#222222" strokeWidth="1.8" strokeLinecap="round" fill="none" />

              {/* Cute Little Paws peeking at bottom */}
              <ellipse cx="-18" cy="24" rx="8" ry="5.5" fill="#FFFFFF" stroke="#222222" strokeWidth="2" />
              <ellipse cx="18" cy="24" rx="8" ry="5.5" fill="#FFFFFF" stroke="#222222" strokeWidth="2" />
            </g>
          </g>
        )}

        {/* =========================================================
            STAGE 2: YARN BALL FALLING LOWER, CAT LOOKING UP
            ========================================================= */}
        {stage === 2 && (
          <g className="stage-2-group cat-stage-group">
            {/* Speed streaks */}
            <line x1="75" y1="50" x2="75" y2="85" stroke="#a0b898" strokeWidth="2" strokeDasharray="4 3" />
            <line x1="64" y1="58" x2="64" y2="92" stroke="#a0b898" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="86" y1="56" x2="86" y2="90" stroke="#a0b898" strokeWidth="1.5" strokeDasharray="3 3" />

            {/* Yarn Ball zooming to mid-height */}
            <g className="yarn-fall-2" transform="translate(75, 115)">
              <circle cx="0" cy="0" r="17" fill="#88A878" stroke="#5C7A4E" strokeWidth="1.8" />
              <path d="M -11 -7 Q 0 -13 11 -7" stroke="#4B683E" strokeWidth="1.4" fill="none" />
              <path d="M -13 1 Q 0 -4 13 1" stroke="#4B683E" strokeWidth="1.4" fill="none" />
              <path d="M -10 9 Q 0 4 10 9" stroke="#4B683E" strokeWidth="1.4" fill="none" />
              <circle cx="-4" cy="-4" r="3" fill="#A4C294" opacity="0.6" />
            </g>

            {/* Cat looking up attentively */}
            <g transform="translate(75, 238)">
              {/* Ears slightly alert */}
              <path d="M -34 -20 Q -42 -50 -18 -40 Z" fill="#FFFFFF" stroke="#222222" strokeWidth="2.4" strokeLinejoin="round" />
              <path d="M -30 -22 Q -35 -43 -22 -37 Z" fill="#FFAEC9" />
              <path d="M 34 -20 Q 42 -50 18 -40 Z" fill="#FFFFFF" stroke="#222222" strokeWidth="2.4" strokeLinejoin="round" />
              <path d="M 30 -22 Q 35 -43 22 -37 Z" fill="#FFAEC9" />

              <ellipse cx="0" cy="0" rx="36" ry="28" fill="#FFFFFF" stroke="#222222" strokeWidth="2.4" />

              {/* Eyes shifted UP tracking the yarn */}
              <circle cx="-14" cy="-8" r="4.2" fill="#222222" />
              <circle cx="-15.5" cy="-10" r="1.5" fill="#FFFFFF" />
              <circle cx="14" cy="-8" r="4.2" fill="#222222" />
              <circle cx="12.5" cy="-10" r="1.5" fill="#FFFFFF" />

              {/* Cheeks */}
              <ellipse cx="-23" cy="3" rx="5.5" ry="3.5" fill="#FFAAA6" opacity="0.75" />
              <ellipse cx="23" cy="3" rx="5.5" ry="3.5" fill="#FFAAA6" opacity="0.75" />

              {/* Open curious mouth (:o) */}
              <ellipse cx="0" cy="4" rx="2.8" ry="3.5" fill="#FFAEC9" stroke="#222222" strokeWidth="1.5" />

              <ellipse cx="-18" cy="24" rx="8" ry="5.5" fill="#FFFFFF" stroke="#222222" strokeWidth="2" />
              <ellipse cx="18" cy="24" rx="8" ry="5.5" fill="#FFFFFF" stroke="#222222" strokeWidth="2" />
            </g>
          </g>
        )}

        {/* =========================================================
            STAGE 3: BONK / BOUNCE ON CAT HEAD WITH !? & SURPRISE
            ========================================================= */}
        {stage === 3 && (
          <g className="stage-3-group cat-stage-group">
            {/* Impact sparkle bursts */}
            <line x1="48" y1="178" x2="38" y2="168" stroke="#222222" strokeWidth="2" strokeLinecap="round" />
            <line x1="102" y1="178" x2="112" y2="168" stroke="#222222" strokeWidth="2" strokeLinecap="round" />
            <line x1="75" y1="168" x2="75" y2="158" stroke="#222222" strokeWidth="2" strokeLinecap="round" />

            {/* Comic !? and Sweat drops */}
            <text className="bonk-exclamation" x="14" y="196" fontFamily="'Comic Sans MS', sans-serif, system-ui" fontSize="24" fontWeight="bold" fill="#222222">
              !?
            </text>
            <path d="M 116 198 Q 120 192 122 198 Q 122 202 119 202 Q 116 202 116 198 Z" fill="#69C0FF" />

            {/* Yarn squishing slightly on cat's head */}
            <g transform="translate(75, 192)">
              <ellipse cx="0" cy="0" rx="18" ry="14" fill="#88A878" stroke="#5C7A4E" strokeWidth="1.8" />
              <path d="M -11 -5 Q 0 -10 11 -5" stroke="#4B683E" strokeWidth="1.4" fill="none" />
              <path d="M -13 2 Q 0 -2 13 2" stroke="#4B683E" strokeWidth="1.4" fill="none" />
              <path d="M -9 8 Q 0 4 9 8" stroke="#4B683E" strokeWidth="1.4" fill="none" />
            </g>

            {/* Cat with startled squinting face (> <) with squash & stretch */}
            <g className="cat-bonk-squash" transform="translate(75, 240)">
              {/* Ears flattened in surprise */}
              <path d="M -34 -16 Q -48 -32 -22 -32 Z" fill="#FFFFFF" stroke="#222222" strokeWidth="2.4" strokeLinejoin="round" />
              <path d="M -30 -18 Q -40 -28 -24 -28 Z" fill="#FFAEC9" />
              <path d="M 34 -16 Q 48 -32 22 -32 Z" fill="#FFFFFF" stroke="#222222" strokeWidth="2.4" strokeLinejoin="round" />
              <path d="M 30 -18 Q 40 -28 24 -28 Z" fill="#FFAEC9" />

              {/* Head with slight squash */}
              <ellipse cx="0" cy="0" rx="37" ry="26" fill="#FFFFFF" stroke="#222222" strokeWidth="2.4" />

              {/* Startled eyes (> <) */}
              <path d="M -19 -5 L -12 -1 L -19 3" stroke="#222222" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d="M 19 -5 L 12 -1 L 19 3" stroke="#222222" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />

              {/* Blushing cheeks */}
              <ellipse cx="-23" cy="4" rx="5.5" ry="3.5" fill="#FFAAA6" opacity="0.8" />
              <ellipse cx="23" cy="4" rx="5.5" ry="3.5" fill="#FFAAA6" opacity="0.8" />

              {/* Wobbly wavy open mouth */}
              <path d="M -6 6 Q -3 10 0 6 Q 3 10 6 6" stroke="#222222" strokeWidth="1.8" strokeLinecap="round" fill="none" />

              <ellipse cx="-18" cy="22" rx="8" ry="5.5" fill="#FFFFFF" stroke="#222222" strokeWidth="2" />
              <ellipse cx="18" cy="22" rx="8" ry="5.5" fill="#FFFFFF" stroke="#222222" strokeWidth="2" />
            </g>
          </g>
        )}

        {/* =========================================================
            STAGE 4: YARN RESTING SNUGLY ON HEAD, HAPPY SMILING CAT
            ========================================================= */}
        {stage === 4 && (
          <g className="stage-4-group cat-stage-group">
            {/* Yarn resting settled on head */}
            <g transform="translate(75, 186)">
              <circle cx="0" cy="0" r="16.5" fill="#88A878" stroke="#5C7A4E" strokeWidth="1.8" />
              <path d="M -11 -6 Q 0 -11 11 -6" stroke="#4B683E" strokeWidth="1.4" fill="none" />
              <path d="M -12 1 Q 0 -3 12 1" stroke="#4B683E" strokeWidth="1.4" fill="none" />
              <path d="M -9 8 Q 0 4 9 8" stroke="#4B683E" strokeWidth="1.4" fill="none" />
              <circle cx="-4" cy="-4" r="2.8" fill="#A4C294" opacity="0.6" />
            </g>

            {/* Happy contented Cat (^w^) with gentle purr */}
            <g className="cat-smile-settle" transform="translate(75, 238)">
              {/* Ears relaxed */}
              <path d="M -34 -20 Q -40 -48 -18 -38 Z" fill="#FFFFFF" stroke="#222222" strokeWidth="2.4" strokeLinejoin="round" />
              <path d="M -30 -22 Q -34 -41 -22 -35 Z" fill="#FFAEC9" />
              <path d="M 34 -20 Q 40 -48 18 -38 Z" fill="#FFFFFF" stroke="#222222" strokeWidth="2.4" strokeLinejoin="round" />
              <path d="M 30 -22 Q 34 -41 22 -35 Z" fill="#FFAEC9" />

              <ellipse cx="0" cy="0" rx="36" ry="28" fill="#FFFFFF" stroke="#222222" strokeWidth="2.4" />

              {/* Closed smiling curved eyes (^^) */}
              <path d="M -19 -2 Q -14 -8 -9 -2" stroke="#222222" strokeWidth="2.4" strokeLinecap="round" fill="none" />
              <path d="M 9 -2 Q 14 -8 19 -2" stroke="#222222" strokeWidth="2.4" strokeLinecap="round" fill="none" />

              {/* Extra rosy blush */}
              <ellipse cx="-23" cy="3" rx="6" ry="4" fill="#FFAAA6" opacity="0.85" />
              <ellipse cx="23" cy="3" rx="6" ry="4" fill="#FFAAA6" opacity="0.85" />

              {/* Cute smiling mouth */}
              <path d="M -5 4 Q -2.5 7 0 4 Q 2.5 7 5 4" stroke="#222222" strokeWidth="1.8" strokeLinecap="round" fill="none" />

              <ellipse cx="-18" cy="24" rx="8" ry="5.5" fill="#FFFFFF" stroke="#222222" strokeWidth="2" />
              <ellipse cx="18" cy="24" rx="8" ry="5.5" fill="#FFFFFF" stroke="#222222" strokeWidth="2" />
            </g>
          </g>
        )}

        {/* =========================================================
            STAGE 5: CAT POPS UP, LIFTS YARN WITH BOTH PAWS
            ========================================================= */}
        {stage === 5 && (
          <g className="stage-5-group cat-stage-group">
            {/* Motion sparkles/lines around lifting paws */}
            <path d="M 38 188 Q 34 196 38 204" stroke="#222222" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            <path d="M 112 188 Q 116 196 112 204" stroke="#222222" strokeWidth="1.6" strokeLinecap="round" fill="none" />

            {/* Yarn ball held up high in paws */}
            <g transform="translate(75, 185)">
              <circle cx="0" cy="0" r="16.5" fill="#88A878" stroke="#5C7A4E" strokeWidth="1.8" />
              <path d="M -11 -6 Q 0 -11 11 -6" stroke="#4B683E" strokeWidth="1.4" fill="none" />
              <path d="M -12 1 Q 0 -3 12 1" stroke="#4B683E" strokeWidth="1.4" fill="none" />
              <path d="M -9 8 Q 0 4 9 8" stroke="#4B683E" strokeWidth="1.4" fill="none" />
              <circle cx="-4" cy="-4" r="2.8" fill="#A4C294" opacity="0.6" />
            </g>

            {/* Cat body & Head popped up */}
            <g className="cat-lift-pop" transform="translate(75, 234)">
              {/* Ears */}
              <path d="M -34 -20 Q -42 -48 -18 -38 Z" fill="#FFFFFF" stroke="#222222" strokeWidth="2.4" strokeLinejoin="round" />
              <path d="M -30 -22 Q -35 -41 -22 -35 Z" fill="#FFAEC9" />
              <path d="M 34 -20 Q 42 -48 18 -38 Z" fill="#FFFFFF" stroke="#222222" strokeWidth="2.4" strokeLinejoin="round" />
              <path d="M 30 -22 Q 35 -41 22 -35 Z" fill="#FFAEC9" />

              {/* Head */}
              <ellipse cx="0" cy="0" rx="36" ry="28" fill="#FFFFFF" stroke="#222222" strokeWidth="2.4" />

              {/* Big Sparkling Happy Eyes */}
              <circle cx="-14" cy="-5" r="4.2" fill="#222222" />
              <circle cx="-15.5" cy="-7" r="1.5" fill="#FFFFFF" />
              <circle cx="-12.5" cy="-3.5" r="0.8" fill="#FFFFFF" />
              <circle cx="14" cy="-5" r="4.2" fill="#222222" />
              <circle cx="12.5" cy="-7" r="1.5" fill="#FFFFFF" />
              <circle cx="15.5" cy="-3.5" r="0.8" fill="#FFFFFF" />

              {/* Blush */}
              <ellipse cx="-23" cy="2" rx="5.5" ry="3.5" fill="#FFAAA6" opacity="0.8" />
              <ellipse cx="23" cy="2" rx="5.5" ry="3.5" fill="#FFAAA6" opacity="0.8" />

              {/* Smiling mouth */}
              <ellipse cx="0" cy="4" rx="2.5" ry="3" fill="#FFAEC9" stroke="#222222" strokeWidth="1.4" />

              {/* Both front paws raised UP holding the yarn ball! */}
              <path d="M -26 12 Q -24 -24 -14 -32" stroke="#222222" strokeWidth="2.4" fill="none" />
              <ellipse cx="-13" cy="-36" rx="7.5" ry="6" fill="#FFFFFF" stroke="#222222" strokeWidth="2" />

              <path d="M 26 12 Q 24 -24 14 -32" stroke="#222222" strokeWidth="2.4" fill="none" />
              <ellipse cx="13" cy="-36" rx="7.5" ry="6" fill="#FFFFFF" stroke="#222222" strokeWidth="2" />

              {/* Bottom paws */}
              <ellipse cx="-18" cy="28" rx="8" ry="5.5" fill="#FFFFFF" stroke="#222222" strokeWidth="2" />
              <ellipse cx="18" cy="28" rx="8" ry="5.5" fill="#FFFFFF" stroke="#222222" strokeWidth="2" />
            </g>
          </g>
        )}

        {/* =========================================================
            STAGE 6: CAT SITTING, CROCHETING A GREEN PIECE WITH NEEDLES!
            ========================================================= */}
        {stage === 6 && (
          <g className="stage-6-group cat-stage-group">
            {/* Pink Floating Music Note (♪) */}
            <g className="music-note-float" transform="translate(112, 175)">
              <ellipse cx="0" cy="6" rx="3.5" ry="2.5" fill="#FF758F" transform="rotate(-20)" />
              <line x1="2.5" y1="4" x2="2.5" y2="-8" stroke="#FF758F" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M 2.5 -8 Q 8 -11 9 -5" stroke="#FF758F" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            </g>

            {/* Sage Yarn ball resting on the floor to the left */}
            <g transform="translate(32, 252)">
              <circle cx="0" cy="0" r="15" fill="#88A878" stroke="#5C7A4E" strokeWidth="1.8" />
              <path d="M -10 -5 Q 0 -9 10 -5" stroke="#4B683E" strokeWidth="1.3" fill="none" />
              <path d="M -11 1 Q 0 -2 11 1" stroke="#4B683E" strokeWidth="1.3" fill="none" />
              <path d="M -8 7 Q 0 3 8 7" stroke="#4B683E" strokeWidth="1.3" fill="none" />
              <circle cx="-3" cy="-4" r="2.5" fill="#A4C294" opacity="0.6" />
            </g>

            {/* Yarn thread trailing from ball to cat's paws */}
            <path
              d="M 46 250 Q 56 254 62 248 Q 68 242 72 245"
              stroke="#5C7A4E"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />

            {/* Cat sitting and crocheting */}
            <g transform="translate(85, 236)">
              {/* Body */}
              <ellipse cx="0" cy="18" rx="28" ry="22" fill="#FFFFFF" stroke="#222222" strokeWidth="2.4" />

              {/* Ears */}
              <path d="M -32 -20 Q -38 -48 -16 -38 Z" fill="#FFFFFF" stroke="#222222" strokeWidth="2.4" strokeLinejoin="round" />
              <path d="M -28 -22 Q -32 -41 -20 -35 Z" fill="#FFAEC9" />
              <path d="M 32 -20 Q 38 -48 16 -38 Z" fill="#FFFFFF" stroke="#222222" strokeWidth="2.4" strokeLinejoin="round" />
              <path d="M 28 -22 Q 32 -41 20 -35 Z" fill="#FFAEC9" />

              {/* Head */}
              <ellipse cx="0" cy="0" rx="35" ry="27" fill="#FFFFFF" stroke="#222222" strokeWidth="2.4" />

              {/* Happy curved eyes (^^) */}
              <path d="M -18 -3 Q -13 -9 -8 -3" stroke="#222222" strokeWidth="2.4" strokeLinecap="round" fill="none" />
              <path d="M 8 -3 Q 13 -9 18 -3" stroke="#222222" strokeWidth="2.4" strokeLinecap="round" fill="none" />

              {/* Blush */}
              <ellipse cx="-22" cy="2" rx="5.5" ry="3.5" fill="#FFAAA6" opacity="0.8" />
              <ellipse cx="22" cy="2" rx="5.5" ry="3.5" fill="#FFAAA6" opacity="0.8" />

              {/* Happy smiling cat mouth (:3) */}
              <path d="M -5 3 Q -2.5 6 0 3 Q 2.5 6 5 3" stroke="#222222" strokeWidth="1.8" strokeLinecap="round" fill="none" />

              {/* Rhythmic Crochet Hook / Knitting Needles in paws */}
              <g className="crochet-needles-motion">
                <line x1="-16" y1="12" x2="14" y2="30" stroke="#7A685D" strokeWidth="2.2" strokeLinecap="round" />
                <line x1="16" y1="12" x2="-14" y2="30" stroke="#7A685D" strokeWidth="2.2" strokeLinecap="round" />

                {/* The Green Crochet Patch in paws! */}
                <g transform="translate(0, 22)">
                  <rect x="-10" y="-4" width="20" height="15" rx="3" fill="#88A878" stroke="#5C7A4E" strokeWidth="1.4" />
                  <line x1="-7" y1="1" x2="7" y2="1" stroke="#4B683E" strokeWidth="1" strokeDasharray="2 1.5" />
                  <line x1="-7" y1="6" x2="7" y2="6" stroke="#4B683E" strokeWidth="1" strokeDasharray="2 1.5" />
                </g>
              </g>

              {/* Paws holding the needles & work */}
              <ellipse cx="-13" cy="18" rx="6.5" ry="5.5" fill="#FFFFFF" stroke="#222222" strokeWidth="2" />
              <ellipse cx="13" cy="18" rx="6.5" ry="5.5" fill="#FFFFFF" stroke="#222222" strokeWidth="2" />

              {/* Little feet at bottom */}
              <ellipse cx="-18" cy="36" rx="8" ry="5" fill="#FFFFFF" stroke="#222222" strokeWidth="2" />
              <ellipse cx="18" cy="36" rx="8" ry="5.5" fill="#FFFFFF" stroke="#222222" strokeWidth="2" />
            </g>
          </g>
        )}
      </svg>
    </div>
  );
}

export default function App() {
  const [slide, setSlide] = useState(0);
  const [shopOpen, setShopOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailQuantity, setDetailQuantity] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showMessage, setShowMessage] = useState("");
  const [showAccountModal, setShowAccountModal] = useState(false);

  // Track recently viewed product IDs in sessionStorage
  const [recentlyViewedIds, setRecentlyViewedIds] = useState(() => {
    try {
      const stored = sessionStorage.getItem("trp_recently_viewed");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Customer Authentication & Popup State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const u = localStorage.getItem("trp_user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authNotice, setAuthNotice] = useState("");
  const [pendingCartAction, setPendingCartAction] = useState(null);

  // Rotating announcement state for mobile carousel
  const [announcementIndex, setAnnouncementIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % ANNOUNCEMENT_MESSAGES.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  // Admin View State
  const [isAdminView, setIsAdminView] = useState(() => {
    return window.location.hash === "#admin" || window.location.pathname === "/admin";
  });

  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === "#admin" || window.location.pathname === "/admin") {
        setIsAdminView(true);
      } else {
        setIsAdminView(false);
      }
    };
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  // Products loaded from backend database (with graceful fallback to default catalogue)
  const [productList, setProductList] = useState(products);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.products) && data.products.length > 0) {
          const mapped = data.products.map((p) => {
            const id = p.originalId || p._id;
            let img = p.image;
            if (id === 1 || p.name.includes("Sunflower Bouquet")) img = sunflowerbouquet;
            else if (id === 2 || p.name.includes("Flower Keychains")) img = sunflowerkeychain;
            else if (id === 3 || p.name.includes("Four Leaf Clover")) img = fourleafcloverkeychain;
            else if (id === 4 || p.name.includes("Butterfly Hairtie")) img = butterflyhairtie;
            else if (id === 5 || p.name.includes("Bow Clip")) img = bowhairtie;
            else if (id === 7 || p.name.includes("Blue Dream")) img = bluedreambouquet;
            else if (id === 9 || p.name.includes("Crimson Lily")) img = crimsonlilybouquet;
            else if (id === 10 || p.name.includes("Mini Forever")) img = miniforeverbouquet;
            return {
              ...p,
              id,
              image: img,
            };
          }).filter((p) => p.type !== "Paintings");
          setProductList(mapped);
        }
      })
      .catch((err) => {
        console.warn("Backend API not reachable, using offline catalog:", err);
      });
  }, []);

  // Verify auth session on load & trigger first-time visitor login popup
  useEffect(() => {
    const token = localStorage.getItem("trp_token");
    if (token) {
      fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data && data.success) {
            setCurrentUser(data.user);
            localStorage.setItem("trp_user", JSON.stringify(data.user));
            // Sync cart from backend
            fetch("/api/cart", {
              headers: { Authorization: `Bearer ${token}` },
            })
              .then((cRes) => cRes.json())
              .then((cData) => {
                if (cData && cData.success && Array.isArray(cData.cart) && cData.cart.length > 0) {
                  setCart(cData.cart);
                }
              })
              .catch(() => { });
          } else {
            localStorage.removeItem("trp_token");
            localStorage.removeItem("trp_user");
            setCurrentUser(null);
          }
        })
        .catch(() => { });
    } else {
      const dismissed = sessionStorage.getItem("trp_login_dismissed");
      if (!dismissed) {
        const timer = setTimeout(() => {
          setShowAuthModal(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  // PWA Installation Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () =>
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const installPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setCanInstall(false);
      }
      setDeferredPrompt(null);
    }
  };

  // Cart State (Persisted in localStorage & synchronized with backend)
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("trp_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("trp_cart", JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  const syncBackendCart = (cartItems) => {
    const token = localStorage.getItem("trp_token");
    if (token) {
      fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items: cartItems }),
      }).catch(() => { });
    }
  };

  // Wishlist State (Persisted in localStorage)
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem("trp_wishlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [showWishlist, setShowWishlist] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("trp_wishlist", JSON.stringify(wishlist));
    } catch {
      // ignore
    }
  }, [wishlist]);

  // Hero carousel auto-advance timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSlide((s) => (s + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const current = slides[slide];

  // Filtering products
  const visibleProducts = productList.filter((p) => {
    const matchesFilter = filter === "All" || p.type === filter;
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const nextSlide = () => setSlide((s) => (s + 1) % slides.length);
  const prevSlide = () => setSlide((s) => (s - 1 + slides.length) % slides.length);

  const showPopup = (msg) => {
    setShowMessage(msg);
    setTimeout(() => {
      setShowMessage("");
    }, 2800);
  };

  const isWishlisted = (product) => {
    if (!product) return false;
    const prodId = product.id || product._id;
    return wishlist.some((item) => (item.id || item._id) === prodId);
  };

  const toggleWishlist = (product) => {
    if (!product) return;
    const prodId = product.id || product._id;
    const exists = isWishlisted(product);
    if (exists) {
      setWishlist((currentList) =>
        currentList.filter((item) => (item.id || item._id) !== prodId)
      );
      showPopup(`${product.name} removed from wishlist`);
    } else {
      setWishlist((currentList) => [...currentList, product]);
      showPopup(`${product.name} added to wishlist ♡`);
    }
  };

  // Internal Add to Cart execution
  const executeAddToCart = (product, quantity = 1) => {
    if (!product) return;
    const prodId = product.id || product._id;
    setCart((currentCart) => {
      const existing = currentCart.find((item) => (item.id || item.productId || item._id) === prodId);
      let updated;
      if (existing) {
        updated = currentCart.map((item) =>
          (item.id || item.productId || item._id) === prodId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        updated = [...currentCart, { ...product, id: prodId, quantity }];
      }
      syncBackendCart(updated);
      return updated;
    });
    showPopup("Added to your cart ♡");
  };

  // Add to cart — REQUIRES LOGIN FOR GUESTS
  const addToCart = (product, quantity = 1) => {
    if (!product) return;
    if (!currentUser) {
      setPendingCartAction({ product, quantity });
      setAuthNotice("Please sign in or create an account to add items to your cart.");
      setShowAuthModal(true);
      return;
    }
    executeAddToCart(product, quantity);
  };

  const increaseQuantity = (id) => {
    setCart((currentCart) => {
      const updated = currentCart.map((item) =>
        (item.id || item.productId || item._id) === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      syncBackendCart(updated);
      return updated;
    });
  };

  const decreaseQuantity = (id) => {
    setCart((currentCart) => {
      const updated = currentCart
        .map((item) =>
          (item.id || item.productId || item._id) === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0);
      syncBackendCart(updated);
      return updated;
    });
  };

  const removeFromCart = (id) => {
    setCart((currentCart) => {
      const updated = currentCart.filter(
        (item) => (item.id || item.productId || item._id) !== id
      );
      syncBackendCart(updated);
      return updated;
    });
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const orderSingleOnWhatsApp = (product, quantity = 1) => {
    if (!product) return;

    // Record enquiry in backend
    const token = localStorage.getItem("trp_token");
    fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        customerName: currentUser ? currentUser.name : "WhatsApp Customer",
        customerEmail: currentUser ? currentUser.email : "whatsapp.enquiry@theethrealpalatte.com",
        customerPhone: currentUser ? currentUser.phone || "+91 8088645598" : "+91 8088645598",
        items: [{ ...product, quantity }],
        orderType: "whatsapp_enquiry",
      }),
    }).catch(() => { });

    const message =
      `Hi! I'd like to order:\n\n` +
      `Product: ${product.name}\n` +
      `Price: ₹${product.price.toLocaleString("en-IN")}\n` +
      `Quantity: ${quantity}\n\n` +
      `Please let me know how I can proceed with the order. Thank you! ♡`;

    const whatsappUrl = `https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const orderCartOnWhatsApp = () => {
    if (cart.length === 0) return;

    // Record enquiry in backend
    const token = localStorage.getItem("trp_token");
    fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        customerName: currentUser ? currentUser.name : "WhatsApp Customer",
        customerEmail: currentUser ? currentUser.email : "whatsapp.enquiry@theethrealpalatte.com",
        customerPhone: currentUser ? currentUser.phone || "+91 8088645598" : "+91 8088645598",
        items: cart,
        orderType: "whatsapp_enquiry",
      }),
    }).catch(() => { });

    let message =
      `Hello Theethrealpalatte! 🌷\n\n` +
      `I would like to place an order:\n\n`;

    cart.forEach((item) => {
      message += `${item.name} × ${item.quantity} — ₹${(
        item.price * item.quantity
      ).toLocaleString("en-IN")}\n`;
    });

    message +=
      `\nTotal: ₹${cartTotal.toLocaleString("en-IN")}\n\n` +
      `Please let me know the next steps. Thank you! 🤍`;

    const whatsappURL = `https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, "_blank", "noopener,noreferrer");
  };

  // If viewing admin portal, render AdminDashboard
  if (isAdminView) {
    return (
      <AdminDashboard
        onBackToStore={() => {
          setIsAdminView(false);
          window.location.hash = "";
        }}
      />
    );
  }

  const scrollToSection = (id) => {
    setSelectedProduct(null);
    setMenuOpen(false);
    setShopOpen(false);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 50);
  };

  const openProductDetail = (product) => {
    if (!product) {
      setSelectedProduct(null);
      return;
    }
    setSelectedProduct(product);
    setDetailQuantity(1);
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Track recently viewed in sessionStorage (most recent first, exclude current from prior list)
    setRecentlyViewedIds((prev) => {
      const pId = product.id;
      const filtered = prev.filter((id) => id !== pId);
      const next = [pId, ...filtered].slice(0, 10);
      try {
        sessionStorage.setItem("trp_recently_viewed", JSON.stringify(next));
      } catch (e) {
        console.warn("Could not write recently viewed:", e);
      }
      return next;
    });
  };

  // Related products: 4 products, excluding current, prioritizing same category
  const relatedProducts = useMemo(() => {
    if (!selectedProduct) return [];
    const sameCategory = productList.filter(
      (p) => p.id !== selectedProduct.id && p.type === selectedProduct.type
    );
    const otherCategory = productList.filter(
      (p) => p.id !== selectedProduct.id && p.type !== selectedProduct.type
    );
    return [...sameCategory, ...otherCategory].slice(0, 4);
  }, [selectedProduct, productList]);

  // Recently Viewed products: up to 4 previously viewed items, most recent first, excluding current
  const recentlyViewedProducts = useMemo(() => {
    if (!selectedProduct) return [];
    const ids = recentlyViewedIds.filter((id) => id !== selectedProduct.id);
    const found = [];
    for (const id of ids) {
      const match = productList.find((p) => p.id === id);
      if (match) {
        found.push(match);
      }
      if (found.length === 4) break;
    }
    return found;
  }, [selectedProduct, recentlyViewedIds, productList]);

  return (
    <div className="site">
      {/* Persistent Mobile Floating Cat (bottom-left corner on all pages) */}
      <HeroCatAnimation isMobile />

      {/* ANNOUNCEMENT BAR */}
      <aside className="announcement">
        <div className="announcement-desktop">
          <span>✦ Handmade with love</span>
          <span>|</span>
          <span>Made to order</span>
          <span>|</span>
          <span>Customization available</span>
          <span>|</span>
          <span>Free shipping on orders above ₹999</span>
          <span>✦</span>
        </div>
        <div className="announcement-mobile" aria-live="polite">
          <div className="announcement-mobile-rotating">
            <span key={announcementIndex} className="announcement-slide">
              {ANNOUNCEMENT_MESSAGES[announcementIndex]}
            </span>
          </div>
          <div className="announcement-mobile-shipping">
            <span>Free shipping on orders above ₹999</span>
          </div>
        </div>
      </aside>

      {/* HEADER */}
      <header className="header">
        <button
          className="mobile-icon"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <a
          className="logo"
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            setSelectedProduct(null);
            scrollToSection("home");
          }}
        >
          Theethrealpalatte
          <span className="logo-floral" aria-hidden="true">
            <svg
              width="16"
              height="16"
              viewBox="0 0 20 20"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="10" cy="5.5" r="2.6" opacity="0.9" />
              <circle cx="14.2" cy="8.6" r="2.6" opacity="0.9" />
              <circle cx="12.6" cy="13.6" r="2.6" opacity="0.9" />
              <circle cx="7.4" cy="13.6" r="2.6" opacity="0.9" />
              <circle cx="5.8" cy="8.6" r="2.6" opacity="0.9" />
              <circle cx="10" cy="10" r="1.8" fill="#FFF8F7" />
            </svg>
          </span>
        </a>

        <nav className={`nav ${menuOpen ? "nav-open" : ""}`}>
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              setSelectedProduct(null);
              scrollToSection("home");
            }}
          >
            Home
          </a>

          <div className="shop-nav">
            <button
              onClick={() => setShopOpen(!shopOpen)}
              aria-expanded={shopOpen}
              aria-haspopup="true"
            >
              Shop
              <ChevronDown size={15} className={shopOpen ? "rotated" : ""} />
            </button>

            {shopOpen && (
              <div className="shop-menu">
                <a
                  href="#products"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedProduct(null);
                    setFilter("All");
                    scrollToSection("products");
                  }}
                >
                  All
                </a>
                <a
                  href="#products"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedProduct(null);
                    setFilter("Crochet");
                    scrollToSection("products");
                  }}
                >
                  Crochet
                </a>
                <a
                  href="#products"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedProduct(null);
                    setFilter("Bloom Studio");
                    scrollToSection("products");
                  }}
                >
                  Bloom Studio
                </a>
              </div>
            )}
          </div>

          <a
            href="#about"
            onClick={(e) => {
              e.preventDefault();
              setSelectedProduct(null);
              scrollToSection("about");
            }}
          >
            About
          </a>

          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              setSelectedProduct(null);
              scrollToSection("contact");
            }}
          >
            Contact
          </a>

          <button
            className="mobile-nav-account-btn"
            onClick={() => {
              setMenuOpen(false);
              if (currentUser) {
                setShowAccountModal(true);
              } else {
                setAuthNotice("");
                setShowAuthModal(true);
              }
            }}
          >
            <UserRound size={17} />
            <span>{currentUser ? `My Account (${currentUser.name})` : "Sign In / Register"}</span>
          </button>
        </nav>

        <div className="header-actions">
          <button
            aria-label="Search collection"
            onClick={() => setShowSearch(!showSearch)}
            className="action-btn"
          >
            <Search size={19} />
          </button>

          <button
            className="action-btn wishlist-btn"
            aria-label="View Wishlist"
            onClick={() => setShowWishlist(true)}
          >
            <Heart size={19} fill={wishlist.length > 0 ? "var(--blush-strong)" : "none"} />
            {wishlist.length > 0 && <span className="badge">{wishlist.length}</span>}
          </button>

          <button
            className="action-btn account-btn"
            aria-label="Account"
            onClick={() => {
              if (currentUser) {
                setShowAccountModal(true);
              } else {
                setAuthNotice("");
                setShowAuthModal(true);
              }
            }}
            title={currentUser ? `Logged in as ${currentUser.name}` : "Sign In / Register"}
          >
            <UserRound size={19} />
          </button>

          <button
            className="action-btn cart-btn"
            aria-label="View Cart"
            onClick={() => setShowCart(true)}
          >
            <ShoppingBag size={19} />
            <span className="cart-badge">{cartCount}</span>
          </button>
        </div>
      </header>

      {/* SEARCH BAR (ACCORDION) */}
      {showSearch && (
        <div className="search-box-wrap">
          <input
            type="text"
            placeholder="Search crochet, bouquets, keychains, flowers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          <button
            onClick={() => {
              setSearchQuery("");
              setShowSearch(false);
            }}
            className="search-close-btn"
          >
            ✕
          </button>
        </div>
      )}

      {/* MAIN VIEW */}
      {selectedProduct ? (
        /* ==================================================
           PRODUCT DETAIL PAGE (EXACTLY MATCHING IMAGE 2)
        ================================================== */
        <main>
          <section className="product-detail">
            {/* ONLY BACK ARROW BUTTON (EXACTLY LIKE IMAGE 2) */}
            <button
              className="product-detail-back"
              onClick={() => setSelectedProduct(null)}
              aria-label="Back to Shop"
            >
              ←
            </button>

            <div className="product-detail-content">
              {/* IMAGE COLUMN WITH CORNER WISHLIST HEART */}
              <div className="product-detail-image">
                <button
                  className="detail-image-wishlist"
                  onClick={() => toggleWishlist(selectedProduct)}
                  aria-label={
                    isWishlisted(selectedProduct)
                      ? "Remove from wishlist"
                      : "Add to wishlist"
                  }
                >
                  <Heart
                    size={20}
                    fill={isWishlisted(selectedProduct) ? "#c94a4a" : "none"}
                    color={isWishlisted(selectedProduct) ? "#c94a4a" : "currentColor"}
                  />
                </button>

                <img src={selectedProduct.image} alt={selectedProduct.name} />
              </div>

              {/* PRODUCT INFO COLUMN */}
              <div className="product-detail-info">
                <p className="eyebrow">{selectedProduct.type}</p>
                <h1>{selectedProduct.name}</h1>
                <p className="product-detail-price">
                  ₹{selectedProduct.price.toLocaleString("en-IN")}
                </p>

                {/* DESCRIPTION */}
                <p className="product-detail-description">
                  {selectedProduct.description.split("\n").map((line, idx) => (
                    <React.Fragment key={idx}>
                      {line}
                      {idx < selectedProduct.description.split("\n").length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </p>

                {/* QUANTITY SELECTOR [-] 1 [+] */}
                <div className="product-quantity">
                  <button
                    onClick={() => setDetailQuantity(Math.max(1, detailQuantity - 1))}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span>{detailQuantity}</span>
                  <button
                    onClick={() => setDetailQuantity(detailQuantity + 1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                {/* ACTION BUTTONS (SOLID BLACK ADD TO CART & OUTLINE WHATSAPP) */}
                <div className="product-actions">
                  <button
                    className="detail-add-cart"
                    onClick={() => addToCart(selectedProduct, detailQuantity)}
                  >
                    <ShoppingBag size={18} />
                    Add to Cart
                  </button>

                  <button
                    className="detail-whatsapp-btn"
                    onClick={() => orderSingleOnWhatsApp(selectedProduct, detailQuantity)}
                  >
                    <MessageCircle size={18} />
                    Order on WhatsApp
                  </button>
                </div>
              </div>
            </div>

            {/* YOU MAY ALSO LIKE (RELATED PRODUCTS) */}
            {relatedProducts.length > 0 && (
              <div className="product-recommendations-section">
                <div className="section-heading" style={{ marginTop: "70px", marginBottom: "32px" }}>
                  <span></span>
                  <h2>You May Also Like</h2>
                  <span></span>
                  <p>HANDPICKED FOR YOU</p>
                </div>
                <div className="related-product-grid">
                  {relatedProducts.map((p) => (
                    <article
                      key={p.id}
                      className="product-card related-card"
                      onClick={() => openProductDetail(p)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="product-image">
                        <img src={p.image} alt={p.name} />
                      </div>
                      <div className="product-info">
                        <div>
                          <h3 onClick={() => openProductDetail(p)} style={{ cursor: "pointer" }}>
                            {p.name}
                          </h3>
                          <p>₹{p.price.toLocaleString("en-IN")}</p>
                        </div>
                      </div>
                      <button
                        className="view-product-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          openProductDetail(p);
                        }}
                      >
                        View Product →
                      </button>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* RECENTLY VIEWED */}
            {recentlyViewedProducts.length > 0 && (
              <div className="product-recommendations-section">
                <div className="section-heading" style={{ marginTop: "60px", marginBottom: "32px" }}>
                  <span></span>
                  <h2>Recently Viewed</h2>
                  <span></span>
                  <p>PREVIOUSLY EXPLORED</p>
                </div>
                <div className="related-product-grid">
                  {recentlyViewedProducts.map((p) => (
                    <article
                      key={p.id}
                      className="product-card related-card"
                      onClick={() => openProductDetail(p)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="product-image">
                        <img src={p.image} alt={p.name} />
                      </div>
                      <div className="product-info">
                        <div>
                          <h3 onClick={() => openProductDetail(p)} style={{ cursor: "pointer" }}>
                            {p.name}
                          </h3>
                          <p>₹{p.price.toLocaleString("en-IN")}</p>
                        </div>
                      </div>
                      <button
                        className="view-product-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          openProductDetail(p);
                        }}
                      >
                        View Product →
                      </button>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </section>
        </main>
      ) : (
        /* ==================================================
           HOMEPAGE VIEW (MATCHING IMAGES 1, 3, 4, 5)
        ================================================== */
        <main id="home">
          {/* HERO SECTION WITH EXACT 6-STAGE CAT ANIMATION */}
          <section className="hero">
            <button
              className="hero-arrow left"
              onClick={prevSlide}
              aria-label="Previous slide"
            >
              <ChevronLeft size={20} />
            </button>

            {/* DEDICATED LEFT CORRIDOR CAT ANIMATION (ZERO COLLISION WITH BUTTONS OR TEXT) */}
            <HeroCatAnimation />

            <div className="hero-copy">
              <div className="eyebrow">
                <span>✦</span>
                <span>{current.eyebrow}</span>
              </div>
              <h1>{current.title}</h1>
              <div className="title-line"></div>
              <p>{current.text}</p>
              <button
                className="primary-btn"
                onClick={() => {
                  setFilter(current.filter);
                  scrollToSection("products");
                }}
              >
                Shop Now →
              </button>
            </div>

            <div className="hero-image-wrap">
              <img
                src={current.image}
                alt={current.alt}
                className="hero-image"
                style={{ objectPosition: current.position || "center center" }}
              />
              <div className="hero-soft-overlay"></div>
            </div>

            <button
              className="hero-arrow right"
              onClick={nextSlide}
              aria-label="Next slide"
            >
              <ChevronRight size={20} />
            </button>
          </section>

          {/* PRODUCTS CATALOG SECTION */}
          <section className="products-section" id="products">
            <div className="section-heading">
              <span></span>
              <h2>{filter === "Bloom Studio" ? "Bloom Studio" : filter === "Crochet" ? "Crochet Collection" : "Our Collection"}</h2>
              <span></span>
              <p>{filter === "Bloom Studio" ? "Chenille Flower Bouquets" : "HANDMADE WITH LOVE"}</p>
            </div>

            {/* CATEGORY FILTERS */}
            <div className="filters">
              {["All", "Crochet", "Bloom Studio"].map((category) => (
                <button
                  key={category}
                  className={filter === category ? "selected" : ""}
                  onClick={() => setFilter(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* PRODUCT GRID */}
            <div className="product-grid">
              {visibleProducts.map((p) => (
                <article key={p.id} className="product-card">
                  <div className="product-image">
                    <button
                      className="wishlist"
                      aria-label="Wishlist toggle"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(p);
                      }}
                    >
                      <Heart
                        size={17}
                        fill={isWishlisted(p) ? "#c94a4a" : "none"}
                        color={isWishlisted(p) ? "#c94a4a" : "currentColor"}
                      />
                    </button>

                    <img
                      src={p.image}
                      alt={p.name}
                      onClick={() => openProductDetail(p)}
                      style={{ cursor: "pointer" }}
                    />
                  </div>

                  <div className="product-info">
                    <div>
                      <h3
                        onClick={() => openProductDetail(p)}
                        style={{ cursor: "pointer" }}
                      >
                        {p.name}
                      </h3>
                      <p>₹{p.price.toLocaleString("en-IN")}</p>
                    </div>

                    <div className="card-quick-actions">
                      <button
                        className="add-cart"
                        aria-label="Add to cart"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(p, 1);
                        }}
                        title="Add to cart"
                      >
                        <ShoppingBag size={15} />
                      </button>
                      <button
                        className="card-whatsapp-quick"
                        aria-label="Order on WhatsApp"
                        onClick={(e) => {
                          e.stopPropagation();
                          orderSingleOnWhatsApp(p, 1);
                        }}
                        title="Order on WhatsApp"
                      >
                        <MessageCircle size={15} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {visibleProducts.length === 0 && (
              <div className="empty-state">
                <p>No pieces found matching your selection.</p>
                <button
                  className="primary-btn"
                  style={{ marginTop: "16px" }}
                  onClick={() => {
                    setFilter("All");
                    setSearchQuery("");
                  }}
                >
                  View All Pieces
                </button>
              </div>
            )}
          </section>

          {/* ABOUT SECTION (EXACT REFERENCE MATCH) */}
          <section className="about-section" id="about">
            <div className="about-container">
              <span className="about-eyebrow">ABOUT THEETHREALPALATTE</span>
              <div className="about-content">
                <h2 className="about-title">
                  Made slowly.<br />
                  Made with feeling.
                </h2>
                <div className="about-body">
                  <p className="about-p1">
                    Theethrealpalatte is a little space for handmade things, thoughtful details, and art made from the heart.
                  </p>
                  <p className="about-p2">
                    From delicate crochet pieces to original paintings, every creation is made by hand, one piece at a time. No two pieces are exactly alike — and that's what makes them special.
                  </p>
                  <p className="about-signature">— Theethrealpalatte</p>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* CONTACT SECTION & FOOTER (MATCHING UPLOADED REFERENCE) */}
      <footer className="contact-section" id="contact">
        <div className="contact-container">
          <div className="contact-columns">
            {/* Left column */}
            <div className="contact-left">
              <span className="contact-eyebrow">GET IN TOUCH</span>
              <h2 className="contact-heading">
                Let's create something<br />beautiful.
              </h2>
              <p className="contact-description">
                Have a question, want to place an order, or simply want to say hello? We'd
                love to hear from you.
              </p>
            </div>

            {/* Right column: 3 horizontal contact rows */}
            <div className="contact-right">
              <a href={`mailto:${BUSINESS_CONFIG.email}`} className="contact-row">
                <span className="contact-label">EMAIL</span>
                <span className="contact-val">{BUSINESS_CONFIG.email}</span>
              </a>

              <a
                href={BUSINESS_CONFIG.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-row"
              >
                <span className="contact-label">INSTAGRAM</span>
                <span className="contact-val">{BUSINESS_CONFIG.instagramHandle}</span>
              </a>

              <a
                href={`https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent("Hello Theethrealpalatte! 🌸 I would like to enquire about your creations.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-row"
              >
                <span className="contact-label">WHATSAPP</span>
                <span className="contact-val">Message us</span>
              </a>
            </div>
          </div>

          <div className="contact-footer-divider"></div>

          <div className="contact-bottom">
            <p>© 2026 Theethrealpalatte</p>
            <p>Handmade with love.</p>
          </div>
        </div>
      </footer>

      {/* CART SLIDE-OUT DRAWER */}
      {showCart && (
        <div
          className="overlay"
          onClick={() => setShowCart(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Shopping Cart"
        >
          <div className="cart-panel" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-panel"
              onClick={() => setShowCart(false)}
              aria-label="Close cart"
            >
              <X size={20} />
            </button>

            <h2>Your Cart ({cartCount})</h2>

            {cart.length === 0 ? (
              <div className="empty-state">
                <p>Your cart is empty.</p>
                <button
                  className="primary-btn"
                  style={{ marginTop: "16px" }}
                  onClick={() => {
                    setShowCart(false);
                    scrollToSection("products");
                  }}
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items-scroll">
                  {cart.map((item) => (
                    <div className="cart-item" key={item.id}>
                      <img
                        src={item.image}
                        alt={item.name}
                        onClick={() => {
                          setShowCart(false);
                          openProductDetail(item);
                        }}
                      />
                      <div className="cart-item-info">
                        <h3
                          onClick={() => {
                            setShowCart(false);
                            openProductDetail(item);
                          }}
                        >
                          {item.name}
                        </h3>
                        <p>
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </p>
                        <div className="quantity-controls">
                          <button onClick={() => decreaseQuantity(item.id)}>
                            −
                          </button>
                          <span>{item.quantity}</span>
                          <button onClick={() => increaseQuantity(item.id)}>
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        className="item-remove-btn"
                        onClick={() => removeFromCart(item.id)}
                        aria-label="Remove item"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div className="cart-footer">
                  <div className="cart-total">
                    <strong>Total</strong>
                    <strong>₹{cartTotal.toLocaleString("en-IN")}</strong>
                  </div>

                  <button
                    className="checkout-whatsapp-btn"
                    onClick={orderCartOnWhatsApp}
                  >
                    <MessageCircle size={18} />
                    Order on WhatsApp
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* WISHLIST SLIDE-OUT DRAWER */}
      {showWishlist && (
        <div
          className="overlay"
          onClick={() => setShowWishlist(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Wishlist drawer"
        >
          <div className="cart-panel" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-panel"
              onClick={() => setShowWishlist(false)}
              aria-label="Close wishlist"
            >
              <X size={20} />
            </button>

            <h2>Saved Pieces ({wishlist.length})</h2>

            {wishlist.length === 0 ? (
              <div className="empty-state">
                <p>Your wishlist is currently empty.</p>
                <button
                  className="primary-btn"
                  style={{ marginTop: "16px" }}
                  onClick={() => {
                    setShowWishlist(false);
                    scrollToSection("products");
                  }}
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              <div className="cart-items-scroll">
                {wishlist.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <img
                      src={item.image}
                      alt={item.name}
                      onClick={() => {
                        setShowWishlist(false);
                        openProductDetail(item);
                      }}
                    />
                    <div className="cart-item-info">
                      <h3
                        onClick={() => {
                          setShowWishlist(false);
                          openProductDetail(item);
                        }}
                      >
                        {item.name}
                      </h3>
                      <p>₹{item.price.toLocaleString("en-IN")}</p>
                      <div className="cart-item-actions">
                        <button
                          className="item-add-cart-btn"
                          onClick={() => {
                            addToCart(item, 1);
                          }}
                        >
                          Add to Cart
                        </button>
                        <button
                          className="item-whatsapp-btn"
                          onClick={() => orderSingleOnWhatsApp(item, 1)}
                        >
                          Order
                        </button>
                      </div>
                    </div>
                    <button
                      className="item-remove-btn"
                      onClick={() => toggleWishlist(item)}
                      aria-label="Remove from wishlist"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ACCOUNT MODAL */}
      {showAccountModal && (
        <div
          className="overlay"
          onClick={() => setShowAccountModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="account-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-panel"
              onClick={() => setShowAccountModal(false)}
            >
              <X size={20} />
            </button>
            <div className="account-modal-header">
              <span className="account-avatar">🤍</span>
              <h3>
                {currentUser ? `Welcome back, ${currentUser.name}` : "Welcome to Theethrealpalatte"}
              </h3>
              <p>
                {currentUser
                  ? currentUser.email
                  : "Handmade crochet & original paintings made slowly with love."}
              </p>
            </div>
            <div className="account-menu">
              {currentUser?.role === "admin" && (
                <button
                  style={{ fontWeight: "600", color: "var(--espresso)" }}
                  onClick={() => {
                    setShowAccountModal(false);
                    setIsAdminView(true);
                    window.location.hash = "admin";
                  }}
                >
                  <span style={{ marginRight: "6px" }}>⚙️</span>
                  <span>Admin Management Portal</span>
                </button>
              )}
              <button
                onClick={() => {
                  setShowAccountModal(false);
                  setShowWishlist(true);
                }}
              >
                <Heart size={18} />
                <span>My Saved Pieces ({wishlist.length})</span>
              </button>
              <button
                onClick={() => {
                  setShowAccountModal(false);
                  setShowCart(true);
                }}
              >
                <ShoppingBag size={18} />
                <span>My Cart ({cartCount})</span>
              </button>
              <a
                href={`https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent("Hello! I would like to request a custom crochet / bouquet order.")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={18} />
                <span>Request Custom Order on WhatsApp</span>
              </a>
              {currentUser ? (
                <button
                  style={{ color: "#9b1c1c", marginTop: "12px", borderTop: "1px solid var(--line)", paddingTop: "14px" }}
                  onClick={() => {
                    localStorage.removeItem("trp_token");
                    localStorage.removeItem("trp_user");
                    setCurrentUser(null);
                    setShowAccountModal(false);
                    showPopup("Logged out successfully");
                  }}
                >
                  <X size={18} />
                  <span>Sign Out</span>
                </button>
              ) : (
                <button
                  style={{ fontWeight: "600", marginTop: "8px" }}
                  onClick={() => {
                    setShowAccountModal(false);
                    setAuthNotice("");
                    setShowAuthModal(true);
                  }}
                >
                  <UserRound size={18} />
                  <span>Sign In / Create Account</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMER LOGIN & SIGNUP POPUP */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setPendingCartAction(null);
          setAuthNotice("");
        }}
        onAuthSuccess={(user, token) => {
          setCurrentUser(user);
          showPopup(`Welcome, ${user.name}! 🌸`);
          if (pendingCartAction) {
            executeAddToCart(pendingCartAction.product, pendingCartAction.quantity);
            setPendingCartAction(null);
            setAuthNotice("");
          }
        }}
        noticeMessage={authNotice}
      />

      {/* FLOATING TOAST NOTIFICATION */}
      {showMessage && (
        <div className="toast-popup" role="status" aria-live="polite">
          {showMessage}
        </div>
      )}
    </div>
  );
}

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
}