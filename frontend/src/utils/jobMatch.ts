export function normalizeSkill(s: string) {
  const aliases: Record<string, string> = {
    // IT - Backend & Cloud
    'nodejs': 'node.js', 'node': 'node.js', 'expressjs': 'express', 'express.js': 'express',
    'js': 'javascript', 'ts': 'typescript', 'mongodb': 'mongo', 'postgresql': 'postgres',
    'mysql': 'sql', 'springboot': 'spring', 'django': 'python', 'laravel': 'php',
    'aws': 'cloud', 'azure': 'cloud', 'gcp': 'cloud', 'docker': 'devops', 'kubernetes': 'devops',
    'rest api': 'api', 'graphql': 'api', 'microservices': 'backend',
    
    // IT - Frontend & Mobile
    'reactjs': 'react', 'react.js': 'react', 'nextjs': 'next', 'vuejs': 'vue',
    'tailwindcss': 'tailwind', 'bootstrap': 'css', 'sass': 'css', 'scss': 'css',
    'react native': 'mobile', 'flutter': 'mobile', 'android': 'mobile', 'ios': 'mobile',
    'jquery': 'javascript', 'native': 'mobile',
    
    // Non-IT - Marketing & Sales
    'digital marketing': 'marketing', 'social media': 'marketing', 'seo': 'marketing', 'sem': 'marketing',
    'b2b sales': 'sales', 'business development': 'sales', 'telecalling': 'sales', 'field sales': 'sales',
    'crm': 'sales', 'lead generation': 'marketing', 'email marketing': 'marketing',
    
    // Non-IT - Finance, HR & Admin
    'accounting': 'finance', 'tally': 'finance', 'taxation': 'finance', 'banking': 'finance',
    'recruitment': 'hr', 'payroll': 'hr', 'talent acquisition': 'hr', 'admin': 'administration',
    'office assistant': 'administration', 'data entry': 'administration', 'excel': 'office',
    
    // Non-IT - Design & Content
    'graphic design': 'design', 'uiux': 'design', 'figma': 'design', 'photoshop': 'design',
    'content writing': 'content', 'copywriting': 'content', 'blogging': 'content',
    'video editing': 'media', 'premiere pro': 'media', 'after effects': 'media',
    
    // Non-IT - Engineering & Healthcare
    'mechanical': 'engineering', 'civil': 'engineering', 'electrical': 'engineering',
    'autocad': 'engineering', 'solidworks': 'engineering',
    'nursing': 'healthcare', 'doctor': 'healthcare', 'pharmacy': 'healthcare',
    
    // Soft Skills & General
    'communication skills': 'communication', 'team work': 'teamwork', 'leadership': 'leadership',
    'management': 'management', 'project management': 'management', 'problem solving': 'analytical',
    'critical thinking': 'analytical', 'time management': 'productivity',
  };
  const n = s.toLowerCase().trim().replace(/[^a-z0-9+#.]/g, '');
  return aliases[n] || n;
}

export function calcMatch(userSkills: string[], jobSkills: string[]) {
  if (!jobSkills.length || !userSkills.length) return 0;
  const uNorm = userSkills.map(normalizeSkill);
  const jNorm = jobSkills.map(normalizeSkill);
  let matched = 0;
  for (const js of jNorm) { if (uNorm.includes(js)) matched++; }
  return Math.round((matched / jNorm.length) * 100);
}

export function calculateAdvancedMatch(user: any, job: any) {
  if (!user) return 0;
  
  let score = 0;

  // 1. Title/Role Match (+30) - Very strong for Non-IT where skills might be broad
  if (user.title && job.title) {
    const uTitle = user.title.toLowerCase();
    const jTitle = job.title.toLowerCase();
    if (uTitle.includes(jTitle) || jTitle.includes(uTitle)) {
      score += 30;
    }
  }

  // 2. Skill Match (Base Score: 0-40)
  if (user.skills && user.skills.length > 0) {
    const skillScore = calcMatch(user.skills, job.skills || []);
    score += (skillScore / 100) * 40;
  }

  // 3. Location Match (+15)
  if (user.location && job.location && 
      job.location.toLowerCase().includes(user.location.toLowerCase())) {
    score += 15;
  }

  // 4. Category Preference (+20)
  if (user.preferredCategory && job.category && 
      (user.preferredCategory === job.category || user.preferredCategory === 'Both')) {
    score += 20;
  }

  // 5. Recency Bonus (+5 if last 7 days)
  if (job.createdAt && isWithinDays(job.createdAt, 7)) {
    score += 5;
  }

  return Math.min(Math.round(score), 100);
}

export function isWithinDays(postedAt: string, days: number) {
  const now = new Date();
  const posted = new Date(postedAt);
  const diff = (now.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24);
  return diff <= days;
}
