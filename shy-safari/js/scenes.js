// Scenes and their animals. rarity: "common" | "uncommon" | "rare".
// size scales the emoji (1 = normal). band is the vertical range (in % of
// the screen) where the animal can settle; defaults to the scene's ground.

export const RARITY_WEIGHT = { common: 10, uncommon: 4, rare: 1 };

export const SCENES = {
  savanna: {
    name: "Savanna",
    blurb: "Zebras, giraffes and lions",
    icon: "🦒",
    ground: [60, 90],
    animals: [
      { id: "zebra", name: "Zebra", emoji: "🦓", rarity: "common" },
      { id: "giraffe", name: "Giraffe", emoji: "🦒", rarity: "common", size: 1.5 },
      { id: "warthog", name: "Warthog", emoji: "🐗", rarity: "common" },
      { id: "buffalo", name: "Buffalo", emoji: "🐃", rarity: "common", size: 1.2 },
      { id: "monkey", name: "Baboon", emoji: "🐒", rarity: "common" },
      { id: "tortoise", name: "Tortoise", emoji: "🐢", rarity: "common", size: 0.7 },
      { id: "flamingo", name: "Flamingo", emoji: "🦩", rarity: "common" },
      { id: "lizard", name: "Agama lizard", emoji: "🦎", rarity: "common", size: 0.6 },
      { id: "hippo", name: "Hippo", emoji: "🦛", rarity: "uncommon", size: 1.3 },
      { id: "rhino", name: "Rhino", emoji: "🦏", rarity: "uncommon", size: 1.3 },
      { id: "croc", name: "Crocodile", emoji: "🐊", rarity: "uncommon", size: 1.1 },
      { id: "eagle", name: "Eagle", emoji: "🦅", rarity: "uncommon", band: [12, 35] },
      { id: "elephant", name: "Elephant", emoji: "🐘", rarity: "rare", size: 1.7 },
      { id: "lion", name: "Lion", emoji: "🦁", rarity: "rare", size: 1.2 },
      { id: "leopard", name: "Leopard", emoji: "🐆", rarity: "rare", size: 1.2 },
    ],
  },
  reef: {
    name: "Coral reef",
    blurb: "Clownfish, turtles and sharks",
    icon: "🐠",
    ground: [22, 88],
    animals: [
      { id: "tropical", name: "Tropical fish", emoji: "🐠", rarity: "common" },
      { id: "fish", name: "Blue fish", emoji: "🐟", rarity: "common" },
      { id: "puffer", name: "Pufferfish", emoji: "🐡", rarity: "common" },
      { id: "crab", name: "Crab", emoji: "🦀", rarity: "common", size: 0.8, band: [80, 90] },
      { id: "shrimp", name: "Shrimp", emoji: "🦐", rarity: "common", size: 0.7 },
      { id: "lobster", name: "Lobster", emoji: "🦞", rarity: "common", band: [78, 90] },
      { id: "squid", name: "Squid", emoji: "🦑", rarity: "uncommon" },
      { id: "octopus", name: "Octopus", emoji: "🐙", rarity: "uncommon" },
      { id: "turtle", name: "Sea turtle", emoji: "🐢", rarity: "uncommon", size: 1.2 },
      { id: "seal", name: "Seal", emoji: "🦭", rarity: "uncommon", size: 1.2 },
      { id: "dolphin", name: "Dolphin", emoji: "🐬", rarity: "uncommon", size: 1.4 },
      { id: "shark", name: "Shark", emoji: "🦈", rarity: "rare", size: 1.6 },
      { id: "whale", name: "Whale", emoji: "🐋", rarity: "rare", size: 2 },
    ],
  },
  forest: {
    name: "Forest",
    blurb: "Hedgehogs, foxes and bears",
    icon: "🦊",
    ground: [62, 90],
    animals: [
      { id: "chipmunk", name: "Chipmunk", emoji: "🐿️", rarity: "common", size: 0.7 },
      { id: "hedgehog", name: "Hedgehog", emoji: "🦔", rarity: "common", size: 0.7 },
      { id: "rabbit", name: "Rabbit", emoji: "🐇", rarity: "common", size: 0.8 },
      { id: "snail", name: "Snail", emoji: "🐌", rarity: "common", size: 0.5 },
      { id: "butterfly", name: "Butterfly", emoji: "🦋", rarity: "common", size: 0.6, band: [30, 55] },
      { id: "bird", name: "Robin", emoji: "🐦", rarity: "common", size: 0.7, band: [25, 50] },
      { id: "owl", name: "Owl", emoji: "🦉", rarity: "uncommon", band: [22, 45] },
      { id: "raccoon", name: "Raccoon", emoji: "🦝", rarity: "uncommon" },
      { id: "fox", name: "Fox", emoji: "🦊", rarity: "uncommon" },
      { id: "badger", name: "Badger", emoji: "🦡", rarity: "uncommon" },
      { id: "deer", name: "Deer", emoji: "🦌", rarity: "uncommon", size: 1.4 },
      { id: "beaver", name: "Beaver", emoji: "🦫", rarity: "uncommon" },
      { id: "wolf", name: "Wolf", emoji: "🐺", rarity: "rare", size: 1.2 },
      { id: "bear", name: "Bear", emoji: "🐻", rarity: "rare", size: 1.5 },
    ],
  },
  arctic: {
    name: "Polar ice",
    blurb: "Penguins, seals and polar bears",
    icon: "🐧",
    ground: [58, 90],
    animals: [
      { id: "penguin", name: "Penguin", emoji: "🐧", rarity: "common" },
      { id: "hare", name: "Snow hare", emoji: "🐇", rarity: "common", size: 0.8 },
      { id: "fish", name: "Arctic char", emoji: "🐟", rarity: "common", size: 0.7 },
      { id: "seal", name: "Seal", emoji: "🦭", rarity: "common", size: 1.2 },
      { id: "owl", name: "Snowy owl", emoji: "🦉", rarity: "common", band: [18, 40] },
      { id: "fox", name: "Arctic fox", emoji: "🦊", rarity: "uncommon" },
      { id: "caribou", name: "Caribou", emoji: "🦌", rarity: "uncommon", size: 1.4 },
      { id: "wolf", name: "Arctic wolf", emoji: "🐺", rarity: "uncommon", size: 1.2 },
      { id: "whale", name: "Bowhead whale", emoji: "🐋", rarity: "rare", size: 2 },
      { id: "polarbear", name: "Polar bear", emoji: "🐻‍❄️", rarity: "rare", size: 1.6 },
    ],
  },
};

export function pickAnimal(scene, rand = Math.random) {
  const list = SCENES[scene].animals;
  const total = list.reduce((s, a) => s + RARITY_WEIGHT[a.rarity], 0);
  let r = rand() * total;
  for (const a of list) {
    r -= RARITY_WEIGHT[a.rarity];
    if (r <= 0) return a;
  }
  return list[list.length - 1];
}
