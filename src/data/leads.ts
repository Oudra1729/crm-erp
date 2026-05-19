import { Lead } from '../types';

const ALL_NAMES = [
  'Fatima Zahra El Amrani', 'Youssef Benchekroun', 'Leila Moussaoui', 'Mehdi Tazi', 'Nadia Benhaddou',
  'Mohammed Alaoui', 'Sara Fassi', 'Karim Benali', 'Asmaa Chraibi', 'Omar Berrada',
  'Houda Kettani', 'Rachid Oumzil', 'Zineb Lahlou', 'Hassan Ouahabi', 'Imane Sebbar',
  'Driss Filali', 'Khadija Bensouda', 'Amine Tahiri', 'Meriem Benkirane', 'Soufiane Boukili',
  'Ayoub Idrissi', 'Salma Bennani', 'Yassine Kabbaj', 'Nawal El Fassi', 'Tarik Chraibi',
  'Brahim Lahlou', 'Maryam Skalli', 'Khalid Hajji', 'Samira Bouzidi', 'Fouad Berrada',
  'Ghita Moukrim', 'Adil Rachidi', 'Loubna Sebti', 'Badr Eddine', 'Widad Cherkaoui',
  'Ilham Ziani', 'Mustapha Hajjaj', 'Fatima Ait Benhaddou', 'Abdelhamid Talib', 'Rajae Mansouri',
  'Nordin Bekkali', 'Hafsa Benbrahim', 'Saad Chergui', 'Nora El Idrissi', 'Zakaria Tahiri',
  'Hanan Boumehdi', 'Yacine Sekkouri', 'Amina Bouazza', 'Redouane Khattabi', 'Soundous Bennis',
  'Jawad Lamrani', 'Hajar Tlemcani', 'Anas Cherkaoui', 'Siham Ouazzani', 'Bilal Benbachir',
  'Rokia Maarouf', 'Othman Belkadi', 'Ikram Jennane', 'Tariq Belghiti', 'Chaima Bensari',
  'Hamza Mouline', 'Doha Berrada', 'Sami El Ouali', 'Fatiha Benali', 'Iliass Filali',
  'Zineb Bensalah', 'Mehdi Qassimi', 'Selma Fahim', 'Anouar Ghazali', 'Chadia Benkirane',
  'Taha Amrani', 'Nada Sahraoui', 'Walid Mernissi', 'Aicha Bakkouri', 'Yasin Belkacem',
  'Souad Hammadi', 'Kamal Touil', 'Rania Ouali', 'Rahim Benkhaled', 'Malika Berri',
  'Noureddine Fakhri', 'Habiba Tazi', 'Saber El Ouali', 'Loubna Benyahia', 'Rida Benomar',
  'Safia Lamghari', 'Khalid Benkirane', 'Amira Chafai', 'Mourad Benali', 'Nesrine Bouhali',
  'Marouane Sekkat', 'Zineb Aouad', 'Hassan Bensouda', 'Naima Tazi', 'Abdellah Mrani',
  'Loubna Bencharif', 'Farid Chraibi', 'Manal Kadiri', 'Ismail Benali', 'Samah Zerouali',
  'Bachir Ouali', 'Hind Benamer', 'Youssef El Asri', 'Fatna Oukhcha', 'Azeddine Benali',
];

const CITIES = ['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Agadir', 'Tanger', 'Meknès', 'Oujda', 'Kenitra', 'Tétouan', 'El Jadida', 'Laâyoune', 'Beni Mellal', 'Nador', 'Dakhla'];
const STATUSES: Lead['status'][] = ['New', 'In Progress', 'Callback', 'Interested', 'Converted', 'Not Interested', 'No Answer', 'Invalid Number'];
const PRIORITIES: Lead['priority'][] = ['High', 'Medium', 'Low'];
const CAMPAIGNS = [
  { id: 'c-1', name: 'Campagne Immobilier Q2 2026' },
  { id: 'c-2', name: 'Assurance Vie Premium' },
  { id: 'c-3', name: 'Formation Professionnelle' },
  { id: 'c-4', name: 'Crédit Auto 2026' },
  { id: 'c-5', name: 'Télécommunication Pro' },
];
const TAGS_POOL = ['VIP', 'Urgent', 'Follow up', 'Completed', 'Prospect chaud', 'Retraité', 'Jeune actif', 'PME', 'Particulier', 'Decision maker'];

const AGENT_IDS = ['a-1', 'a-2', 'a-3', 'a-4', 'a-5', 'a-6', 'a-7', 'a-8', 'a-9', 'a-10', 'a-11', 'a-12'];

function randItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randPhone(): string {
  const prefixes = ['06', '07'];
  const p = randItem(prefixes);
  return `+212 ${p.charAt(1)}${Math.floor(10000000 + Math.random() * 89999999)}`.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
}

function randDate(daysAgo: number, spreadDays: number = 0): string {
  const ms = Date.now() - (daysAgo + Math.random() * spreadDays) * 86400000;
  return new Date(ms).toISOString();
}

function buildNotes(count: number, agentId: string, agentName: string) {
  const noteTexts = [
    'Client intéressé, rappeler la semaine prochaine.',
    'Demande d\'information sur le package premium.',
    'Ne répond pas au téléphone — laisser un message.',
    'Réunion planifiée pour la semaine prochaine.',
    'Client a demandé un devis détaillé.',
    'Très intéressé, attend la validation de son conjoint.',
    'A posé des questions sur le financement.',
    'Rendez-vous confirmé pour mardi à 10h.',
  ];
  return Array.from({ length: count }, (_, i) => ({
    id: `note-${Math.random().toString(36).slice(2)}`,
    content: randItem(noteTexts),
    authorId: agentId,
    authorName: agentName,
    createdAt: randDate(i * 2 + 1, 2),
  }));
}

const AGENT_NAMES: Record<string, string> = {
  'a-1': 'Tarik Mansour', 'a-2': 'Karim Bennani', 'a-3': 'Salma Chraibi',
  'a-4': 'Anas Filali', 'a-5': 'Mounia Lahlou', 'a-6': 'Reda Tazi',
  'a-7': 'Hiba Berrada', 'a-8': 'Omar Kettani', 'a-9': 'Layla Bensaid',
  'a-10': 'Youssef Cherkaoui', 'a-11': 'Amira Benali', 'a-12': 'Bilal Ouali',
};

export const MOCK_LEADS: Lead[] = ALL_NAMES.map((fullName, i) => {
  const [firstName, ...lastParts] = fullName.split(' ');
  const lastName = lastParts.join(' ');
  const camp = CAMPAIGNS[i % CAMPAIGNS.length];
  const assignedAgentId = i % 7 === 0 ? null : AGENT_IDS[i % AGENT_IDS.length];
  const agentName = assignedAgentId ? AGENT_NAMES[assignedAgentId] : '';
  const noteCount = i % 5 === 0 ? 2 : i % 3 === 0 ? 1 : 0;

  return {
    id: `l-${i + 1}`,
    firstName,
    lastName,
    fullName,
    phone: randPhone(),
    email: `${firstName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '.')}.${lastName.split(' ')[0].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}@gmail.com`,
    city: CITIES[i % CITIES.length],
    campaignId: camp.id,
    campaignName: camp.name,
    assignedAgentId,
    status: STATUSES[i % STATUSES.length],
    priority: PRIORITIES[i % PRIORITIES.length],
    lastContact: randDate(i % 14, 3),
    notes: assignedAgentId ? buildNotes(noteCount, assignedAgentId, agentName) : [],
    tags: i % 4 === 0 ? [randItem(TAGS_POOL), randItem(TAGS_POOL)].filter((v, idx, a) => a.indexOf(v) === idx) : i % 6 === 0 ? [randItem(TAGS_POOL)] : [],
    createdAt: randDate(i + 10, 30),
  };
});
