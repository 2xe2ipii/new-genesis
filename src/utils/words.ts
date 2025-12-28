// src/utils/words.ts

export const WORD_PAIRS = [
  // ==========================================================
  // 1. TRAP QUESTIONS (110+ Pairs)
  // The goal: Make the Impostor's honest answer sound INSANE to the Majority.
  // ==========================================================
  
  // --- RELATIONSHIPS & PEOPLE ---
  { majority: "Describe your ex in one word.", impostor: "Describe your grandmother in one word.", type: "question" },
  { majority: "What is the first thing you notice in a potential partner?", impostor: "What is the first thing you look for in a public restroom?", type: "question" },
  { majority: "Who is the most annoying person you know?", impostor: "Who is the holiest person you know?", type: "question" },
  { majority: "What would you do if your crush confessed to you?", impostor: "What would you do if a kidnapper grabbed you?", type: "question" },
  { majority: "How do you flirt?", impostor: "How do you scare away a stray dog?", type: "question" },
  { majority: "What do you say during an awkward silence?", impostor: "What do you moan during a massage?", type: "question" },
  { majority: "What is your red flag?", impostor: "What is your favorite color?", type: "question" },
  { majority: "Why did you cry last time?", impostor: "Why did you laugh last time?", type: "question" },
  { majority: "What do you want to do on your wedding night?", impostor: "What do you want to do at a funeral?", type: "question" },

  // --- HYGIENE & BODY ---
  { majority: "What body part do you wash first?", impostor: "What body part do you rarely wash?", type: "question" },
  { majority: "What does your breath smell like in the morning?", impostor: "What does your favorite flower smell like?", type: "question" },
  { majority: "Where is the worst place to have an itch?", impostor: "Where is the best place to get a tattoo?", type: "question" },
  { majority: "What does earwax taste like?", impostor: "What does cheese taste like?", type: "question" },
  { majority: "How often do you change your underwear?", impostor: "How often do you celebrate your birthday?", type: "question" },
  { majority: "What do you use to clean your ears?", impostor: "What do you use to eat spaghetti?", type: "question" },
  { majority: "Describe the smell of a fart.", impostor: "Describe the smell of a bakery.", type: "question" },
  { majority: "Show me your 'holding in a poop' face.", impostor: "Show me your 'winning the lottery' face.", type: "question" },
  { majority: "What do you do with a booger?", impostor: "What do you do with a diamond?", type: "question" },

  // --- FOOD & DRINK ---
  { majority: "What is the weirdest thing you've eaten?", impostor: "What is the most delicious thing you've eaten?", type: "question" },
  { majority: "What do you eat when you're sad?", impostor: "What do you feed a stray cat?", type: "question" },
  { majority: "What does a rotten egg smell like?", impostor: "What does expensive perfume smell like?", type: "question" },
  { majority: "What is your favorite alcoholic drink?", impostor: "What is your favorite cleaning fluid?", type: "question" },
  { majority: "How do you eat pizza?", impostor: "How do you fold a fitted sheet?", type: "question" },
  { majority: "What is the worst pizza topping?", impostor: "What is the best ice cream flavor?", type: "question" },
  { majority: "Describe the texture of a raw oyster.", impostor: "Describe the texture of a fluffy pillow.", type: "question" },
  
  // --- SCENARIOS & ACTIONS ---
  { majority: "What do you usually do alone in your room?", impostor: "What do you usually do at church?", type: "question" },
  { majority: "What do you do when you see a ghost?", impostor: "What do you do when you see a cute baby?", type: "question" },
  { majority: "How do you kill a cockroach?", impostor: "How do you pet a puppy?", type: "question" },
  { majority: "What would you do if you were naked in public?", impostor: "What would you do if you won a million dollars?", type: "question" },
  { majority: "How do you beg for forgiveness?", impostor: "How do you order at Jollibee?", type: "question" },
  { majority: "What sound do you make when you are in pain?", impostor: "What sound do you make when you are excited?", type: "question" },
  { majority: "What is the best way to hide a body?", impostor: "What is the best way to wrap a gift?", type: "question" },
  { majority: "What do you say to a police officer?", impostor: "What do you say to a priest?", type: "question" },
  { majority: "Act like a monkey.", impostor: "Act like a supermodel.", type: "question" },
  { majority: "Mime smoking a cigarette.", impostor: "Mime eating a banana.", type: "question" },
  
  // --- OBJECTS & PLACES ---
  { majority: "Where is the dirtiest place in your house?", impostor: "Where is the holiest place in your house?", type: "question" },
  { majority: "What object would you use to hit a burglar?", impostor: "What object would you use to comb your hair?", type: "question" },
  { majority: "What is under your bed?", impostor: "What is in your wallet?", type: "question" },
  { majority: "What is the most useless thing you own?", impostor: "What is the most expensive thing you own?", type: "question" },
  { majority: "Where do you go to cry?", impostor: "Where do you go to party?", type: "question" },
  { majority: "What does a public toilet look like?", impostor: "What does a 5-star hotel look like?", type: "question" },
  
  // --- PINOY SPECIFIC (CULTURE) ---
  { majority: "What do you say to the jeepney driver?", impostor: "What do you say to your crush?", type: "question" },
  { majority: "What is your favorite pulutan?", impostor: "What is your favorite breakfast?", type: "question" },
  { majority: "Describe the smell of durian.", impostor: "Describe the smell of sampaguita.", type: "question" },
  { majority: "What do you do when the National Anthem plays?", impostor: "What do you do when 'Budots' plays?", type: "question" },
  { majority: "Who is the most famous Filipino?", impostor: "Who is the most hated Filipino?", type: "question" },
  { majority: "What do you bring to a potluck?", impostor: "What do you steal from a hotel?", type: "question" },
  { majority: "What happens in a telenovela?", impostor: "What happens in a horror movie?", type: "question" },
  { majority: "What is the scariest Filipino monster?", impostor: "What is the cutest Filipino celebrity?", type: "question" },
  { majority: "How do you point at something (Pinoy style)?", impostor: "How do you punch someone?", type: "question" },

  // --- ABSTRACT & RANDOM ---
  { majority: "What is your spirit animal?", impostor: "What is your favorite food?", type: "question" },
  { majority: "If you were a color, what would you be?", impostor: "If you were a smell, what would you be?", type: "question" },
  { majority: "What is the meaning of life?", impostor: "What is the password to your phone?", type: "question" },
  { majority: "What sound does a cow make?", impostor: "What sound does a cat make?", type: "question" },
  { majority: "How high can you jump?", impostor: "How loud can you scream?", type: "question" },
  { majority: "Make a scary face.", impostor: "Make a sexy face.", type: "question" },
  { majority: "What is your biggest fear?", impostor: "What is your favorite hobby?", type: "question" },
  { majority: "How do you sleep at night?", impostor: "How do you dance in the club?", type: "question" },
  { majority: "What does rain sound like?", impostor: "What does a bomb explosion sound like?", type: "question" },
  
  // --- MORE TRAPS ---
  { majority: "What’s the last lie you told?", impostor: "What’s the last movie you watched?", type: "question" },
  { majority: "What’s in your browser history?", impostor: "What’s in your fridge?", type: "question" },
  { majority: "How do you know you are in love?", impostor: "How do you know you have diarrhea?", type: "question" },
  { majority: "What do you do when you get caught?", impostor: "What do you do when you win?", type: "question" },
  { majority: "Describe your boss.", impostor: "Describe your pet.", type: "question" },
  { majority: "What size is your shoe?", impostor: "What size is your... heart?", type: "question" },
  { majority: "What is the worst way to die?", impostor: "What is the best way to sleep?", type: "question" },
  { majority: "What smells like fish?", impostor: "What smells like flowers?", type: "question" },
  { majority: "What is sticky?", impostor: "What is slippery?", type: "question" },
  { majority: "What makes you vomit?", impostor: "What makes you smile?", type: "question" },
  { majority: "What is scary in the dark?", impostor: "What is beautiful in the dark?", type: "question" },
  { majority: "What do you do with a dead body?", impostor: "What do you do with a sleeping baby?", type: "question" },
  { majority: "What is the worst sound in the world?", impostor: "What is the most relaxing sound?", type: "question" },
  { majority: "Who is the ugliest person here?", impostor: "Who is the smartest person here?", type: "question" },
  { majority: "What is your guilty pleasure?", impostor: "What is your daily routine?", type: "question" },
  { majority: "How do you act when you are drunk?", impostor: "How do you act when you are at a job interview?", type: "question" },
  { majority: "What does poop taste like?", impostor: "What does chocolate taste like?", type: "question" },
  { majority: "What is forbidden?", impostor: "What is free?", type: "question" },
  { majority: "How do you kill time?", impostor: "How do you kill a vampire?", type: "question" },
  { majority: "What is loud?", impostor: "What is silent?", type: "question" },
  { majority: "What is hard?", impostor: "What is soft?", type: "question" },
  { majority: "What is wet?", impostor: "What is dry?", type: "question" },
  { majority: "What is long?", impostor: "What is short?", type: "question" },
  { majority: "What is deep?", impostor: "What is shallow?", type: "question" },

  // ==========================================================
  // 2. WORD PAIRS (90+ Pairs)
  // Simple nouns, but contextually tricky.
  // ==========================================================
  
  // --- HOUSEHOLD ---
  { majority: "Toothbrush", impostor: "Toilet Brush", type: "word" },
  { majority: "Shampoo", impostor: "Glue", type: "word" },
  { majority: "Spoon", impostor: "Shovel", type: "word" },
  { majority: "Plate", impostor: "Frisbee", type: "word" },
  { majority: "Cup", impostor: "Bucket", type: "word" },
  { majority: "Pillow", impostor: "Rock", type: "word" },
  { majority: "Blanket", impostor: "Towel", type: "word" },
  { majority: "Bed", impostor: "Coffin", type: "word" },
  { majority: "Door", impostor: "Wall", type: "word" },
  { majority: "Window", impostor: "Mirror", type: "word" },
  { majority: "Chair", impostor: "Toilet", type: "word" },
  { majority: "Table", impostor: "Floor", type: "word" },
  { majority: "Knife", impostor: "Sword", type: "word" },
  { majority: "Fork", impostor: "Trident", type: "word" },
  { majority: "Clock", impostor: "Compass", type: "word" },
  { majority: "Fan", impostor: "Typhoon", type: "word" },
  { majority: "Trash Can", impostor: "Treasure Chest", type: "word" },
  { majority: "Rug", impostor: "Map", type: "word" },
  { majority: "Key", impostor: "Coin", type: "word" },

  // --- FOOD ---
  { majority: "Apple", impostor: "Onion", type: "word" },
  { majority: "Sugar", impostor: "Salt", type: "word" },
  { majority: "Banana", impostor: "Sausage", type: "word" },
  { majority: "Bread", impostor: "Sponge", type: "word" },
  { majority: "Soup", impostor: "Dishwater", type: "word" },
  { majority: "Rice", impostor: "Maggots", type: "word" },
  { majority: "Chocolate", impostor: "Poop", type: "word" },
  { majority: "Ice Cream", impostor: "Soap", type: "word" },
  { majority: "Cake", impostor: "Cardboard", type: "word" },
  { majority: "Chicken", impostor: "Pigeon", type: "word" },
  { majority: "Beef", impostor: "Rat", type: "word" },
  { majority: "Fish", impostor: "Slipper", type: "word" },
  { majority: "Egg", impostor: "Ping Pong Ball", type: "word" },
  { majority: "Milk", impostor: "Paint", type: "word" },
  { majority: "Water", impostor: "Vinegar", type: "word" },
  { majority: "Coffee", impostor: "Mud", type: "word" },
  { majority: "Tea", impostor: "Pee", type: "word" },
  { majority: "Candy", impostor: "Medicine", type: "word" },
  
  // --- BODY & APPEARANCE ---
  { majority: "Hair", impostor: "Spaghetti", type: "word" },
  { majority: "Eyes", impostor: "Cameras", type: "word" },
  { majority: "Nose", impostor: "Button", type: "word" },
  { majority: "Teeth", impostor: "Corn", type: "word" },
  { majority: "Tongue", impostor: "Slug", type: "word" },
  { majority: "Hand", impostor: "Foot", type: "word" },
  { majority: "Finger", impostor: "Toe", type: "word" },
  { majority: "Belly", impostor: "Balloon", type: "word" },
  { majority: "Butt", impostor: "Peach", type: "word" },
  { majority: "Skin", impostor: "Leather", type: "word" },
  { majority: "Blood", impostor: "Ketchup", type: "word" },
  { majority: "Sweat", impostor: "Rain", type: "word" },
  { majority: "Tears", impostor: "Saliva", type: "word" },
  { majority: "Wig", impostor: "Mop", type: "word" },
  { majority: "Makeup", impostor: "Paint", type: "word" },
  { majority: "Perfume", impostor: "Baygon", type: "word" },
  
  // --- NATURE & ANIMALS ---
  { majority: "Sun", impostor: "Lightbulb", type: "word" },
  { majority: "Moon", impostor: "Cheese", type: "word" },
  { majority: "Star", impostor: "Diamond", type: "word" },
  { majority: "Cloud", impostor: "Cotton", type: "word" },
  { majority: "Rain", impostor: "Shower", type: "word" },
  { majority: "Tree", impostor: "Broccoli", type: "word" },
  { majority: "Flower", impostor: "Weed", type: "word" },
  { majority: "Grass", impostor: "Carpet", type: "word" },
  { majority: "Dog", impostor: "Wolf", type: "word" },
  { majority: "Cat", impostor: "Tiger", type: "word" },
  { majority: "Bird", impostor: "Drone", type: "word" },
  { majority: "Fish", impostor: "Submarine", type: "word" },
  { majority: "Snake", impostor: "Rope", type: "word" },
  { majority: "Spider", impostor: "Hand", type: "word" },
  { majority: "Monkey", impostor: "Human", type: "word" },
  { majority: "Cow", impostor: "Car", type: "word" },
  { majority: "Pig", impostor: "Bank", type: "word" },
  
  // --- RANDOM OBJECTS ---
  { majority: "Phone", impostor: "Calculator", type: "word" },
  { majority: "Laptop", impostor: "Book", type: "word" },
  { majority: "Camera", impostor: "Gun", type: "word" },
  { majority: "Car", impostor: "Carriage", type: "word" },
  { majority: "Bike", impostor: "Wheelchair", type: "word" },
  { majority: "Plane", impostor: "Bird", type: "word" },
  { majority: "Boat", impostor: "Bathtub", type: "word" },
  { majority: "Train", impostor: "Centipede", type: "word" },
  { majority: "Ball", impostor: "Egg", type: "word" },
  { majority: "Balloon", impostor: "Condom", type: "word" },
  { majority: "Doll", impostor: "Baby", type: "word" },
  { majority: "Robot", impostor: "Zombie", type: "word" },
  { majority: "Ghost", impostor: "Sheet", type: "word" },
  { majority: "Alien", impostor: "Tourist", type: "word" },
  { majority: "Vampire", impostor: "Mosquito", type: "word" },
  { majority: "Zombie", impostor: "Drunkard", type: "word" },
  { majority: "Witch", impostor: "Mother-in-law", type: "word" },
  { majority: "Dragon", impostor: "Lizard", type: "word" },
  
  // --- CONCEPTS ---
  { majority: "Love", impostor: "Obsession", type: "word" },
  { majority: "Hate", impostor: "Indifference", type: "word" },
  { majority: "War", impostor: "Argument", type: "word" },
  { majority: "Peace", impostor: "Silence", type: "word" },
  { majority: "Dream", impostor: "Movie", type: "word" },
  { majority: "Nightmare", impostor: "Reality", type: "word" },
  { majority: "Heaven", impostor: "Vacation", type: "word" },
  { majority: "Hell", impostor: "Work", type: "word" },
  { majority: "Future", impostor: "Tomorrow", type: "word" },
  { majority: "Past", impostor: "History", type: "word" },
  { majority: "Secret", impostor: "Gossip", type: "word" },
  { majority: "Lie", impostor: "Joke", type: "word" },
  { majority: "Truth", impostor: "Insult", type: "word" },
  
  // --- PINOY CLASSICS ---
  { majority: "Balut", impostor: "Egg", type: "word" },
  { majority: "Taho", impostor: "Tokwa", type: "word" },
  { majority: "Jeepney", impostor: "Bus", type: "word" },
  { majority: "Tricycle", impostor: "Motorcycle", type: "word" },
  { majority: "Karaoke", impostor: "Concert", type: "word" },
  { majority: "Fiesta", impostor: "Riot", type: "word" },
  { majority: "Siopao", impostor: "Cat", type: "word" },
  { majority: "Sari-sari Store", impostor: "Mall", type: "word" },
  { majority: "Tabo", impostor: "Dipper", type: "word" },
  { majority: "Tsinelas", impostor: "Weapon", type: "word" },
];

export const getUniqueWordPair = (usedIndices: number[] = []) => {
  // 1. Create a pool of ALL valid indices (0 to length-1)
  const allIndices = Array.from({ length: WORD_PAIRS.length }, (_, i) => i);

  // 2. Filter out the ones we've already used
  const availableIndices = allIndices.filter(index => !usedIndices.includes(index));

  // 3. Safety Check: If we ran out of words, reset the pool (or just pick random)
  if (availableIndices.length === 0) {
    const fallbackIndex = Math.floor(Math.random() * WORD_PAIRS.length);
    return { wordPair: WORD_PAIRS[fallbackIndex], index: fallbackIndex };
  }

  // 4. Pick a random index from the AVAILABLE pool
  const randomIndex = Math.floor(Math.random() * availableIndices.length);
  const selectedIndex = availableIndices[randomIndex];

  return { 
    wordPair: WORD_PAIRS[selectedIndex], 
    index: selectedIndex 
  };
};