import { Suspense } from "react";
import type { Metadata } from "next";
import VisitForm from "@/components/VisitForm";
import { getAllMosques } from "@/lib/mosques";

export const metadata: Metadata = {
  title: "Besuch planen – Moscheen Schleswig-Holstein",
  description:
    "Planen Sie Ihren Besuch in einer Ahmadiyya-Moschee in Schleswig-Holstein."
};

export default function BesuchPage() {
  const mosques = getAllMosques();

  return (
    <main className="formPage">
      <section className="formHero">
        <p className="eyebrow light">Besuch planen</p>
        <h1>Ihren Besuch anfragen</h1>
        <p>
          Ob Einzelperson, Familie, Schulklasse oder Gruppe – füllen Sie das
          Formular aus und die Gemeinde stimmt einen Termin mit Ihnen ab.
        </p>
      </section>

      <section className="formLayout">
        <Suspense fallback={<div className="formCard">Formular wird geladen…</div>}>
          <VisitForm mosques={mosques} />
        </Suspense>

        <aside className="formInfo">
          <h2>So funktioniert es</h2>
          <ol className="stepsList">
            <li>
              <span>1</span>
              <p>Formular ausfüllen und Anfrage vorbereiten.</p>
            </li>
            <li>
              <span>2</span>
              <p>Anfrage per E-Mail an die Gemeinde senden.</p>
            </li>
            <li>
              <span>3</span>
              <p>Die Gemeinde meldet sich zur Terminabstimmung.</p>
            </li>
          </ol>
          <div className="infoNote">
            <p>
              Für kurzfristige Fragen erreichen Sie die kostenlose Info-Hotline
              unter <a href="tel:08002107758">0800 2107758</a>.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
