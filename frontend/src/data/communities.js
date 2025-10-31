// communities.js - Sample community data for StudyHub
// This file contains 10 distinct communities with unique themes, purposes, and target audiences

const communities = [
  {
    name: "Code Crafters",
    description: "A community for programming enthusiasts to share knowledge, collaborate on projects, and improve coding skills. From beginners to experts, everyone is welcome to discuss algorithms, frameworks, and development practices.",
    tags: ["programming", "coding", "software development", "computer science"],
    coverImage: "/student-1.png",
    isPrivate: false,
    settings: {
      allowFileSharing: true,
      allowPolls: true,
      requireApproval: false,
      profanityFilter: true
    },
    guidelines: [
      "Share code snippets with proper explanations",
      "Be respectful when reviewing others' code",
      "Provide constructive feedback on projects",
      "Help beginners with patience and clear explanations",
      "Discuss the latest programming trends and technologies"
    ]
  },
  {
    name: "Math Masterminds",
    description: "Dedicated to mathematics enthusiasts at all levels. Discuss mathematical concepts, solve challenging problems, and explore the beauty of mathematics from algebra to calculus and beyond.",
    tags: ["mathematics", "calculus", "algebra", "statistics", "problem solving"],
    coverImage: "/student-2.png",
    isPrivate: false,
    settings: {
      allowFileSharing: true,
      allowPolls: true,
      requireApproval: false,
      profanityFilter: true
    },
    guidelines: [
      "Show your work when solving problems",
      "Use proper mathematical notation when possible",
      "Help explain concepts in simple terms",
      "Share interesting mathematical puzzles and challenges",
      "Respect different approaches to problem-solving"
    ]
  },
  {
    name: "Physics Phenomena",
    description: "Explore the fundamental laws of the universe with fellow physics enthusiasts. From classical mechanics to quantum physics, discuss theories, experiments, and the latest discoveries in the field.",
    tags: ["physics", "mechanics", "quantum", "relativity", "astrophysics"],
    coverImage: "/student-3.png",
    isPrivate: false,
    settings: {
      allowFileSharing: true,
      allowPolls: true,
      requireApproval: false,
      profanityFilter: true
    },
    guidelines: [
      "Back claims with scientific evidence or calculations",
      "Explain complex concepts with analogies when helpful",
      "Share interesting physics demonstrations and experiments",
      "Discuss both theoretical and applied physics",
      "Be open to different interpretations of quantum mechanics"
    ]
  },
  {
    name: "Literature Lovers",
    description: "A sanctuary for book enthusiasts, writers, and literary scholars. Discuss classic and contemporary literature, share writing tips, analyze literary works, and explore different genres and writing styles.",
    tags: ["literature", "books", "writing", "poetry", "fiction"],
    coverImage: "/student-4.png",
    isPrivate: false,
    settings: {
      allowFileSharing: true,
      allowPolls: true,
      requireApproval: false,
      profanityFilter: true
    },
    guidelines: [
      "Provide spoiler warnings when discussing plot details",
      "Respect diverse interpretations of literary works",
      "Give constructive feedback on shared writing",
      "Cite sources when quoting or referencing works",
      "Encourage exploration of diverse authors and perspectives"
    ]
  },
  {
    name: "Medical Minds",
    description: "A community for medical students, healthcare professionals, and those interested in medicine. Discuss medical concepts, share study resources, and stay updated on healthcare advancements and research.",
    tags: ["medicine", "healthcare", "anatomy", "physiology", "medical research"],
    coverImage: "/student-5.png",
    isPrivate: true,
    settings: {
      allowFileSharing: true,
      allowPolls: true,
      requireApproval: true,
      profanityFilter: true
    },
    guidelines: [
      "Do not share personal medical information",
      "Clarify when information is opinion vs. evidence-based",
      "Avoid giving specific medical advice",
      "Use proper medical terminology",
      "Respect patient confidentiality in case discussions"
    ]
  },
  {
    name: "History Horizons",
    description: "Journey through time with history enthusiasts. Explore different civilizations, significant events, historical figures, and the evolution of human society. Discuss interpretations and learn from the past.",
    tags: ["history", "civilization", "archaeology", "world wars", "ancient history"],
    coverImage: "/student-6.png",
    isPrivate: false,
    settings: {
      allowFileSharing: true,
      allowPolls: true,
      requireApproval: false,
      profanityFilter: true
    },
    guidelines: [
      "Cite historical sources when making claims",
      "Respect different cultural perspectives on historical events",
      "Avoid political debates unless directly relevant to historical discussion",
      "Consider historical context when analyzing past events",
      "Share primary sources and historical documents when available"
    ]
  },
  {
    name: "Business Builders",
    description: "Connect with entrepreneurs, business students, and professionals. Discuss business strategies, management principles, marketing techniques, and share insights on building successful ventures.",
    tags: ["business", "entrepreneurship", "marketing", "management", "finance"],
    coverImage: "/student-7.png",
    isPrivate: false,
    settings: {
      allowFileSharing: true,
      allowPolls: true,
      requireApproval: false,
      profanityFilter: true
    },
    guidelines: [
      "Share practical business insights and experiences",
      "Respect intellectual property and business confidentiality",
      "Provide constructive feedback on business ideas",
      "Back claims with data when discussing market trends",
      "Be mindful of cultural differences in business practices"
    ]
  },
  {
    name: "Language Learners",
    description: "A multilingual community for language enthusiasts. Practice languages, share learning resources, discuss linguistics, and connect with native speakers for authentic language exchange.",
    tags: ["languages", "linguistics", "translation", "grammar", "vocabulary"],
    coverImage: "/student-8.png",
    isPrivate: false,
    settings: {
      allowFileSharing: true,
      allowPolls: true,
      requireApproval: false,
      profanityFilter: true
    },
    guidelines: [
      "Be patient with learners at different proficiency levels",
      "Correct language errors respectfully",
      "Share effective language learning techniques",
      "Respect cultural contexts when discussing language use",
      "Use language tags when posting in non-English languages"
    ]
  },
  {
    name: "Art & Design Studio",
    description: "A creative space for artists, designers, and art enthusiasts. Share artwork, discuss techniques, explore different art movements, and receive feedback on creative projects.",
    tags: ["art", "design", "drawing", "painting", "digital art"],
    coverImage: "/student-9.png",
    isPrivate: false,
    settings: {
      allowFileSharing: true,
      allowPolls: true,
      requireApproval: false,
      profanityFilter: true
    },
    guidelines: [
      "Give constructive criticism when requested",
      "Respect copyright and give credit to original artists",
      "Share your creative process along with finished work",
      "Be supportive of artists at all skill levels",
      "Tag content appropriately (e.g., NSFW, violence)"
    ]
  },
  {
    name: "Environmental Explorers",
    description: "Dedicated to environmental science, conservation, and sustainability. Discuss climate change, biodiversity, renewable energy, and share ideas for environmental protection and sustainable living.",
    tags: ["environment", "sustainability", "climate", "conservation", "ecology"],
    coverImage: "/student-10.png",
    isPrivate: false,
    settings: {
      allowFileSharing: true,
      allowPolls: true,
      requireApproval: false,
      profanityFilter: true
    },
    guidelines: [
      "Base environmental discussions on scientific evidence",
      "Share practical sustainability tips and experiences",
      "Respect different approaches to environmental solutions",
      "Focus on constructive action rather than eco-anxiety",
      "Discuss both local and global environmental issues"
    ]
  }
];

export default communities;