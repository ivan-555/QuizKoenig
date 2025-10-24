export const CATEGORY_BY_SLUG = {
  allgemeinwissen: 'Allgemeinwissen',
  informatik: 'Informatik',
  tech: 'Tech',
  kultur: 'Kultur',
  chemie: 'Chemie',
  physik: 'Physik',
  biologie: 'Biologie',
  geschichte: 'Geschichte',
  astronomie: 'Astronomie',
  politik: 'Politik',
  gastronomie: 'Gastronomie',
  tierwelt: 'Tierwelt',
  geographie: 'Geographie',
};

export function slugToCategory(slug) {
  return CATEGORY_BY_SLUG[slug] ?? null;
}