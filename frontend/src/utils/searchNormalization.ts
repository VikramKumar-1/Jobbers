export const searchAliases: Record<string, string[]> = {
  'php': ['laravel', 'codeigniter', 'symfony', 'wordpress', 'core php', 'cakephp'],
  'javascript': ['react', 'node', 'vue', 'angular', 'express', 'nextjs', 'typescript', 'js', 'frontend', 'backend', 'full stack'],
  'python': ['django', 'flask', 'fastapi', 'data science', 'machine learning', 'ai'],
  'java': ['spring', 'springboot', 'hibernate', 'android'],
  'full stack': ['mern', 'mean', 'lamp', 'frontend', 'backend', 'web developer'],
  'non it': ['marketing', 'sales', 'hr', 'finance', 'accounting', 'mechanical', 'civil', 'electrical', 'healthcare', 'teaching'],
  'frontend': ['react', 'html', 'css', 'javascript', 'ui/ux', 'tailwind', 'bootstrap'],
  'backend': ['node', 'express', 'python', 'django', 'php', 'laravel', 'java', 'springboot', 'sql', 'mongodb'],
};

export function normalizeSearchQuery(query: string): string {
  const q = query.toLowerCase().trim();
  
  // If exact match found in aliases values, return the key
  for (const [key, aliases] of Object.entries(searchAliases)) {
    if (aliases.includes(q)) return key;
  }
  
  // Partial match check
  for (const [key, aliases] of Object.entries(searchAliases)) {
    if (aliases.some(alias => q.includes(alias) || alias.includes(q))) return key;
  }

  return q;
}

export function getRelatedKeywords(query: string): string[] {
  const q = query.toLowerCase().trim();
  const related: string[] = [q];
  
  for (const [key, aliases] of Object.entries(searchAliases)) {
    if (q === key || aliases.includes(q) || q.includes(key)) {
      if (!related.includes(key)) related.push(key);
      aliases.forEach(a => { if (!related.includes(a)) related.push(a); });
    }
  }
  
  return related;
}
