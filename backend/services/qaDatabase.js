import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let qaDatabase = null;

/**
 * Initialize in-memory QA database
 */
export async function initializeQADatabase() {
  try {
    console.log('Initializing QA database...');
    const qaPath = path.join(__dirname, '../../qa.json');
    const qaData = JSON.parse(fs.readFileSync(qaPath, 'utf-8'));
    
    qaDatabase = qaData.map((item, idx) => ({
      id: `qa-${idx}`,
      question: item.question,
      answer: item.answer,
      keywords: extractKeywords(item.question + ' ' + item.answer)
    }));
    
    console.log(`✓ QA database initialized with ${qaDatabase.length} entries`);
    return qaDatabase;
  } catch (error) {
    console.error('Error initializing QA database:', error);
    throw error;
  }
}

/**
 * Extract keywords from text for simple search
 */
function extractKeywords(text) {
  return text.toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2)
    .map(word => word.replace(/[^\w]/g, ''));
}

/**
 * Search QA database using simple text matching
 */
export async function searchQADatabase(query, topK = 1) {
  if (!qaDatabase) {
    await initializeQADatabase();
  }
  
  const queryKeywords = extractKeywords(query);
  const results = qaDatabase.map(item => ({
    ...item,
    score: calculateRelevance(queryKeywords, item.keywords, item.question, item.answer, query)
  }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(({ keywords, ...rest }) => rest);
  
  return results;
}

/**
 * Calculate relevance score
 */
function calculateRelevance(queryKeywords, itemKeywords, question, answer, originalQuery) {
  let score = 0;
  
  // Keyword matching
  const matchedKeywords = queryKeywords.filter(kw => itemKeywords.includes(kw));
  score += matchedKeywords.length * 10;
  
  // Question substring matching
  const lowerQuestion = question.toLowerCase();
  const lowerQuery = originalQuery.toLowerCase();
  if (lowerQuestion.includes(lowerQuery)) {
    score += 50;
  }
  
  // Answer keyword matching
  const answerKeywords = extractKeywords(answer);
  const answerMatches = queryKeywords.filter(kw => answerKeywords.includes(kw));
  score += answerMatches.length * 5;
  
  // Partial word matching
  queryKeywords.forEach(kw => {
    if (lowerQuestion.includes(kw) || lowerQuestion.includes(kw.slice(0, -1))) {
      score += 3;
    }
  });
  
  return score;
}

/**
 * Get database statistics
 */
export async function getQADatabaseStats() {
  if (!qaDatabase) {
    await initializeQADatabase();
  }
  
  return {
    totalEntries: qaDatabase.length,
    loaded: !!qaDatabase,
    timestamp: new Date().toISOString()
  };
}
