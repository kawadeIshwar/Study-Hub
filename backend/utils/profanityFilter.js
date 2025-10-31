// Profanity filter for chat moderation
const profanityList = [
  'fuck', 'shit', 'damn', 'bitch', 'asshole', 'bastard', 'crap', 'hell',
  'stupid', 'idiot', 'moron', 'dumb', 'retard', 'fag', 'gay', 'nigga',
  'whore', 'slut', 'cunt', 'piss', 'cock', 'dick', 'pussy', 'tits',
  'motherfucker', 'fucking', 'shitty', 'fucked', 'bullshit'
];

const replacements = {
  'fuck': 'f***',
  'shit': 's***',
  'damn': 'd***',
  'bitch': 'b****',
  'asshole': 'a******',
  'bastard': 'b******',
  'crap': 'c***',
  'hell': 'h***',
  'stupid': 's*****',
  'idiot': 'i****',
  'moron': 'm****',
  'dumb': 'd***',
  'retard': 'r*****',
  'fag': 'f**',
  'gay': 'g**',
  'nigga': 'n****',
  'whore': 'w****',
  'slut': 's***',
  'cunt': 'c***',
  'piss': 'p***',
  'cock': 'c***',
  'dick': 'd***',
  'pussy': 'p****',
  'tits': 't***',
  'motherfucker': 'm*********',
  'fucking': 'f******',
  'shitty': 's****',
  'fucked': 'f*****',
  'bullshit': 'b*******'
};

export function filterProfanity(text) {
  if (!text || typeof text !== 'string') return text;
  
  let filteredText = text.toLowerCase();
  let originalText = text;
  let hasProfanity = false;
  
  // Check for profanity
  for (const word of profanityList) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    if (regex.test(filteredText)) {
      hasProfanity = true;
      break;
    }
  }
  
  if (!hasProfanity) return { text: originalText, hasProfanity: false };
  
  // Replace profanity
  let result = originalText;
  for (const [badWord, replacement] of Object.entries(replacements)) {
    const regex = new RegExp(`\\b${badWord}\\b`, 'gi');
    result = result.replace(regex, replacement);
  }
  
  return { text: result, hasProfanity: true };
}

export function isProfane(text) {
  if (!text || typeof text !== 'string') return false;
  
  const lowerText = text.toLowerCase();
  
  for (const word of profanityList) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    if (regex.test(lowerText)) {
      return true;
    }
  }
  
  return false;
}

export function moderateMessage(message, userRole = 'member') {
  const { text, hasProfanity } = filterProfanity(message);
  
  // Auto-moderate for basic users
  if (hasProfanity && userRole === 'member') {
    return {
      text: text,
      moderated: true,
      reason: 'Profanity detected',
      action: 'filtered'
    };
  }
  
  // Allow but flag for moderators/admins
  if (hasProfanity && (userRole === 'moderator' || userRole === 'admin')) {
    return {
      text: text,
      moderated: false,
      flagged: true,
      reason: 'Profanity detected but allowed for moderator'
    };
  }
  
  return {
    text: text,
    moderated: false,
    flagged: false
  };
}