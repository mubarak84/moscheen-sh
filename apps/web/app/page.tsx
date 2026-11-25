import Link from "next/link";
import type { CSSProperties } from "react";
import HeroSlider from "@/components/HeroSlider";
import WelcomeQuote from "@/components/WelcomeQuote";
import { formatAddress, getAllMosques, mapsSearchUrl } from "@/lib/mosques";

const features = [
  {
    title: "Gebet & Spiritualität",
    text: "Tägliche Gebete, religiöse Bildung und ein lebendiges Gemeindeleben."
  },
  {
    title: "Dialog & Führungen",
    text: "Besuche für Schulen, Gruppen und Nachbarschaften nach Vereinbarung."
  },
  {
    title: "Engagement",
    text: "Friedensarbeit, soziale Projekte und Austausch in der Region."
  }
];

export default function HomePage() {
  const mosques = getAllMosques();

  return (
    <main id="top">
      <HeroSlider mosques={mosques} />

      <WelcomeQuote />

      <section className="section" id="moscheen">
        <div className="sectionIntro">
          <p className="eyebrow">Standorte</p>
          <h2>Alle Ahmadiyya-Moscheen in Schleswig-Holstein</h2>
          <p>
            Vier Orte, eine Gemeinschaft. Wählen Sie eine Moschee, um Adresse,
            Imam, Anfahrt und Besuchsmöglichkeiten zu entdecken.
          </p>
        </div>
        <div className="mosqueGrid">
          {mosques.map((mosque) => {
            const cardStyle = {
              "--accent": mosque.accentColor,
              "--accent-dark": mosque.accentColorDark
            } as CSSProperties;

            return (
              <article className="mosqueCard" style={cardStyle} key={mosque.id}>
                <Link
                  className="mosqueImageLink"
                  href={`/moscheen/${mosque.slug}`}
                  aria-label={`${mosque.displayName} ansehen`}
                >
                  <span
                    className="mosqueImage"
                    style={{ backgroundImage: `url(${mosque.heroImage})` }}
                  />
                  <span className="mosqueCity">{mosque.city}</span>
                </Link>
                <div className="mosqueCardBody">
                  <p className="cityLabel">{mosque.tagline}</p>
                  <h3>{mosque.displayName}</h3>
                  <p>{mosque.shortDescription}</p>
                  <address>{formatAddress(mosque.address)}</address>
                  <div className="mosqueCardActions">
                    <Link
                      className="button small primary"
                      href={`/besuch?mosque=${mosque.slug}`}
                    >
                      Besuch planen
                    </Link>
                    <Link
                      className="button small ghost ghostDark"
                      href={`/moscheen/${mosque.slug}`}
                    >
                      Details
                    </Link>
                  </div>
                  <a
                    className="textLink"
                    href={mapsSearchUrl(mosque.mapsQuery)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Auf Google Maps öffnen
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="ctaBanner" id="besuch">
        <div className="ctaBannerInner">
          <div>
            <p className="eyebrow light">Besuch planen</p>
            <h2>Willkommen für Schulklassen, Nachbarn und Interessierte.</h2>
            <p>
              Stellen Sie Ihre Fragen zum Islam und zur Ahmadiyya Muslim Jamaat
              – bei einer persönlichen Führung in einer unserer Moscheen.
            </p>
          </div>
          <Link className="button primary large" href="/besuch">
            Jetzt Besuch anfragen
          </Link>
        </div>
      </section>

      <section className="section muted" id="ueber">
        <div className="sectionIntro">
          <p className="eyebrow">Über die Gemeinde</p>
          <h2>Liebe für alle, Hass für keinen.</h2>
          <p>
            Die Ahmadiyya Muslim Jamaat versteht Moscheen als Orte der
            Spiritualität, des Friedens und des offenen Dialogs. In
            Schleswig-Holstein wachsen an mehreren Standorten lebendige
            Begegnungsräume für Menschen unterschiedlicher Herkunft und
            Religion.
          </p>
        </div>
        <div className="featureGrid">
          {features.map((feature) => (
            <article key={feature.title}>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
