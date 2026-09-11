export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const e = escapeHTML;
function webLink(value) {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? e(url.href) : ''; } catch { return ''; }
}
export function validate(p) {
  if (!p || typeof p !== 'object' || Array.isArray(p)) throw new Error('Profile must be an object.');
  for (const key of ['name','tagline','intro','note','contactText','email','github','website','accent']) {
    if (typeof p[key] !== 'string' || p[key].length > 5000) throw new Error(`Invalid ${key}.`);
  }
  if (!p.name.trim()) throw new Error('Please enter a name.');
  for (const [key, fields] of Object.entries({education:['period','institution','degree','detail'],research:['title','description'],skills:['category','items']})) {
    if (!Array.isArray(p[key]) || p[key].length > 20) throw new Error(`Invalid ${key}.`);
    for (const item of p[key]) for (const field of fields) if (!item || typeof item[field] !== 'string' || item[field].length > 5000) throw new Error(`Invalid ${key} ${field}.`);
  }
  for (const key of ['github','website']) if (p[key] && !webLink(p[key])) throw new Error(`${key} must be an http or https URL.`);
  if (p.email && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(p.email)) throw new Error('Enter a valid email address or leave it blank.');
  if (!['violet','blue','forest','ink'].includes(p.accent)) throw new Error('Invalid accent.');
  return p;
}
export function render(p) {
  validate(p);
  const email = p.email ? `<a href="mailto:${e(encodeURIComponent(p.email))}"><span>Email</span><span>${e(p.email)} <b aria-hidden="true">↗</b></span></a>` : '';
  const github = p.github ? `<a href="${webLink(p.github)}"><span>GitHub</span><span>${e(new URL(p.github).pathname.replace(/^\//,'')) || 'View profile'} <b aria-hidden="true">↗</b></span></a>` : '';
  const website = p.website ? `<a href="${webLink(p.website)}"><span>Website</span><span>${e(new URL(p.website).hostname)} <b aria-hidden="true">↗</b></span></a>` : '';
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="${e(p.intro || p.tagline)}"><meta name="color-scheme" content="light"><title>${e(p.name)} · kuzu-shushu</title><link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%235747c6'/%3E%3Ctext x='32' y='44' font-size='40' text-anchor='middle' fill='white'%3E鼠%3C/text%3E%3C/svg%3E"><link rel="stylesheet" href="./style.css"></head>
<body data-accent="${e(p.accent)}"><a class="skip-link" href="#main">Skip to content</a>
<div class="page"><header class="header"><a class="brand" href="#" aria-label="kuzu-shushu home"><span class="mark" lang="zh">鼠</span><span>kuzu-shushu<span class="brand-dot">.</span></span></a><nav aria-label="Main navigation"><a href="#research">Research</a><a href="#contact">Contact <span aria-hidden="true">↗</span></a></nav></header>
<main id="main"><section class="hero" aria-labelledby="profile-name"><div class="eyebrow">A LITTLE ABOUT ME</div><h1 id="profile-name" lang="zh">${e(p.name)}</h1><p class="tagline">${e(p.tagline)}</p><div class="hero-bottom"><p class="intro">${e(p.intro)}</p>${p.note ? `<p class="draft-note">${e(p.note)}</p>` : ''}</div></section>
<div class="columns"><div class="primary"><section id="research" class="section"><h2><span class="index">01</span>Research interests</h2><div class="research-list">${p.research.map((r,i)=>`<article class="research-item"><span class="research-number" aria-hidden="true">${String(i+1).padStart(2,'0')}</span><div><h3>${e(r.title)}</h3><p>${e(r.description)}</p></div></article>`).join('')}</div></section>
<section id="education" class="section"><h2><span class="index">02</span>Education</h2><div class="education-list">${p.education.map(r=>`<article class="education-item"><p class="period">${e(r.period)}</p><h3>${e(r.institution)}</h3><p class="degree">${e(r.degree)}</p><p>${e(r.detail)}</p></article>`).join('')}</div></section></div>
<aside class="secondary"><section id="skills" class="section"><h2><span class="index">03</span>Skills & tools</h2>${p.skills.map(r=>`<div class="skill-group"><h3>${e(r.category)}</h3><ul class="skills">${r.items.split(',').map(s=>s.trim()).filter(Boolean).map(s=>`<li>${e(s)}</li>`).join('')}</ul></div>`).join('')}</section>
<section id="contact" class="section contact"><h2><span class="index">04</span>Let’s connect</h2><p>${e(p.contactText)}</p><div class="contact-links">${email}${github}${website}</div></section></aside></div></main>
<footer><span>© ${new Date().getFullYear()} ${e(p.name)}</span><span>Stay curious<span class="brand-dot">.</span></span></footer></div></body></html>`;
}
