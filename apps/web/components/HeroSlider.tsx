"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { formatAddress, type Mosque } from "@/lib/mosques";

type HeroSliderProps = {
  mosques: Mosque[];
};

const AUTOPLAY_MS = 6000;

export default function HeroSlider({ mosques }: HeroSliderProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const count = mosques.length;

  const goTo = useCallback(
    (index: number) => {
      setActive((index + count) % count);
    },
    [count]
  );

  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);

  useEffect(() => {
    if (paused || count <= 1) {
      return;
    }
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % count);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [paused, count]);

  return (
    <section
      className="heroSlider"
      aria-roledescription="Karussell"
      aria-label="Moscheen in Schleswig-Holstein"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="heroSliderTrack">
        {mosques.map((mosque, index) => {
          const slideStyle = {
            "--accent": mosque.accentColor,
            "--accent-dark": mosque.accentColorDark,
            backgroundImage: `url(${mosque.heroImage})`
          } as CSSProperties;

          return (
            <article
              key={mosque.id}
              className={`heroSlide${index === active ? " isActive" : ""}`}
              style={slideStyle}
              aria-hidden={index !== active}
              aria-roledescription="Folie"
              aria-label={`${index + 1} von ${count}: ${mosque.displayName}`}
            >
              <div className="heroSlideOverlay" />
              {mosque.imageCredit.author && (
                <a
                  className="mediaCredit"
                  href={mosque.imageCredit.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Foto: {mosque.imageCredit.author} · {mosque.imageCredit.license}
                </a>
              )}
              <div className="heroSlideContent">
                <span className="pill">{mosque.tagline}</span>
                <h1>{mosque.displayName}</h1>
                <p className="heroSlideMeta">
                  <span className="heroCity">{mosque.city}</span>
                  <span className="heroDot" aria-hidden="true">
                    •
                  </span>
                  {formatAddress(mosque.address)}
                </p>
                <p className="heroSlideText">{mosque.shortDescription}</p>
                <div className="heroSlideActions">
                  <Link
                    className="button primary"
                    href={`/besuch?mosque=${mosque.slug}`}
                  >
                    Besuch planen
                  </Link>
                  <Link
                    className="button ghost"
                    href={`/moscheen/${mosque.slug}`}
                  >
                    Mehr erfahren
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <button
        type="button"
        className="heroArrow heroArrowPrev"
        onClick={prev}
        aria-label="Vorherige Moschee"
      >
        ‹
      </button>
      <button
        type="button"
        className="heroArrow heroArrowNext"
        onClick={next}
        aria-label="Nächste Moschee"
      >
        ›
      </button>

      <div className="heroDots" role="tablist" aria-label="Moschee auswählen">
        {mosques.map((mosque, index) => (
          <button
            key={mosque.id}
            type="button"
            role="tab"
            aria-selected={index === active}
            aria-label={mosque.displayName}
            className={`heroDotButton${index === active ? " isActive" : ""}`}
            onClick={() => goTo(index)}
          />
        ))}
      </div>
    </section>
  );
}
