export default function WelcomeQuote() {
  return (
    <section className="welcomeQuote" aria-labelledby="welcome-quote-title">
      <div className="welcomeQuoteHead">
        <h2 id="welcome-quote-title">Wir öffnen unsere Türen für alle</h2>
        <p>
          Ob aus Neugierde, Interesse oder spiritueller Suche – Sie sind herzlich
          willkommen.
        </p>
      </div>

      <div className="welcomeQuoteBody">
        <figure className="welcomePortrait">
          <img
            src="/images/leadership/khalifa-v.jpg"
            alt="Hadhrat Khalifatul Masih V (aba), weltweites Oberhaupt der Ahmadiyya Muslim Jamaat"
            width={420}
            height={520}
          />
        </figure>

        <blockquote className="welcomeBlockquote">
          <p>
            »Die Tore dieser Moschee werden für immer für alle friedliebenden
            Menschen geöffnet sein. Sie werden immer geöffnet sein für die, die
            Menschlichkeit schätzen. Ich bin vollkommen überzeugt, dass diese
            Moschee, so Gott will, sich als Symbol des Friedens erweisen wird,
            welches nichts als Liebe, Mitgefühl und Brüderlichkeit durch die
            Stadt und weit darüber hinaus ausstrahlen wird.«
          </p>
          <footer>
            — Hadhrat Khalifatul Masih V<sup>aba</sup>, Weltweites Oberhaupt der
            AMJ
          </footer>
        </blockquote>
      </div>
    </section>
  );
}
