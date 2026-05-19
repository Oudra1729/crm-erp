import "dotenv/config";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";
import { db } from "../db/index.js";
import {
  users,
  campaigns,
  leads,
  leadNotes,
  notifications,
  tasks,
} from "../db/schema.js";

const PASSWORD = "prolead123";

const SEED_USERS = [
  { email: "admin@prolead.com", firstName: "Tarik", lastName: "Mansour", role: "Admin" as const, phone: "+212 611 111 111", initials: "TM" },
  { email: "supervisor1@prolead.com", firstName: "Karim", lastName: "Bennani", role: "Supervisor" as const, phone: "+212 622 222 222", initials: "KB" },
  { email: "supervisor2@prolead.com", firstName: "Mounia", lastName: "Lahlou", role: "Supervisor" as const, phone: "+212 655 555 555", initials: "ML" },
  { email: "agent1@prolead.com", firstName: "Hiba", lastName: "Berrada", role: "Agent" as const, phone: "+212 677 777 777", initials: "HB" },
  { email: "agent2@prolead.com", firstName: "Anas", lastName: "Filali", role: "Agent" as const, phone: "+212 644 444 444", initials: "AF" },
  { email: "agent3@prolead.com", firstName: "Layla", lastName: "Bensaid", role: "Agent" as const, phone: "+212 688 888 888", initials: "LB" },
  { email: "salma.chraibi@prolead.com", firstName: "Salma", lastName: "Chraibi", role: "Agent" as const, phone: "+212 633 333 333", initials: "SC" },
  { email: "anas.filali@prolead.com", firstName: "Anas", lastName: "Filali", role: "Agent" as const, phone: "+212 644 444 444", initials: "AF2" },
];

const SEED_CAMPAIGNS = [
  { name: "Campagne Immobilier Q2 2026", description: "Prospection immobilière résidentielle et commerciale.", status: "Active" as const, startDate: "2026-04-01", endDate: "2026-06-30" },
  { name: "Assurance Vie Premium", description: "Vente de produits d'assurance vie et prévoyance.", status: "Active" as const, startDate: "2026-03-15", endDate: "2026-07-15" },
  { name: "Formation Professionnelle", description: "Recrutement pour formations certifiantes.", status: "Completed" as const, startDate: "2026-01-10", endDate: "2026-03-31" },
  { name: "Crédit Auto 2026", description: "Financement automobile neuf et occasion.", status: "Draft" as const, startDate: "2026-07-01", endDate: "2026-09-30" },
  { name: "Télécommunication Pro", description: "Offres B2B télécom.", status: "Paused" as const, startDate: "2026-02-01", endDate: "2026-05-31" },
];

const NAMES = [
  "Fatima Zahra El Amrani", "Youssef Benchekroun", "Leila Moussaoui", "Mehdi Tazi", "Nadia Benhaddou",
  "Mohammed Alaoui", "Sara Fassi", "Karim Benali", "Asmaa Chraibi", "Omar Berrada",
  "Houda Kettani", "Rachid Oumzil", "Zineb Lahlou", "Hassan Ouahabi", "Imane Sebbar",
  "Driss Filali", "Khadija Bensouda", "Amine Tahiri", "Meriem Benkirane", "Soufiane Boukili",
  "Ayoub Idrissi", "Salma Bennani", "Yassine Kabbaj", "Nawal El Fassi", "Tarik Chraibi",
  "Brahim Lahlou", "Maryam Skalli", "Khalid Hajji", "Samira Bouzidi", "Fouad Berrada",
];

const CITIES = ["Casablanca", "Rabat", "Marrakech", "Fès", "Agadir", "Tanger"];
const STATUSES = ["New", "In Progress", "Callback", "Interested", "Converted", "Not Interested", "No Answer", "Invalid Number"] as const;
const PRIORITIES = ["High", "Medium", "Low"] as const;

async function clearAll() {
  console.log("Clearing existing data...");
  await db.execute(sql`TRUNCATE TABLE lead_notes, tasks, notifications, leads, campaigns, users CASCADE`);
}

async function seed() {
  await clearAll();
  const passwordHash = await bcrypt.hash(PASSWORD, 12);

  console.log("Seeding users...");
  const insertedUsers = await db
    .insert(users)
    .values(
      SEED_USERS.map((u) => ({
        email: u.email,
        passwordHash,
        firstName: u.firstName,
        lastName: u.lastName,
        fullName: `${u.firstName} ${u.lastName}`,
        role: u.role,
        phone: u.phone,
        isOnline: u.role !== "Agent" || u.email === "agent1@prolead.com",
        avatarInitials: u.initials,
      })),
    )
    .returning();

  const userByEmail = Object.fromEntries(insertedUsers.map((u) => [u.email, u]));
  const agents = insertedUsers.filter((u) => u.role === "Agent");

  console.log("Seeding campaigns...");
  const insertedCampaigns = await db.insert(campaigns).values(SEED_CAMPAIGNS).returning();

  console.log("Seeding leads...");
  const leadRows = NAMES.map((fullName, i) => {
    const [firstName, ...rest] = fullName.split(" ");
    const lastName = rest.join(" ");
    const camp = insertedCampaigns[i % insertedCampaigns.length];
    const agent = i % 7 === 0 ? null : agents[i % agents.length];
    return {
      firstName,
      lastName,
      fullName,
      phone: `+212 6${String(10 + (i % 89)).padStart(2, "0")} ${String(100000 + i).slice(0, 2)} ${String(100000 + i).slice(2, 4)} ${String(100000 + i).slice(4, 6)}`,
      email: `${firstName.toLowerCase().replace(/\s/g, ".")}.${lastName.split(" ")[0]?.toLowerCase() ?? "x"}@gmail.com`,
      city: CITIES[i % CITIES.length],
      campaignId: camp.id,
      assignedAgentId: agent?.id ?? null,
      status: STATUSES[i % STATUSES.length],
      priority: PRIORITIES[i % PRIORITIES.length],
      lastContact: new Date(Date.now() - i * 86400000),
      tags: i % 4 === 0 ? ["VIP", "Follow up"] : i % 6 === 0 ? ["Prospect chaud"] : [],
    };
  });

  const insertedLeads = await db.insert(leads).values(leadRows).returning();

  console.log("Seeding lead notes...");
  const noteSamples = [
    "Client intéressé, rappeler la semaine prochaine.",
    "Demande d'information sur le package premium.",
    "Rendez-vous confirmé pour mardi à 10h.",
  ];
  for (let i = 0; i < Math.min(15, insertedLeads.length); i++) {
    const lead = insertedLeads[i];
    if (!lead.assignedAgentId) continue;
    await db.insert(leadNotes).values({
      leadId: lead.id,
      content: noteSamples[i % noteSamples.length],
      authorId: lead.assignedAgentId,
    });
  }

  console.log("Seeding notifications...");
  await db.insert(notifications).values([
    { title: "Nouveau lead assigné", description: "Fatima Zahra El Amrani a été assignée.", type: "lead", isRead: false },
    { title: "Statut mis à jour", description: "Youssef Benchekroun est passé à En cours.", type: "lead", isRead: false },
    { title: "Rappel planifié", description: "Rappel pour Leila Moussaoui dans 30 minutes.", type: "system", isRead: false },
    { title: "Campagne activée", description: "Crédit Auto 2026 activée.", type: "campaign", isRead: true },
    { title: "Import CSV terminé", description: "243 leads importés.", type: "system", isRead: true },
    { userId: userByEmail["agent1@prolead.com"].id, title: "Objectif atteint", description: "Objectif mensuel atteint.", type: "lead", isRead: true },
  ]);

  console.log("Seeding tasks...");
  const agent1 = userByEmail["agent1@prolead.com"];
  await db.insert(tasks).values([
    { userId: agent1.id, title: "Rappeler Fatima El Amrani concernant l'offre immobilière", priority: "high", dueDate: "Aujourd'hui 14h00" },
    { userId: agent1.id, title: "Envoyer le rapport de performance", priority: "high", dueDate: "Aujourd'hui 17h00", done: false },
    { userId: agent1.id, title: "Mettre à jour les scripts d'appel", priority: "low", done: true },
    { userId: agent1.id, title: "Analyser les performances du mois", priority: "low", done: true },
  ]);

  console.log("Seed complete!");
  console.log(`  Users: ${insertedUsers.length}`);
  console.log(`  Campaigns: ${insertedCampaigns.length}`);
  console.log(`  Leads: ${insertedLeads.length}`);
  console.log(`  Login: admin@prolead.com / ${PASSWORD}`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
