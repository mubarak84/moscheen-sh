import Link from "next/link";
import { getAllMosques } from "@/lib/mosques";

export default function SiteFooter() {
  const mosques = getAllMosques();
  const year = new Date().getFullYear();

  return (
    <footer className="siteFooter" id="kontakt">
      <div className="footerGrid">
        <div className="footerBrand">
          <span className="brandMark">SH</span>
          <p>
            Ahmadiyya-Moscheen in Schleswig-Holstein – Orte des Gebets, der
            Begegnung und des Dialogs.
          </p>
          <p className="footerMotto">„Liebe für alle, Hass für keinen.“</p>
        </div>

        <div className="footerCol">
          <h3>Moscheen</h3>
          <ul>
            {mosques.map((mosque) => (
              <li key={mosque.slug}>
                <Link href={`/moscheen/${mosque.slug}`}>
                  {mosque.displayName}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footerCol">
          <h3>Service</h3>
          <ul>
            <li>
              <Link href="/besuch">Besuch planen</Link>
            </li>
            <li>
              <a href="https://ahmadiyya.de" target="_blank" rel="noreferrer">
                ahmadiyya.de
              </a>
            </li>
            <li>
              <a href="tel:08002107758">Info-Hotline: 0800 2107758</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="footerBar">
        <span>© {year} Ahmadiyya Muslim Jamaat – Schleswig-Holstein</span>
        <span>Schleswig-Holstein, Deutschland</span>
      </div>
    </footer>
  );
}
