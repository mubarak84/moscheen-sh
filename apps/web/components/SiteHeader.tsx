import Link from "next/link";

const navItems = [
  { label: "Moscheen", href: "/#moscheen" },
  { label: "Besuch planen", href: "/besuch" },
  { label: "Über uns", href: "/#ueber" },
  { label: "Kontakt", href: "/#kontakt" }
];

export default function SiteHeader() {
  return (
    <header className="siteHeader">
      <Link className="brand" href="/" aria-label="Moscheen Schleswig-Holstein">
        <span className="brandMark">SH</span>
        <span className="brandText">
          Moscheen <strong>Schleswig-Holstein</strong>
        </span>
      </Link>
      <nav className="nav" aria-label="Hauptnavigation">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
      <Link className="button primary headerCta" href="/besuch">
        Besuch planen
      </Link>
    </header>
  );
}
