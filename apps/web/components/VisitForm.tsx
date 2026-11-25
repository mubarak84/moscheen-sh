"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { Mosque } from "@/lib/mosques";

type VisitFormProps = {
  mosques: Mosque[];
};

type VisitType =
  | "Einzelperson"
  | "Familie"
  | "Schulklasse"
  | "Gruppe / Verein"
  | "Interreligiöser Dialog";

const visitTypes: VisitType[] = [
  "Einzelperson",
  "Familie",
  "Schulklasse",
  "Gruppe / Verein",
  "Interreligiöser Dialog"
];

type FormState = {
  name: string;
  email: string;
  phone: string;
  mosque: string;
  visitType: VisitType;
  groupSize: string;
  preferredDate: string;
  message: string;
};

const CONTACT_EMAIL = "info@ahmadiyya.de";

export default function VisitForm({ mosques }: VisitFormProps) {
  const searchParams = useSearchParams();
  const preselected = searchParams.get("mosque") ?? "";
  const defaultMosque = useMemo(() => {
    return mosques.some((mosque) => mosque.slug === preselected)
      ? preselected
      : mosques[0]?.slug ?? "";
  }, [mosques, preselected]);

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    mosque: defaultMosque,
    visitType: "Einzelperson",
    groupSize: "",
    preferredDate: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const selectedMosque = mosques.find((mosque) => mosque.slug === form.mosque);

  function update<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  // Static export has no backend yet. We capture the request locally and
  // build a prefilled e-mail. This is the integration point for the future
  // Amplify Data (DynamoDB) mutation.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  function buildMailto(): string {
    const subject = `Besuchsanfrage: ${selectedMosque?.displayName ?? "Moschee"}`;
    const body = [
      `Name: ${form.name}`,
      `E-Mail: ${form.email}`,
      `Telefon: ${form.phone || "-"}`,
      `Moschee: ${selectedMosque?.displayName ?? form.mosque}`,
      `Art des Besuchs: ${form.visitType}`,
      `Anzahl Personen: ${form.groupSize || "-"}`,
      `Wunschtermin: ${form.preferredDate || "-"}`,
      "",
      "Nachricht:",
      form.message || "-"
    ].join("\n");
    return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  }

  if (submitted) {
    return (
      <div className="formCard formSuccess" role="status">
        <div className="successMark" aria-hidden="true">
          ✓
        </div>
        <h2>Vielen Dank für Ihre Anfrage!</h2>
        <p>
          Wir haben Ihre Angaben für{" "}
          <strong>{selectedMosque?.displayName ?? "die Moschee"}</strong>{" "}
          vorbereitet. Senden Sie die Anfrage mit einem Klick ab – die Gemeinde
          meldet sich anschließend bei Ihnen.
        </p>
        <div className="formActions">
          <a className="button primary" href={buildMailto()}>
            Anfrage per E-Mail senden
          </a>
          <button
            type="button"
            className="button ghost ghostDark"
            onClick={() => setSubmitted(false)}
          >
            Angaben bearbeiten
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="formCard" onSubmit={handleSubmit}>
      <div className="formRow">
        <label className="formField">
          <span>Name *</span>
          <input
            type="text"
            required
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            placeholder="Ihr vollständiger Name"
          />
        </label>
        <label className="formField">
          <span>E-Mail *</span>
          <input
            type="email"
            required
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
            placeholder="name@beispiel.de"
          />
        </label>
      </div>

      <div className="formRow">
        <label className="formField">
          <span>Telefon</span>
          <input
            type="tel"
            value={form.phone}
            onChange={(event) => update("phone", event.target.value)}
            placeholder="Optional"
          />
        </label>
        <label className="formField">
          <span>Moschee *</span>
          <select
            required
            value={form.mosque}
            onChange={(event) => update("mosque", event.target.value)}
          >
            {mosques.map((mosque) => (
              <option key={mosque.slug} value={mosque.slug}>
                {mosque.displayName}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="formRow">
        <label className="formField">
          <span>Art des Besuchs *</span>
          <select
            required
            value={form.visitType}
            onChange={(event) =>
              update("visitType", event.target.value as VisitType)
            }
          >
            {visitTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label className="formField">
          <span>Anzahl Personen</span>
          <input
            type="number"
            min="1"
            value={form.groupSize}
            onChange={(event) => update("groupSize", event.target.value)}
            placeholder="z. B. 12"
          />
        </label>
      </div>

      <label className="formField">
        <span>Wunschtermin</span>
        <input
          type="date"
          value={form.preferredDate}
          onChange={(event) => update("preferredDate", event.target.value)}
        />
      </label>

      <label className="formField">
        <span>Nachricht</span>
        <textarea
          rows={4}
          value={form.message}
          onChange={(event) => update("message", event.target.value)}
          placeholder="Worüber möchten Sie mehr erfahren?"
        />
      </label>

      <button type="submit" className="button primary fullWidth">
        Anfrage vorbereiten
      </button>
      <p className="formHint">
        Mit dem Absenden bereiten Sie eine unverbindliche Besuchsanfrage vor.
      </p>
    </form>
  );
}
