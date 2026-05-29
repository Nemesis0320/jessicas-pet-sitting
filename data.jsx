// Seed data for the prototype
const SEED = {
  // Logged-in user defaults
  user:  { id: "u-sarah",   name: "Sarah Chen",     role: "user",  avatar: "SC", email: "sarah.chen@email.com", homeId: "home-1" },
  admin: { id: "u-jessica", name: "Jessica Samp",   role: "admin", avatar: "JS", email: "jessica@jessicaspetsitting.com" },

  // Household members (besides the primary owner)
  users: {
    "u-sarah":    { id: "u-sarah",    name: "Sarah Chen",       email: "sarah.chen@email.com",  phone: "(847) 855-0143", homeId: "home-1", isPrimary: true },
    "u-david":    { id: "u-david",    name: "David Chen",       email: "david.chen@email.com",  phone: "(847) 855-0144", homeId: "home-1", isPrimary: false },
    "u-marco":    { id: "u-marco",    name: "Marco Garcia",     email: "marco.g@email.com",     phone: "(847) 855-0271", homeId: "home-2", isPrimary: true },
    "u-adaeze":   { id: "u-adaeze",   name: "Adaeze Okonkwo",   email: "adaeze@email.com",      phone: "(847) 367-0388", homeId: "home-3", isPrimary: true },
    "u-eleanor":  { id: "u-eleanor",  name: "Eleanor Whitfield",email: "ewhitfield@email.com",  phone: "(847) 244-0455", homeId: "home-4", isPrimary: true },
  },

  homes: [
    {
      id: "home-1",
      name: "The Chen Residence",
      address: "412 Maple Grove Ln, Gurnee IL 60031",
      residents: ["u-sarah", "u-david"],
      wifiNetwork: "ChenHome",
      wifiPassword: "pawprint2024",
      accessKind: "Lockbox",
      accessDetail: "Code: 4821. Mounted next to the front door. Spare key under the blue planter on porch.",
      emergencyVet: "Gurnee Animal Hospital",
      emergencyPhone: "(847) 855-0900",
      notes: "Please water the fiddle leaf fig by the window every 3 days. Mail comes around 2pm, please bring it inside.",
      pets: ["pet-1", "pet-2"],
      status: "active",
    },
    {
      id: "home-2",
      name: "Garcia Family",
      address: "88 Birchwood Ave, Gurnee IL 60031",
      residents: ["u-marco"],
      wifiNetwork: "GarciaNet",
      wifiPassword: "casitabonita",
      accessKind: "Garage code",
      accessDetail: "Garage code 7732. Side door unlocked once inside.",
      emergencyVet: "Banfield Pet Hospital — Gurnee Mills",
      emergencyPhone: "(847) 855-0800",
      notes: "Plants on the back patio need misting twice a week.",
      pets: ["pet-3"],
      status: "active",
    },
    {
      id: "home-3",
      name: "Okonkwo Loft",
      address: "1502 Lake St #4B, Libertyville IL 60048",
      residents: ["u-adaeze"],
      wifiNetwork: "Loft4B",
      wifiPassword: "sunsetlatte",
      accessKind: "Doorman",
      accessDetail: "Doorman has key. Ask for unit 4B.",
      emergencyVet: "Animal Emergency of Lake County",
      emergencyPhone: "(847) 367-0911",
      notes: "Mochi is shy and may hide under the bed for a day. That's okay!",
      pets: ["pet-4", "pet-5"],
      status: "upcoming",
    },
    {
      id: "home-4",
      name: "Whitfield Cottage",
      address: "27 Sheridan Rd, Waukegan IL 60087",
      residents: ["u-eleanor"],
      wifiNetwork: "Whitfield_5G",
      wifiPassword: "coastalbreeze",
      accessKind: "Lockbox",
      accessDetail: "Key in lockbox by the gate. Code: 1985.",
      emergencyVet: "Waukegan Animal Hospital",
      emergencyPhone: "(847) 244-0700",
      notes: "Three cats, two outdoor-allowed. Always count noses before bed.",
      pets: ["pet-6", "pet-7", "pet-8"],
      status: "upcoming",
    },
  ],

  // Birthdays drive age automatically. yyyy-mm-dd.
  pets: {
    "pet-1": { id: "pet-1", name: "Biscuit", species: "Dog", breed: "Beagle", birthday: "2021-04-12", weight: 24, weightUnit: "lb", sex: "Male", color: "Tri-color", home: "home-1", photos: [], tags: ["friendly", "loves walks"],
      meds: [
        { id: "m1", name: "Apoquel", dose: "8mg tablet", freq: "Once daily — morning with food", color: "amber" },
        { id: "m2", name: "Joint Supplement", dose: "1 chew", freq: "Once daily — anytime", color: "green" },
      ],
      vaccines: [
        { id: "v1", name: "Rabies",   given: "2024-04-15", expires: "2027-04-15" },
        { id: "v2", name: "DHPP",     given: "2024-04-15", expires: "2025-04-15" },
        { id: "v3", name: "Bordetella", given: "2024-09-01", expires: "2025-09-01" },
      ],
      incidents: [],
      care: "Biscuit eats 1 cup of kibble at 7am and 1 cup at 6pm. He gets a 20-minute walk in the morning and a longer walk after dinner. He's friendly with most dogs but pulls hard when he sees squirrels. Treats: only the green-bag ones in the pantry — anything else upsets his stomach.",
      notes: [
        { who: "Sarah", when: "Mon 8:14 AM", text: "Just gave Biscuit his morning Apoquel — he's already napping in the sunbeam." },
        { who: "Sarah", when: "Sun 9:02 PM", text: "Great walk tonight, met two other beagles at the park!" },
      ],
      checklist: {},
    },
    "pet-2": { id: "pet-2", name: "Pumpkin", species: "Cat", breed: "Maine Coon", birthday: "2018-08-03", weight: 13, weightUnit: "lb", sex: "Female", color: "Orange tabby", home: "home-1", photos: [], tags: ["indoor only", "shy with strangers"],
      meds: [{ id: "m3", name: "Methimazole", dose: "2.5mg tablet", freq: "Twice daily — 8am & 8pm", color: "purple" }],
      vaccines: [
        { id: "v4", name: "Rabies",    given: "2024-02-10", expires: "2027-02-10" },
        { id: "v5", name: "FVRCP",     given: "2024-02-10", expires: "2025-02-10" },
      ],
      incidents: [
        { id: "i1", date: "2025-11-08", severity: "minor", summary: "Scratched the door for 20 minutes when sitter arrived — settled after a treat." },
      ],
      care: "Pumpkin gets ¼ cup of dry food in the morning and a pouch of wet food (chicken pâté) at night. She prefers her water fountain on the kitchen counter — please refill daily. Don't let her out, even on the balcony.",
      notes: [{ who: "Sarah", when: "Mon 8:18 AM", text: "Pumpkin took her morning Methimazole hidden in a Churu treat — worked perfectly." }],
      checklist: {},
    },
    "pet-3": { id: "pet-3", name: "Rocco", species: "Dog", breed: "Border Collie", birthday: "2023-09-21", weight: 42, weightUnit: "lb", sex: "Male", color: "Black & white", home: "home-2", photos: [], tags: ["high energy", "fetch obsessed"], meds: [],
      vaccines: [
        { id: "v6", name: "Rabies",   given: "2024-10-01", expires: "2027-10-01" },
        { id: "v7", name: "DHPP",     given: "2024-10-01", expires: "2025-10-01" },
      ],
      incidents: [],
      care: "Rocco needs at least one 45-minute run or fetch session per day or he gets restless. Food: 2 cups twice a day. He knows 'sit', 'down', 'wait', and 'leave it'.", notes: [], checklist: {} },
    "pet-4": { id: "pet-4", name: "Mochi", species: "Cat", breed: "Ragdoll", birthday: "2022-11-08", weight: 10, weightUnit: "lb", sex: "Female", color: "Cream point", home: "home-3", photos: [], tags: ["shy", "indoor only"], meds: [],
      vaccines: [{ id: "v8", name: "Rabies", given: "2024-12-20", expires: "2027-12-20" }, { id: "v9", name: "FVRCP", given: "2024-12-20", expires: "2025-12-20" }],
      incidents: [],
      care: "Mochi is very shy. Just sit quietly on the floor and let her come to you. Wet food morning and night, ¼ can each.", notes: [], checklist: {} },
    "pet-5": { id: "pet-5", name: "Yuzu", species: "Cat", breed: "Domestic Shorthair", birthday: "2020-06-15", weight: 11, weightUnit: "lb", sex: "Male", color: "Black", home: "home-3", photos: [], tags: ["lap cat", "talkative"],
      meds: [{ id: "m4", name: "Gabapentin", dose: "50mg capsule", freq: "As needed for anxiety", color: "purple" }],
      vaccines: [{ id: "v10", name: "Rabies", given: "2024-12-20", expires: "2027-12-20" }, { id: "v11", name: "FVRCP", given: "2024-12-20", expires: "2025-12-20" }],
      incidents: [],
      care: "Yuzu will follow you everywhere and demand chin scratches. Feed alongside Mochi but in separate bowls — he steals her food.", notes: [], checklist: {} },
    "pet-6": { id: "pet-6", name: "Sir Reginald", species: "Cat", breed: "British Shorthair", birthday: "2016-02-29", weight: 14, weightUnit: "lb", sex: "Male", color: "Blue", home: "home-4", photos: [], tags: ["senior", "regal"],
      meds: [{ id: "m5", name: "Cosequin", dose: "1 capsule sprinkle", freq: "Once daily — over wet food", color: "green" }],
      vaccines: [{ id: "v12", name: "Rabies", given: "2024-03-01", expires: "2027-03-01" }, { id: "v13", name: "FVRCP", given: "2024-03-01", expires: "2025-03-01" }],
      incidents: [{ id: "i2", date: "2025-09-12", severity: "moderate", summary: "Vomited twice during a sitting — vet visit, given anti-nausea, recovered next day." }],
      care: "Sir Reginald is a senior gentleman. He likes his morning grooming session with the soft brush by the window seat.", notes: [], checklist: {} },
    "pet-7": { id: "pet-7", name: "Marlow", species: "Cat", breed: "Tabby Mix", birthday: "2020-05-04", weight: 12, weightUnit: "lb", sex: "Male", color: "Brown tabby", home: "home-4", photos: [], tags: ["outdoor access", "hunter"], meds: [],
      vaccines: [{ id: "v14", name: "Rabies", given: "2024-05-15", expires: "2027-05-15" }, { id: "v15", name: "FVRCP", given: "2024-05-15", expires: "2025-05-15" }, { id: "v16", name: "Feline Leukemia", given: "2024-05-15", expires: "2025-05-15" }],
      incidents: [],
      care: "Marlow goes out via the cat door but always comes back for dinner at 5pm. May bring you 'gifts' — please dispose discreetly.", notes: [], checklist: {} },
    "pet-8": { id: "pet-8", name: "Pip", species: "Cat", breed: "Calico", birthday: "2023-07-18", weight: 8, weightUnit: "lb", sex: "Female", color: "Calico", home: "home-4", photos: [], tags: ["outdoor access", "playful"], meds: [],
      vaccines: [{ id: "v17", name: "Rabies", given: "2024-08-01", expires: "2027-08-01" }, { id: "v18", name: "FVRCP", given: "2024-08-01", expires: "2025-08-01" }],
      incidents: [],
      care: "Pip is youngest and most playful — bring out the wand toy for at least 15 minutes a day.", notes: [], checklist: {} },
  },

  appointments: [
    { id: "ap-1", homeId: "home-1", requestedBy: "u-sarah", start: "2026-06-12T16:00",  end: "2026-06-19T11:00", status: "approved",  notes: "Annual family reunion in Seattle. Both kids and pets staying home.", createdAt: "2026-05-02" },
    { id: "ap-2", homeId: "home-2", requestedBy: "u-marco", start: "2026-06-14T08:00",  end: "2026-06-21T18:00", status: "approved",  notes: "Conference travel.", createdAt: "2026-05-04" },
    { id: "ap-3", homeId: "home-3", requestedBy: "u-adaeze",start: "2026-06-20T14:00",  end: "2026-07-02T20:00", status: "pending",   notes: "European holiday — first time leaving the cats this long. Daily check-in preferred.", createdAt: "2026-05-12" },
    { id: "ap-4", homeId: "home-4", requestedBy: "u-eleanor",start:"2026-06-25T09:00",  end: "2026-07-05T17:00", status: "pending",   notes: "Family wedding in Maine.", createdAt: "2026-05-13" },
  ],

  // Invoices — one per completed/active sitting (admin manages, owner views)
  invoices: [
    { id: "inv-001", homeId: "home-1", apptId: "ap-1", number: "2026-001", issued: "2026-05-15", dueIn: 14, days: 7, petCount: 2, rate: 65, extras: [{ label: "Medication administration", amount: 35 }], total: 0, status: "draft" },
    { id: "inv-002", homeId: "home-2", apptId: "ap-2", number: "2026-002", issued: "2026-05-16", dueIn: 14, days: 7, petCount: 1, rate: 55, extras: [], total: 0, status: "sent" },
  ],

  // Per-home onboarding checklist
  onboarding: {
    // homeId → { stepId: timestampOrTrue, ... }
  },

  // Pricing defaults
  pricing: {
    baseRate: 55,            // per day, first pet
    perAdditionalPet: 10,    // per day per extra pet
    medAdminFlat: 35,        // one-time per sitting if meds present
    overnightSurcharge: 0,
    weekendSurcharge: 10,    // per day on weekends
    currency: "USD",
  },
};

// Recalculate invoice totals on load
SEED.invoices.forEach(inv => {
  const r = SEED.pricing;
  const petDays = (inv.days || 0) * Math.max(0, (inv.petCount || 1) - 1);
  const base    = (inv.days || 0) * (inv.rate || r.baseRate);
  const extras  = (inv.extras || []).reduce((s, e) => s + e.amount, 0);
  inv.total = base + petDays * r.perAdditionalPet + extras;
});

// Compute age in years/months from yyyy-mm-dd birthday
window.computeAge = function(bday) {
  if (!bday) return null;
  const b = new Date(bday);
  if (isNaN(b)) return null;
  const now = new Date();
  let years = now.getFullYear() - b.getFullYear();
  let months = now.getMonth() - b.getMonth();
  if (now.getDate() < b.getDate()) months -= 1;
  if (months < 0) { years -= 1; months += 12; }
  if (years < 1) return `${months} mo`;
  if (years < 2 && months > 0) return `${years} yr ${months} mo`;
  return `${years} yr`;
};

// Days until / since a date string
window.daysUntil = function(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  const ms = d - new Date();
  return Math.ceil(ms / 86400000);
};

// Standard onboarding steps for a new home
window.ONBOARDING_STEPS = [
  { id: "claimed",   label: "Owner claimed account",     hint: "They verified email and set a password" },
  { id: "address",   label: "Home address added",         hint: "We know where to go" },
  { id: "access",    label: "Access details on file",     hint: "Lockbox code, key location, doorman, etc." },
  { id: "pets",      label: "Pets added",                 hint: "At least one pet on the profile" },
  { id: "vaccines",  label: "Vaccination records uploaded", hint: "Rabies + core vaccines for each pet" },
  { id: "vetauth",   label: "Vet authorization signed",   hint: "We can authorize emergency care up to $500" },
  { id: "intro",     label: "Intro meeting completed",    hint: "Jessica met the family + pets" },
];

window.SEED = SEED;
