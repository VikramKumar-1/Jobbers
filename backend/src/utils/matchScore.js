/**
 * Normalize a skill string for comparison.
 * "Node.js" === "node" === "nodejs" === "Node"
 * "React" === "react.js" === "ReactJS"
 */
const SKILL_ALIASES = {
  'nodejs': 'node.js',
  'node': 'node.js',
  'reactjs': 'react',
  'react.js': 'react',
  'expressjs': 'express',
  'express.js': 'express',
  'js': 'javascript',
  'ts': 'typescript',
  'mongo': 'mongodb',
  'postgres': 'postgresql',
  'py': 'python',
  'cpp': 'c++',
  'nextjs': 'next.js',
  'vuejs': 'vue',
  'vue.js': 'vue',
  'angularjs': 'angular',
  'aws': 'amazon web services',
  'gcp': 'google cloud',
  'ui/ux': 'ui design',
  'ux/ui': 'ux design',
  'ml': 'machine learning',
  'ai': 'artificial intelligence',
  'nlp': 'natural language processing',
  'k8s': 'kubernetes',
  'angular.js': 'angular',
  'tailwindcss': 'tailwindcss',
  'tailwind': 'tailwindcss',
  'tailwind css': 'tailwindcss',
  'amazon web services': 'aws',
  'google cloud platform': 'gcp',
  'google cloud': 'gcp',
};

function normalizeSkill(skill) {
  if (!skill) return '';
  // First try with spaces preserved (for multi-word aliases)
  const lower = skill.toLowerCase().trim();
  if (SKILL_ALIASES[lower]) return SKILL_ALIASES[lower];
  // Then try stripped version
  const stripped = lower.replace(/[^a-z0-9+#.]/g, '');
  return SKILL_ALIASES[stripped] || stripped;
}

/**
 * Calculate match score between user skills and job skills.
 * Returns 0-100.
 */
export function calculateMatchScore(userSkills = [], jobSkills = []) {
  if (!jobSkills.length || !userSkills.length) return 0;

  const normalizedUser = userSkills.map(normalizeSkill).filter(Boolean);
  const normalizedJob = jobSkills.map(normalizeSkill).filter(Boolean);

  if (!normalizedJob.length) return 0;

  let matched = 0;
  for (const js of normalizedJob) {
    if (normalizedUser.includes(js)) matched++;
  }

  return Math.round((matched / normalizedJob.length) * 100);
}

export function meetsAutoApplyThreshold(userSkills, jobSkills, threshold = 40) {
  return calculateMatchScore(userSkills, jobSkills) >= threshold;
}
