/**
 * Data access layer.
 *
 *   const repo = getRepository(env);
 *
 * - env.DB bound (D1)  → D1Repository   (phase 2+)
 * - otherwise          → SeedRepository (phase 1, read-only seed data)
 *
 * Both implementations MUST return the same shapes (camelCase objects).
 * Write methods of SeedRepository return { stored: false } – the caller still sends emails.
 */
import { MOSQUES, CONTACTS, EVENTS, HIGHLIGHTS, FEEDBACK } from './seed-data.js';

export function getRepository(env) {
  return env && env.DB ? new D1Repository(env.DB) : new SeedRepository();
}

const nowIso = () => new Date().toISOString();

/* ------------------------------------------------------------------ */
/* Phase 1: static seed data                                           */
/* ------------------------------------------------------------------ */
class SeedRepository {
  get kind() { return 'seed'; }

  async listMosques() {
    return [...MOSQUES].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getMosque(slug) {
    return MOSQUES.find((m) => m.slug === slug) || null;
  }

  async listContacts(mosqueId) {
    return CONTACTS.filter((c) => c.mosqueId === mosqueId).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async listEvents({ mosqueId = null, limit = 6 } = {}) {
    const now = Date.now();
    return EVENTS
      .filter((e) => Date.parse(e.endsAt || e.startsAt) >= now)
      .filter((e) => mosqueId == null || e.mosqueId === mosqueId || e.mosqueId === null)
      .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
      .slice(0, limit);
  }

  async listHighlights({ mosqueId = null, limit = 6 } = {}) {
    return HIGHLIGHTS
      .filter((h) => mosqueId == null || h.mosqueId === mosqueId)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, limit);
  }

  async listFeedback({ mosqueId = null, limit = 6 } = {}) {
    return FEEDBACK
      .filter((f) => f.status === 'approved')
      .filter((f) => mosqueId == null || f.mosqueId === mosqueId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit)
      .map(withMosqueName);
  }

  async createFeedback() { return { stored: false }; }
  async createBooking() { return { stored: false }; }
  async createContactMessage() { return { stored: false }; }
}

function withMosqueName(f) {
  const m = MOSQUES.find((x) => x.id === f.mosqueId);
  return { ...f, mosqueName: m ? m.name : null, mosqueSlug: m ? m.slug : null };
}

/* ------------------------------------------------------------------ */
/* Phase 2: Cloudflare D1                                              */
/* Schema: db/migrations/0001_initial.sql                              */
/* ------------------------------------------------------------------ */
class D1Repository {
  constructor(db) { this.db = db; }
  get kind() { return 'd1'; }

  async listMosques() {
    const { results } = await this.db
      .prepare('SELECT * FROM mosques WHERE is_published = 1 ORDER BY sort_order, name')
      .all();
    return results.map(mapMosque);
  }

  async getMosque(slug) {
    const row = await this.db
      .prepare('SELECT * FROM mosques WHERE slug = ?1 AND is_published = 1')
      .bind(slug)
      .first();
    return row ? mapMosque(row) : null;
  }

  async listContacts(mosqueId) {
    const { results } = await this.db
      .prepare('SELECT * FROM contacts WHERE mosque_id = ?1 AND is_published = 1 ORDER BY sort_order')
      .bind(mosqueId)
      .all();
    return results.map((r) => ({
      id: r.id, mosqueId: r.mosque_id, name: r.name, role: r.role,
      email: r.email || '', phone: r.phone || '', photo: r.photo || '', sortOrder: r.sort_order
    }));
  }

  async listEvents({ mosqueId = null, limit = 6 } = {}) {
    const { results } = await this.db
      .prepare(
        `SELECT * FROM events
         WHERE is_published = 1 AND COALESCE(ends_at, starts_at) >= ?1
           AND (?2 IS NULL OR mosque_id = ?2 OR mosque_id IS NULL)
         ORDER BY starts_at LIMIT ?3`
      )
      .bind(nowIso(), mosqueId, limit)
      .all();
    return results.map((r) => ({
      id: r.id, mosqueId: r.mosque_id, title: r.title, description: r.description,
      startsAt: r.starts_at, endsAt: r.ends_at, location: r.location, image: r.image || ''
    }));
  }

  async listHighlights({ mosqueId = null, limit = 6 } = {}) {
    const { results } = await this.db
      .prepare(
        `SELECT * FROM highlights WHERE is_published = 1
           AND (?1 IS NULL OR mosque_id = ?1)
         ORDER BY date DESC LIMIT ?2`
      )
      .bind(mosqueId, limit)
      .all();
    return results.map((r) => ({
      id: r.id, mosqueId: r.mosque_id, title: r.title, summary: r.summary,
      date: r.date, image: r.image || '', link: r.link || ''
    }));
  }

  async listFeedback({ mosqueId = null, limit = 6 } = {}) {
    const { results } = await this.db
      .prepare(
        `SELECT f.*, m.name AS mosque_name, m.slug AS mosque_slug
         FROM feedback f LEFT JOIN mosques m ON m.id = f.mosque_id
         WHERE f.status = 'approved' AND (?1 IS NULL OR f.mosque_id = ?1)
         ORDER BY f.created_at DESC LIMIT ?2`
      )
      .bind(mosqueId, limit)
      .all();
    return results.map((r) => ({
      id: r.id, mosqueId: r.mosque_id, name: r.name, visitType: r.visit_type,
      rating: r.rating, text: r.text, visitedOn: r.visited_on, createdAt: r.created_at,
      status: r.status, mosqueName: r.mosque_name, mosqueSlug: r.mosque_slug
    }));
  }

  async createFeedback(f) {
    const res = await this.db
      .prepare(
        `INSERT INTO feedback (mosque_id, name, email, visit_type, rating, text, visited_on, status, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 'pending', ?8)`
      )
      .bind(f.mosqueId, f.name, f.email, f.visitType, f.rating, f.text, f.visitedOn || null, nowIso())
      .run();
    return { stored: true, id: res.meta.last_row_id };
  }

  async createBooking(b) {
    const res = await this.db
      .prepare(
        `INSERT INTO bookings (reference, mosque_id, visit_type, group_size, organization,
           preferred_slots, interests, language, name, email, phone, message, status, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, 'new', ?13)`
      )
      .bind(
        b.reference, b.mosqueId, b.visitType, b.groupSize, b.organization || null,
        JSON.stringify(b.slots), JSON.stringify(b.interests), b.language || null,
        b.name, b.email, b.phone || null, b.message || null, nowIso()
      )
      .run();
    return { stored: true, id: res.meta.last_row_id };
  }

  async createContactMessage(c) {
    const res = await this.db
      .prepare(
        `INSERT INTO contact_messages (mosque_id, name, email, subject, message, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)`
      )
      .bind(c.mosqueId || null, c.name, c.email, c.subject, c.message, nowIso())
      .run();
    return { stored: true, id: res.meta.last_row_id };
  }
}

function mapMosque(r) {
  return {
    id: r.id, slug: r.slug, name: r.name, subtitle: r.subtitle, city: r.city,
    street: r.street, zip: r.zip, district: r.district, lat: r.lat, lng: r.lng,
    type: r.type, openedYear: r.opened_year, image: r.image, imageAlt: r.image_alt,
    shortDescription: r.short_description, description: r.description,
    features: safeJson(r.features, []), email: r.email || '', bookingEmail: r.booking_email || '',
    phone: r.phone || '', sortOrder: r.sort_order
  };
}

function safeJson(s, fallback) {
  try { return s ? JSON.parse(s) : fallback; } catch { return fallback; }
}
