export const LEADS_EVOLUTION = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toLocaleDateString('fr-MA', { day: '2-digit', month: 'short' }),
    Nouveaux: Math.floor(Math.random() * 20 + 10),
    Convertis: Math.floor(Math.random() * 8 + 2),
    Rappels: Math.floor(Math.random() * 10 + 3),
  };
});

export const CONVERSION_FUNNEL = [
  { stage: 'Nouveaux', value: 820, fill: '#3b82f6' },
  { stage: 'En cours', value: 540, fill: '#8b5cf6' },
  { stage: 'Intéressés', value: 310, fill: '#06b6d4' },
  { stage: 'Rappels', value: 180, fill: '#f59e0b' },
  { stage: 'Convertis', value: 124, fill: '#10b981' },
];

export const AGENT_PERFORMANCE = [
  { name: 'Anas Filali', conversions: 55 },
  { name: 'Tarik Mansour', conversions: 42 },
  { name: 'Rania Douiri', conversions: 38 },
  { name: 'Hiba Berrada', conversions: 40 },
  { name: 'Layla Bensaid', conversions: 33 },
  { name: 'Mounia Lahlou', conversions: 30 },
  { name: 'Bilal Ouali', conversions: 21 },
  { name: 'Karim Bennani', conversions: 25 },
];

export const CAMPAIGN_PERFORMANCE = [
  { name: 'Immobilier', leads: 180, converted: 44 },
  { name: 'Assurance', leads: 120, converted: 22 },
  { name: 'Formation', leads: 95, converted: 30 },
  { name: 'Crédit Auto', leads: 0, converted: 0 },
  { name: 'Télécom', leads: 65, converted: 8 },
];

export const LEADS_BY_SOURCE = [
  { name: 'Immobilier', value: 36, fill: '#3b82f6' },
  { name: 'Assurance', value: 24, fill: '#8b5cf6' },
  { name: 'Formation', value: 19, fill: '#10b981' },
  { name: 'Télécom', value: 13, fill: '#f59e0b' },
  { name: 'Crédit Auto', value: 8, fill: '#ef4444' },
];

export const DAILY_ACTIVITY = Array.from({ length: 14 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (13 - i));
  return {
    date: date.toLocaleDateString('fr-MA', { weekday: 'short', day: '2-digit' }),
    Appels: Math.floor(Math.random() * 80 + 30),
    Notes: Math.floor(Math.random() * 25 + 5),
    Conversions: Math.floor(Math.random() * 12 + 1),
  };
});

export const RECENT_ACTIVITY = [
  { id: 1, action: 'Lead importé', subject: 'Fatima Zahra El Amrani', time: '2 min', type: 'import' as const },
  { id: 2, action: 'Statut → Converti', subject: 'Mehdi Tazi', time: '12 min', type: 'status' as const },
  { id: 3, action: 'Note ajoutée', subject: 'Youssef Benchekroun', time: '28 min', type: 'note' as const },
  { id: 4, action: 'Rappel planifié', subject: 'Leila Moussaoui', time: '45 min', type: 'callback' as const },
  { id: 5, action: 'Lead assigné à Karim', subject: 'Nadia Benhaddou', time: '1h', type: 'assign' as const },
  { id: 6, action: 'Statut → Intéressé', subject: 'Mohammed Alaoui', time: '1h 20m', type: 'status' as const },
  { id: 7, action: 'Appel effectué', subject: 'Sara Fassi', time: '2h', type: 'call' as const },
  { id: 8, action: 'Lead importé', subject: 'Omar Berrada', time: '2h 30m', type: 'import' as const },
  { id: 9, action: 'Statut → Pas intéressé', subject: 'Rachid Oumzil', time: '3h', type: 'status' as const },
  { id: 10, action: 'Note ajoutée', subject: 'Zineb Lahlou', time: '3h 45m', type: 'note' as const },
];

export const IMPORT_HISTORY = [
  { id: 'ih-1', filename: 'leads_mai2026.csv', date: '2026-05-15', imported: 243, errors: 2, status: 'Succès' as const, user: 'Tarik Mansour' },
  { id: 'ih-2', filename: 'prospects_immobilier.csv', date: '2026-05-10', imported: 180, errors: 0, status: 'Succès' as const, user: 'Karim Bennani' },
  { id: 'ih-3', filename: 'assurance_leads_q1.csv', date: '2026-04-28', imported: 95, errors: 8, status: 'Partiel' as const, user: 'Tarik Mansour' },
  { id: 'ih-4', filename: 'formation_contacts.csv', date: '2026-04-15', imported: 0, errors: 45, status: 'Échec' as const, user: 'Salma Chraibi' },
  { id: 'ih-5', filename: 'telecom_prospects.csv', date: '2026-03-30', imported: 120, errors: 0, status: 'Succès' as const, user: 'Karim Bennani' },
  { id: 'ih-6', filename: 'credit_auto_leads.csv', date: '2026-03-15', imported: 87, errors: 3, status: 'Partiel' as const, user: 'Rania Douiri' },
];

export const HOURLY_CALLS = Array.from({ length: 10 }, (_, i) => ({
  hour: `${8 + i}h`,
  calls: Math.floor(Math.random() * 40 + 10),
  answered: Math.floor(Math.random() * 25 + 5),
}));

export const MONTHLY_REVENUE = Array.from({ length: 6 }, (_, i) => {
  const date = new Date();
  date.setMonth(date.getMonth() - (5 - i));
  return {
    month: date.toLocaleDateString('fr-MA', { month: 'short' }),
    leads: Math.floor(Math.random() * 200 + 100),
    converted: Math.floor(Math.random() * 40 + 15),
  };
});
