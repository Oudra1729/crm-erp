import { Campaign } from '../types';

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'c-1',
    name: 'Campagne Immobilier Q2 2026',
    description: 'Prospection de clients potentiels pour des projets immobiliers résidentiels et commerciaux dans les grandes villes.',
    status: 'Active',
    startDate: '2026-04-01',
    endDate: '2026-06-30',
    stats: {
      leadsAssigned: 180,
      totalLeads: 200,
      conversionRate: 24.5,
      numberOfAgents: 4,
    },
  },
  {
    id: 'c-2',
    name: 'Assurance Vie Premium',
    description: 'Campagne de vente de produits d\'assurance vie et prévoyance pour particuliers et entreprises.',
    status: 'Active',
    startDate: '2026-03-15',
    endDate: '2026-07-15',
    stats: {
      leadsAssigned: 120,
      totalLeads: 150,
      conversionRate: 18.3,
      numberOfAgents: 3,
    },
  },
  {
    id: 'c-3',
    name: 'Formation Professionnelle',
    description: 'Recrutement de participants pour des formations certifiantes en management, digital et langues.',
    status: 'Completed',
    startDate: '2026-01-10',
    endDate: '2026-03-31',
    stats: {
      leadsAssigned: 95,
      totalLeads: 100,
      conversionRate: 31.6,
      numberOfAgents: 2,
    },
  },
  {
    id: 'c-4',
    name: 'Crédit Auto 2026',
    description: 'Promotion de solutions de financement automobile pour particuliers souhaitant acquérir un véhicule neuf ou occasion.',
    status: 'Draft',
    startDate: '2026-07-01',
    endDate: '2026-09-30',
    stats: {
      leadsAssigned: 0,
      totalLeads: 300,
      conversionRate: 0,
      numberOfAgents: 0,
    },
  },
  {
    id: 'c-5',
    name: 'Télécommunication Pro',
    description: 'Acquisition de clients professionnels pour des offres de téléphonie et internet entreprise.',
    status: 'Paused',
    startDate: '2026-02-01',
    endDate: '2026-05-31',
    stats: {
      leadsAssigned: 65,
      totalLeads: 120,
      conversionRate: 11.5,
      numberOfAgents: 2,
    },
  },
];

export const CAMPAIGN_DAILY_DATA = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toLocaleDateString('fr-MA', { day: '2-digit', month: 'short' }),
    'Immobilier': Math.floor(Math.random() * 12 + 3),
    'Assurance': Math.floor(Math.random() * 8 + 2),
    'Formation': Math.floor(Math.random() * 6 + 1),
    'Télécom': Math.floor(Math.random() * 5 + 1),
  };
});
