import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import {
  formatAddress,
  getMosqueBySlug,
  getMosqueSlugs,
  mapsEmbedUrl,
  mapsSearchUrl
} from "@/lib/mosques";

type MosquePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getMosqueSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params
}: MosquePageProps): Promise<Metadata> {
  const { slug } = await params;
  const mosque = getMosqueBySlug(slug);
  if (!mosque) {
    return { title: "Moschee nicht gefunden" };
  }
  return {
    title: `${mosque.displayName} – Moscheen Schleswig-Holstein`,
    description: mosque.shortDescription
  };
}

export default async function MosquePage({ params }: MosquePageProps) {
  const { slug } = await params;
  const mosque = getMosqueBySlug(slug);

  if (!mosque) {
    notFound();
  }

  const accentStyle = {
    "--accent": mosque.accentColor,
    "--accent-dark": mosque.accentColorDark
  } as CSSProperties;

  const imamInitial = mosque.imam.name
    ? mosque.imam.name.charAt(0)
    : mosque.city.charAt(0);

  return (
    <main className="detailPage" style={accentStyle}>
      <section
        className="detailHero"
        style={{ backgroundImage: `url(${mosque.heroImage})` }}
      >
        <div className="detailHeroOverlay" />
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
        <div className="detailHeroContent">
          <Link className="backLink" href="/#moscheen">
            ← Alle Moscheen
          </Link>
          <span className="pill">{mosque.tagline}</span>
          <h1>{mosque.displayName}</h1>
          <p className="detailHeroMeta">
            <span className="heroCity">{mosque.city}</span>
            <span className="heroDot" aria-hidden="true">
              •
            </span>
            {formatAddress(mosque.address)}
          </p>
          <div className="heroSlideActions">
            <Link
              className="button primary"
              href={`/besuch?mosque=${mosque.slug}`}
            >
              Besuch planen
            </Link>
            <a
              className="button ghost"
              href={mapsSearchUrl(mosque.mapsQuery)}
              target="_blank"
              rel="noreferrer"
            >
              Route planen
            </a>
          </div>
        </div>
      </section>

      <section className="detailBody">
        <div className="detailMain">
          <article className="detailBlock">
            <p className="eyebrow">Über die Moschee</p>
            <h2>{mosque.name}</h2>
            {mosque.description.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
            {mosque.facilities.length > 0 && (
              <ul className="facilityList">
                {mosque.facilities.map((facility) => (
                  <li key={facility}>{facility}</li>
                ))}
              </ul>
            )}
          </article>

          <article className="detailBlock">
            <p className="eyebrow">Direkter Austausch</p>
            <h2>Imam & Ansprechpartner</h2>
            <div className="imamRow">
              <div
                className="avatar large"
                style={
                  mosque.imam.image
                    ? { backgroundImage: `url(${mosque.imam.image})` }
                    : undefined
                }
                aria-hidden="true"
              >
                {mosque.imam.image ? "" : imamInitial}
              </div>
              <div>
                <h3>{mosque.imam.name || "Wird ergänzt"}</h3>
                <p className="imamRole">{mosque.imam.role}</p>
                <p>
                  Foto, Name und direkte Kontaktdaten der zuständigen
                  Ansprechperson werden in Kürze ergänzt.
                </p>
              </div>
            </div>
          </article>

          <article className="detailBlock">
            <p className="eyebrow">Anfahrt</p>
            <h2>Lage &amp; Karte</h2>
            <div className="mapFrame">
              <iframe
                title={`Karte: ${mosque.displayName}`}
                src={mapsEmbedUrl(mosque.mapsQuery)}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </article>
        </div>

        <aside className="detailAside">
          <div className="infoCard">
            <h3>Adresse &amp; Kontakt</h3>
            <address>
              <strong>{mosque.name}</strong>
              <br />
              {mosque.address.street}
              <br />
              {mosque.address.postalCode} {mosque.address.city}
            </address>
            <dl className="infoList">
              {mosque.established && (
                <div>
                  <dt>Eröffnung</dt>
                  <dd>{mosque.established}</dd>
                </div>
              )}
              <div>
                <dt>Status</dt>
                <dd>{mosque.status}</dd>
              </div>
              {mosque.contact.email && (
                <div>
                  <dt>E-Mail</dt>
                  <dd>
                    <a href={`mailto:${mosque.contact.email}`}>
                      {mosque.contact.email}
                    </a>
                  </dd>
                </div>
              )}
              {mosque.contact.phone && (
                <div>
                  <dt>Telefon</dt>
                  <dd>
                    <a href={`tel:${mosque.contact.phone.replace(/\s/g, "")}`}>
                      {mosque.contact.phone}
                    </a>
                  </dd>
                </div>
              )}
              <div>
                <dt>Info-Hotline</dt>
                <dd>
                  <a href={`tel:${mosque.contact.hotline.replace(/\s/g, "")}`}>
                    {mosque.contact.hotline}
                  </a>
                </dd>
              </div>
            </dl>
            <Link
              className="button primary fullWidth"
              href={`/besuch?mosque=${mosque.slug}`}
            >
              Besuch planen
            </Link>
            <a
              className="button ghost ghostDark fullWidth"
              href={mapsSearchUrl(mosque.mapsQuery)}
              target="_blank"
              rel="noreferrer"
            >
              Auf Google Maps öffnen
            </a>
          </div>
        </aside>
      </section>
    </main>
  );
}
