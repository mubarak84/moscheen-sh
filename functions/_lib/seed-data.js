/**
 * Phase-1 data source. Used by SeedRepository when no D1 database (env.DB) is bound.
 * Keep the shape identical to what D1Repository returns (see db/migrations/0001_initial.sql).
 *
 * Entries with `isExample: true` are demo content and must be replaced by real data.
 * Contact persons marked `isPlaceholder: true` must be verified by the community.
 */

export const MOSQUES = [
  {
    id: 1,
    slug: 'nahe',
    name: 'Bait-ul-Baseer Moschee',
    subtitle: 'Zentrum Mahdiabad · Nahe',
    city: 'Nahe',
    street: 'Wakendorfer Straße 11',
    zip: '23866',
    district: 'Kreis Segeberg',
    lat: 53.8027,
    lng: 10.1404,
    type: 'mosque',
    openedYear: 2019,
    image: '/assets/img/mosques/nahe.jpg',
    imageAlt: 'Die Bait-ul-Baseer Moschee in Nahe',
    shortDescription:
      'Das Zentrum Mahdiabad mit der Bait-ul-Baseer Moschee ist ein Ort des Gebets, der Begegnung und der Gemeinschaft im Kreis Segeberg.',
    description:
      'Die Bait-ul-Baseer Moschee liegt auf dem Gelände Mahdiabad in Nahe. Sie wurde am 25. Oktober 2019 vom Oberhaupt der weltweiten Ahmadiyya Muslim Jamaat, Hadhrat Mirza Masroor Ahmad (aba), eröffnet. Das Gelände bietet Raum für Gebete, Veranstaltungen, Jugendarbeit und den Austausch mit Nachbarn. Besucherinnen und Besucher sind herzlich willkommen – wir zeigen Ihnen gern die Moschee und beantworten Ihre Fragen zum Islam.',
    features: ['Gebetsräume für Männer und Frauen', 'Veranstaltungsgelände', 'Parkplätze vorhanden'],
    email: 'mashhood.zafar@ahmadiyya.de',
    bookingEmail: '',
    phone: '',
    sortOrder: 1
  },
  {
    id: 2,
    slug: 'luebeck',
    name: 'Bait-ul-Afiyat Moschee',
    subtitle: 'Lübeck',
    city: 'Lübeck',
    street: 'Kaninchenborn 4a',
    zip: '23560',
    district: 'Hansestadt Lübeck',
    lat: 53.8483,
    lng: 10.6526,
    type: 'mosque',
    openedYear: 2011,
    image: '/assets/img/mosques/luebeck.jpg',
    imageAlt: 'Die Bait-ul-Afiyat Moschee in Lübeck',
    shortDescription:
      'Die Bait-ul-Afiyat Moschee – „Haus des Wohlergehens“ – ist seit 2011 ein offenes Haus in der Hansestadt Lübeck.',
    description:
      'Die Bait-ul-Afiyat Moschee („Haus des Wohlergehens“) wurde im Juni 2011 eingeweiht. Seitdem ist sie Treffpunkt der Gemeinde in Lübeck und ein offenes Haus für alle, die den Islam und die Ahmadiyya Muslim Jamaat kennenlernen möchten. Regelmäßig finden hier Tage der offenen Tür, interreligiöse Begegnungen und Führungen für Schulklassen statt.',
    features: ['Gebetsräume für Männer und Frauen', 'Führungen für Schulklassen'],
    email: 'luebeck@ahmadiyya.email',
    bookingEmail: '',
    phone: '',
    sortOrder: 2
  },
  {
    id: 3,
    slug: 'kiel',
    name: 'Habib Moschee',
    subtitle: 'Kiel',
    city: 'Kiel',
    street: 'Flintbeker Straße 7',
    zip: '24113',
    district: 'Landeshauptstadt Kiel',
    lat: 54.2905,
    lng: 10.1157,
    type: 'mosque',
    openedYear: null,
    image: '/assets/img/mosques/kiel.jpg',
    imageAlt: 'Die Habib Moschee in Kiel',
    shortDescription:
      'Die Habib Moschee in der Landeshauptstadt ist Gebetsort und Begegnungsstätte – mit vielen Besuchen von Schulen, Universität und Politik.',
    description:
      'Die Habib Moschee in Kiel ist das Zuhause der Gemeinde in der Landeshauptstadt. Hier begrüßen wir regelmäßig Schulklassen, Studierende der Universität Kiel, Vertreterinnen und Vertreter aus Politik und Gesellschaft sowie Nachbarn. Neben Gebeten und Vorträgen engagiert sich die Gemeinde bei Neujahrsputzaktionen, Baumpflanzungen und Blutspendeaktionen.',
    features: ['Gebetsräume für Männer und Frauen', 'Vorträge & Gesprächsabende', 'Führungen für Gruppen'],
    email: 'kiel@ahmadiyya.de',
    bookingEmail: '',
    phone: '',
    sortOrder: 3
  },
  {
    id: 4,
    slug: 'husum',
    name: 'Mahmood Moschee',
    subtitle: 'Husum',
    city: 'Husum',
    street: 'Robert-Koch-Straße 33',
    zip: '25813',
    district: 'Kreis Nordfriesland',
    lat: 54.4766,
    lng: 9.0612,
    type: 'mosque',
    openedYear: null,
    image: '/assets/img/mosques/placeholder.svg',
    imageAlt: 'Platzhalterbild der Mahmood Moschee in Husum',
    shortDescription:
      'Die Mahmood Moschee in Husum ist der Treffpunkt der Gemeinde an der Nordseeküste in Nordfriesland.',
    description:
      'Die Mahmood Moschee in Husum ist Gebetsort und Begegnungsstätte der Ahmadiyya Muslim Jamaat in Nordfriesland. Beim jährlichen Tag der offenen Moschee am 3. Oktober und auf Anfrage öffnen wir unsere Türen für alle Interessierten.',
    features: ['Gebetsraum', 'Tag der offenen Moschee'],
    email: '',
    bookingEmail: '',
    phone: '',
    sortOrder: 4
  },
  {
    id: 5,
    slug: 'pinneberg',
    name: 'Gemeindezentrum Pinneberg',
    subtitle: 'Pinneberg',
    city: 'Pinneberg',
    street: 'Adresse folgt',
    zip: '',
    district: 'Kreis Pinneberg',
    lat: 53.6603,
    lng: 9.7964,
    type: 'center',
    openedYear: null,
    image: '/assets/img/mosques/placeholder.svg',
    imageAlt: 'Platzhalterbild des Gemeindezentrums Pinneberg',
    shortDescription:
      'Das Gemeindezentrum in Pinneberg ist Anlaufstelle für Gebet und Gemeinschaft im Hamburger Umland.',
    description:
      'Im Gemeindezentrum Pinneberg kommt die örtliche Gemeinde der Ahmadiyya Muslim Jamaat zu Gebeten, Versammlungen und Veranstaltungen zusammen. Gern vereinbaren wir mit Ihnen einen Besuchstermin.',
    features: ['Gebetsraum', 'Gemeinschaftsräume'],
    email: '',
    bookingEmail: '',
    phone: '',
    sortOrder: 5
  }
];

export const CONTACTS = [
  { id: 1, mosqueId: 1, name: 'Mashhood Ahmad Zafar', role: 'Imam & Theologe', email: 'mashhood.zafar@ahmadiyya.de', phone: '', photo: '', sortOrder: 1 },
  { id: 2, mosqueId: 1, name: 'N. N.', role: 'Präsident der Gemeinde', email: '', phone: '', photo: '', sortOrder: 2, isPlaceholder: true },
  { id: 3, mosqueId: 2, name: 'Kamran Ahmad', role: 'Imam & Theologe', email: 'kamran.ahmad@ahmadiyya.de', phone: '', photo: '', sortOrder: 1 },
  { id: 4, mosqueId: 2, name: 'N. N.', role: 'Präsident der Gemeinde', email: '', phone: '', photo: '', sortOrder: 2, isPlaceholder: true },
  { id: 5, mosqueId: 3, name: 'Mahmood Malhi', role: 'Imam & Theologe', email: 'mahmood.malhi@ahmadiyya.de', phone: '', photo: '', sortOrder: 1 },
  { id: 6, mosqueId: 3, name: 'N. N.', role: 'Präsident der Gemeinde', email: '', phone: '', photo: '', sortOrder: 2, isPlaceholder: true },
  { id: 7, mosqueId: 4, name: 'N. N.', role: 'Ansprechpartner für Besuche', email: '', phone: '', photo: '', sortOrder: 1, isPlaceholder: true },
  { id: 8, mosqueId: 5, name: 'N. N.', role: 'Ansprechpartner für Besuche', email: '', phone: '', photo: '', sortOrder: 1, isPlaceholder: true }
];

export const EVENTS = [
  {
    id: 1, mosqueId: null, isExample: true,
    title: 'Neujahrsputzaktion 2027',
    description: 'Wie jedes Jahr am Neujahrsmorgen räumen junge Ahmadi-Muslime in vielen Städten Schleswig-Holsteins die Straßen auf. Helfende Hände sind willkommen!',
    startsAt: '2027-01-01T09:00:00+01:00', endsAt: '2027-01-01T12:00:00+01:00',
    location: 'Kiel, Lübeck, Husum, Nahe, Pinneberg', image: ''
  },
  {
    id: 2, mosqueId: 3, isExample: true,
    title: 'Interreligiöser Gesprächsabend',
    description: 'Vertreter verschiedener Religionen sprechen über Frieden und gesellschaftlichen Zusammenhalt. Mit anschließendem Tee und Gebäck.',
    startsAt: '2026-12-03T18:30:00+01:00', endsAt: '2026-12-03T21:00:00+01:00',
    location: 'Habib Moschee, Kiel', image: ''
  },
  {
    id: 3, mosqueId: 2, isExample: true,
    title: 'Tag der offenen Tür',
    description: 'Lernen Sie die Bait-ul-Afiyat Moschee kennen: Führungen, Ausstellung über den Islam, Fragen & Antworten.',
    startsAt: '2027-02-14T14:00:00+01:00', endsAt: '2027-02-14T18:00:00+01:00',
    location: 'Bait-ul-Afiyat Moschee, Lübeck', image: ''
  }
];

export const HIGHLIGHTS = [
  {
    id: 1, mosqueId: 4, isExample: true,
    title: 'Tag der offenen Moschee in Husum',
    summary: 'Am 3. Oktober 2026 besuchten zahlreiche Gäste die Mahmood Moschee und informierten sich über den Islam.',
    date: '2026-10-03', image: '', link: ''
  },
  {
    id: 2, mosqueId: 3, isExample: true,
    title: 'Tag der offenen Moschee in Kiel',
    summary: 'Führungen, eine Ausstellung und viele Gespräche bei Tee – ein Tag der Begegnung in der Habib Moschee.',
    date: '2026-10-03', image: '', link: ''
  },
  {
    id: 3, mosqueId: null, isExample: true,
    title: 'Baumpflanzaktionen im ganzen Land',
    summary: 'Die Jugendorganisation pflanzte gemeinsam mit Kommunen hunderte Bäume – Umweltschutz als gelebter Glaube.',
    date: '2026-04-18', image: '', link: ''
  }
];

export const FEEDBACK = [
  {
    id: 1, mosqueId: 3, isExample: true, status: 'approved',
    name: 'Klasse 10b, Gymnasium', visitType: 'school', rating: 5,
    text: 'Sehr herzlicher Empfang! Der Imam hat alle unsere Fragen geduldig beantwortet. Für viele war es der erste Besuch in einer Moschee.',
    visitedOn: '2026-09-12', createdAt: '2026-09-14T10:00:00Z'
  },
  {
    id: 2, mosqueId: 2, isExample: true, status: 'approved',
    name: 'Sabine M.', visitType: 'individual', rating: 5,
    text: 'Ich war neugierig und etwas unsicher – aber ich wurde so freundlich aufgenommen. Ein offenes Gespräch über Glauben und Alltag, vielen Dank!',
    visitedOn: '2026-08-20', createdAt: '2026-08-21T18:00:00Z'
  },
  {
    id: 3, mosqueId: 1, isExample: true, status: 'approved',
    name: 'Seniorenkreis der Kirchengemeinde', visitType: 'group', rating: 5,
    text: 'Eine beeindruckende Moschee und eine wunderbare Gastfreundschaft. Besonders der Austausch über Gemeinsamkeiten unserer Religionen hat uns berührt.',
    visitedOn: '2026-06-05', createdAt: '2026-06-07T09:30:00Z'
  },
  {
    id: 4, mosqueId: 4, isExample: true, status: 'approved',
    name: 'Familie J.', visitType: 'individual', rating: 4,
    text: 'Schöner Tag der offenen Moschee. Die Kinder haben ihren Namen auf Arabisch geschrieben bekommen – ein tolles Erlebnis.',
    visitedOn: '2026-10-03', createdAt: '2026-10-04T12:00:00Z'
  }
];
