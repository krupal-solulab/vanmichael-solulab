const fs=require('fs'), path=require('path');
const {JSDOM}=require('/home/claude/node_modules/jsdom');
let p=0,f=0; const ok=(n,c,d='')=>{(c?p++:f++);console.log((c?'  PASS  ':'  FAIL  ')+n+(d?'  ['+d+']':''));};
const read=f=>fs.readFileSync(path.join('out',f),'utf8');
const doc=f=>new JSDOM(read(f)).window.document;

const SLUGS=['buckhead','midtown','virginia-highland','sandy-springs','the-forum','avalon','east-cobb','van-michael-men','van-michael-aesthetics'];
const TRUTH={buckhead:[4.7,656,'30305','+14042374664'],midtown:[4.9,635,'30309','+14042668647'],
 'virginia-highland':[4.9,362,'30306','+14048746604'],'sandy-springs':[4.7,355,'30328','+14042550026'],
 'the-forum':[4.9,708,'30092','+16789873600'],avalon:[4.6,199,'30009','+16789873678'],
 'east-cobb':[4.6,225,'30062','+14045664247'],'van-michael-men':[4.8,241,'30339','+16789873654'],
 'van-michael-aesthetics':[4.9,56,'30328','+14044874900']};

console.log('\n=== STATIC OUTPUT ===');
ok('Build emitted an out/ directory', fs.existsSync('out'));
ok('All nine location pages generated', SLUGS.every(s=>fs.existsSync(`out/locations/${s}/index.html`)));
ok('Core pages generated', ['index.html','locations/index.html','services/index.html','visit/index.html','404.html'].every(f=>fs.existsSync('out/'+f)));
ok('sitemap.xml and robots.txt generated', fs.existsSync('out/sitemap.xml')&&fs.existsSync('out/robots.txt'));

console.log('\n=== PAGES RENDER SERVER-SIDE (no blank-page risk) ===');
{
  const home=doc('index.html');
  ok('Home has full prerendered content', home.body.textContent.trim().length>2500, home.body.textContent.trim().length+' chars');
  ok('Home shows the aggregate rating', /4\.8/.test(home.body.textContent) && /3,437/.test(home.body.textContent));
  const lp=doc('locations/index.html');
  ok('Locations page prerenders all nine cards', lp.querySelectorAll('article').length===9, lp.querySelectorAll('article').length+'');
  ok('Filter buttons prerendered', lp.querySelectorAll('[aria-pressed]').length===5);
}

console.log('\n=== PER-LOCATION PAGES: DATA + SEO ===');
{
  let bad=[];
  for(const s of SLUGS){
    const d=doc(`locations/${s}/index.html`);
    const t=d.body.textContent;
    const [rating,reviews,zip,tel]=TRUTH[s];
    if(!t.includes(String(rating))) bad.push(s+':rating');
    if(!t.includes(reviews.toLocaleString('en-US'))) bad.push(s+':reviews');
    if(!t.includes(zip)) bad.push(s+':zip');
    if(!d.querySelector(`a[href="tel:${tel.replace('+','\\+')}"]`) && !read(`locations/${s}/index.html`).includes(`tel:${tel}`)) bad.push(s+':tel');
    if(!d.querySelector('h1')) bad.push(s+':h1');
    if(!d.querySelector('link[rel=canonical]')) bad.push(s+':canonical');
    const title=d.title||'';
    if(title.length<20||title.length>72) bad.push(s+':title-length('+title.length+')');
    const lds=[...d.querySelectorAll('script[type="application/ld+json"]')];
    if(lds.length<3) bad.push(s+':jsonld-count');
    try{ lds.forEach(x=>JSON.parse(x.textContent)); }catch(e){ bad.push(s+':jsonld-invalid'); }
    const local=lds.map(x=>JSON.parse(x.textContent)).find(x=>/HairSalon|HealthAndBeauty/.test(x['@type']));
    if(!local||!local.geo||!local.openingHours) bad.push(s+':localbusiness');
    if(!local||local.aggregateRating.ratingValue!==rating) bad.push(s+':schema-rating');
  }
  ok('All nine pages correct on rating, reviews, postcode, phone, title, canonical and schema', bad.length===0, bad.join(' | ')||'all correct');
}

console.log('\n=== BOOKING + LINKS ===');
{
  const all=SLUGS.map(s=>read(`locations/${s}/index.html`)).concat([read('index.html'),read('services/index.html'),read('visit/index.html')]);
  ok('No placeholder links anywhere', !all.some(h=>/example\.com|lorem|\.example|555[\s-]?0\d{3}/i.test(h)));
  const d=doc('index.html');
  const books=[...d.querySelectorAll('a')].filter(a=>/zenoti\.com/.test(a.getAttribute('href')||''));
  ok('Home booking links all go to Zenoti', books.length>=4 && books.every(a=>/noopener/.test(a.getAttribute('rel')||'')), books.length+' links');
  ok('No internal QA or disclaimer text shipped',
      !all.some(h=>/review notes|unaffiliated|what launch requires|Template A/i.test(h)));
}

console.log('\n=== SITEMAP / ROBOTS ===');
{
  const sm=read('sitemap.xml');
  ok('Sitemap lists 13 URLs', (sm.match(/<url>/g)||[]).length===13, (sm.match(/<url>/g)||[]).length+'');
  ok('Sitemap includes every location', SLUGS.every(s=>sm.includes(`/locations/${s}/`)));
  ok('robots.txt allows crawling and points at sitemap', /Allow: \//.test(read('robots.txt')) && /sitemap\.xml/.test(read('robots.txt')));
}

console.log('\n=== ACCESSIBILITY ===');
{
  const d=doc('index.html');
  ok('Skip link present', !!d.querySelector('a[href="#main"]'));
  ok('Landmarks present', !!d.querySelector('header')&&!!d.querySelector('main#main')&&!!d.querySelector('footer')&&!!d.querySelector('nav[aria-label]'));
  ok('Single h1 per page', SLUGS.every(s=>doc(`locations/${s}/index.html`).querySelectorAll('h1').length===1) && d.querySelectorAll('h1').length===1);
  const imgs=[...d.querySelectorAll('img')];
  ok('All images have alt text', imgs.length>0 && imgs.every(i=>(i.getAttribute('alt')||'').length>8), imgs.length+' images');
  ok('Decorative stars hidden from assistive tech', [...d.querySelectorAll('[aria-hidden]')].length>0);
}

console.log('\n====================================');
console.log('   PASSED '+p+'    FAILED '+f);
console.log('====================================');
process.exit(f?1:0);
