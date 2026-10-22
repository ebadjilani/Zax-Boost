// Static page generator: node build.js  -> writes index.html + inner pages (plain HTML, no runtime deps)
const fs = require('fs'), path = require('path');
const NAV = [['Home', ''], ['Our Story', 'about/'], ['Product', 'product/'], ['Contact', 'contact/']];

function layout({ dir, title, desc, body, key, ogImg, preload }) {
  const up = dir ? '../' : '';
  const link = h => `${up}${h || (dir ? '' : './')}`;
  const nav = NAV.map(([l, h]) => `<a href="${link(h)}"${key === h ? ' aria-current="page"' : ''}>${l}</a>`).join('\n      ');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta property="og:title" content="${title}"><meta property="og:description" content="${desc}"><meta property="og:type" content="website">
<meta property="og:image" content="${up}assets/images/${ogImg || 'hero-splash-1.png'}">
<meta name="theme-color" content="#050505">
<link rel="icon" href="${up}assets/images/logo.png">
${preload ? `<link rel="preload" as="image" href="${up}assets/images/${preload}" fetchpriority="high">` : ''}
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${up}assets/css/style.css">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap">
    <a class="logo" href="${up || './'}" aria-label="ZAX BOOST home"><img src="${up}assets/images/logo.png" alt="ZAX BOOST" width="755" height="331"></a>
    <button class="menu-btn" aria-expanded="false" aria-controls="nav" aria-label="Open menu"><span></span></button>
    <nav class="nav" id="nav" aria-label="Main">
      ${nav}
      <a class="btn" href="${up}distributor/"${key === 'distributor/' ? ' aria-current="page"' : ''}>Become a Distributor</a>
    </nav>
  </div>
</header>
<main id="main">
${body(up)}
</main>
<footer class="site-footer">
  <div class="wrap">
    <div class="foot-grid">
      <div><img src="${up}assets/images/logo.png" alt="ZAX BOOST" width="755" height="331" loading="lazy"><p>Made in Pakistan.</p></div>
      <div><h3>Explore</h3><ul>${NAV.map(([l, h]) => `<li><a href="${link(h)}">${l}</a></li>`).join('')}</ul></div>
      <div><h3>Join Us</h3><ul><li><a href="${up}distributor/">Become a Distributor</a></li><li><a href="https://www.instagram.com/zaxboost/" target="_blank" rel="noopener">Instagram</a></li></ul></div>
      <div><h3>Contact</h3><ul><li><a href="mailto:info@zaxboost.com">info@zaxboost.com</a></li><li><a href="tel:03069290007">0306 929 0007</a></li><li>Z486, BYJ CHS, Karachi, Pakistan</li></ul></div>
    </div>
    <div class="foot-mark" aria-hidden="true" data-speed="-.03">ZAX BOOST</div>
  </div>
  <div class="foot-bottom"><div class="wrap" style="display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap"><span>© 2026 ZAXBOOST. All rights reserved.</span><span>Made in Pakistan</span></div></div>
</footer>
<script src="${up}assets/js/main.js" defer></script>
</body>
</html>`;
}

// ---------- reusable pieces ----------
const bolt = (style, speed = '.08') => `<svg class="bolt" viewBox="0 0 100 160" style="${style}" data-speed="${speed}" aria-hidden="true"><path d="M62 0 8 92h36L28 160 94 58H57z"/></svg>`;
const lazyVid = (src, poster, cls = 'bgvid') => `<video class="${cls}" muted loop playsinline preload="none" poster="assets/images/${poster}" data-src="assets/videos/${src}" aria-hidden="true" tabindex="-1"></video>`;
const pv = (up, src, poster) => lazyVid(src, poster).replace(/assets\//g, `${up}assets/`);
const ribbons = `<div class="ribbons" aria-hidden="true">
  <div class="ribbon a"><div class="ribbon-track">${'<span>Boost</span><span>⚡</span><span>Charge</span><span>⚡</span><span>Repeat</span><span>⚡</span>'.repeat(8)}</div></div>
  <div class="ribbon b"><div class="ribbon-track">${'<span>Too cool</span><span class="fill">⚡</span><span>Too Zaxy</span><span class="fill">⚡</span>'.repeat(8)}</div></div>
</div>`;
const ingredients = [
  ['Ginseng', 'Sharpen your focus with high-potency root extracts.'],
  ['Taurine', 'Aims to support physical output and muscle endurance.'],
  ['Caffeine', 'Fast stimulation for alertness.'],
  ['Vitamins', 'Steady energy without a crash.']
];
const ctaBand = (up, h = 'Ready to get <span class="metal">Zaxy?</span>') => `
<section class="section cta-band"><div class="bg-word" aria-hidden="true" data-speed=".05">ZAXY</div>${bolt('left:6%;top:12%;width:90px;opacity:.5', '.1')}${bolt('right:8%;bottom:10%;width:120px;opacity:.35;transform:scaleX(-1)', '-.06')}
<div class="wrap"><h2 data-split>${h}</h2><div class="btn-row reveal d1"><a class="btn" href="${up}distributor/">Become a Distributor</a><a class="btn ghost" href="${up}product/">Explore the Product</a></div></div></section>`;
const pageHero = (up, eyebrow, h, lead, word, vid = 'video-c.mp4', poster = 'product-pedestal.png') => `<section class="page-hero">${pv(up, vid, poster)}<div class="bg-word" aria-hidden="true" data-speed=".06">${word}</div>${bolt('right:12%;top:16%;width:70px;opacity:.55', '.12')}
<div class="wrap"><div class="eyebrow">${eyebrow}</div><h1 data-split data-now>${h}</h1><p class="lead reveal d2">${lead}</p></div></section>`;
const ingrCards = `<div class="ingr-grid">${ingredients.map(([n, t], i) => `<article class="ingr-card reveal d${Math.min(i, 3)}"><span class="num" aria-hidden="true">0${i + 1}</span><svg class="ib" viewBox="0 0 100 160" aria-hidden="true"><path d="M62 0 8 92h36L28 160 94 58H57z"/></svg><h3>${n}</h3><p>${t}</p></article>`).join('')}</div>`;
// Campaign slider. Each slide is a distinct concept. type: 'frame' = framed product image over its own soft backdrop; 'wide' = full-bleed.
// Optional slots: if you drop one of these files into assets/images/ and rebuild, the slide appears automatically.
const OPTIONAL = {
  'lifestyle-person.jpg': { type: 'wide', dir: 'right', eyebrow: 'After dark', title: 'Own the night.', text: 'A person, a can, the city.', alt: 'A person holding a ZAX BOOST can in an urban night setting', pos: '60% 50%', posm: '60% 50%' },
  'studio-reflective.jpg': { type: 'frame', dir: 'up', eyebrow: 'Studio', title: 'Black on black.', text: 'One can. One light.', alt: 'A single ZAX BOOST can on a black reflective surface under a golden spotlight' },
  'two-cans-depth.jpg': { type: 'frame', dir: 'left', eyebrow: 'Depth', title: 'Front and back.', text: 'Two cans, two angles.', alt: 'Two ZAX BOOST cans at different angles, one in the foreground and one behind' }
};
const optionalSlides = () => Object.keys(OPTIONAL).filter(f => fs.existsSync(path.join(__dirname, 'assets/images', f))).map(f => Object.assign({ file: f }, OPTIONAL[f]));
const slider = (up, id, slides, label) => {
  const all = slides.concat(optionalSlides());
  const iv = 6500;
  return '<div class="slider" data-slider data-interval="' + iv + '" role="region" aria-roledescription="carousel" aria-label="' + label + '" tabindex="0">' +
    '<div class="slides">' + all.map((s, i) => '<article class="slide fx-' + s.type + '" data-dir="' + s.dir + '" role="group" aria-roledescription="slide" aria-label="' + (i + 1) + ' of ' + all.length + '"' + (i ? '' : ' data-first') + '>' +
      '<div class="slide-bg"><img src="' + up + 'assets/images/' + s.file + '" alt="" loading="lazy"' + (s.pos ? ' style="--pos:' + s.pos + (s.posm ? ';--posm:' + s.posm : '') + '"' : '') + ' draggable="false"></div>' +
      '<div class="slide-copy"><div class="eyebrow">' + s.eyebrow + '</div><h3>' + s.title + '</h3><p>' + s.text + '</p></div>' +
      (s.type === 'frame' ? '<div class="slide-fg"><div class="plx"><img src="' + up + 'assets/images/' + s.file + '" alt="' + s.alt + '" loading="lazy" draggable="false"></div></div>' : '<span class="visually-hidden">' + s.alt + '</span>') +
      '</article>').join('') + '</div>' +
    '<div class="slider-ui"><div class="slider-count" aria-live="off"><b data-cur>01</b><span>/ ' + String(all.length).padStart(2, '0') + '</span></div>' +
    '<div class="slider-bars" role="tablist" aria-label="Choose slide">' + all.map((s, i) => '<button type="button" role="tab" class="bar" aria-label="Slide ' + (i + 1) + ': ' + s.title + '"><i></i></button>').join('') + '</div>' +
    '<div class="slider-ctrl"><button type="button" data-slide="prev" aria-label="Previous slide">←</button><button type="button" data-slide="next" aria-label="Next slide">→</button></div></div></div>';
};
const HOME_SLIDES = [
  { file: 'product-on-ice.png', type: 'frame', dir: 'left', eyebrow: 'Ice cold', title: 'Chilled.', text: 'Best served cold. The can looks as sharp in the ice as it does in your hand.', alt: 'A ZAX BOOST can resting on ice' },
  { file: 'product-pedestal.png', type: 'frame', dir: 'up', eyebrow: 'Studio', title: 'Stripped back.', text: 'Black, gold and nothing else. One can on stone, one beam of light.', alt: 'A ZAX BOOST can on a black stone pedestal with a ring of golden light' },
  { file: 'ice-splash-action.png', type: 'frame', dir: 'right', eyebrow: 'In motion', title: 'Cold, loud, fast.', text: 'Ice, liquid and a can caught mid-air.', alt: 'A ZAX BOOST can mid-air with ice cubes and a golden splash' },
  { file: 'double-can-splash.png', type: 'frame', dir: 'left', eyebrow: 'Together', title: 'Double up.', text: 'Two cans, one idea: boost, charge, repeat.', alt: 'Two ZAX BOOST cans at angles in a golden liquid splash' },
  { file: 'home-section-2.png', type: 'frame', dir: 'up', eyebrow: 'Made to be noticed', title: 'Fresh pour.', text: 'A cold can, a gold bolt, condensation catching the light.', alt: 'A ZAX BOOST can with golden liquid running down its sides' }
];
const PRODUCT_SLIDES = [
  { file: 'macro-can-detail.png', type: 'frame', dir: 'right', eyebrow: 'Close-up', title: 'The detail.', text: 'Brushed aluminium, a pull tab, cold condensation.', alt: 'Macro close-up of a ZAX BOOST can lid and condensation' },
  { file: 'hands-toasting.png', type: 'frame', dir: 'left', eyebrow: 'Together', title: 'Make it a moment.', text: 'Cans up. Cheers.', alt: 'Two hands toasting ZAX BOOST cans' },
  { file: 'splash-ad-2.png', type: 'wide', dir: 'up', eyebrow: 'On the label', title: 'Boost. Charge. Repeat.', text: 'Stimulant drink, 250 ml.', alt: 'A ZAX BOOST can tilted in a golden splash on black rock', pos: '72% 50%', posm: '78% 50%' }
];
const stage = up => `<div class="sc-visual reveal rv-scale" data-tilt>
  <div class="sc-border"><div class="sc-frame"><img src="${up}assets/images/can-renders.jpg" alt="Two ZAX BOOST cans bursting through golden liquid on black" width="1080" height="1080" loading="lazy"><span class="sc-sweep" aria-hidden="true"></span></div></div>
  <div class="sc-tag t1"><b>250 ml</b><small>Net volume</small></div>
  <div class="sc-tag t2"><b>Stimulant drink</b><small>On the can</small></div>
  <div class="sc-tag t3"><b>Ginseng · Taurine · Caffeine · Vitamins</b></div>
  <svg class="ring-text" viewBox="0 0 120 120" aria-hidden="true"><defs><path id="rp" d="M60 60m-46 0a46 46 0 1 1 92 0a46 46 0 1 1-92 0"/></defs><text><textPath href="#rp" textLength="286" lengthAdjust="spacing">Boost · Charge · Repeat · Zaxy ·</textPath></text></svg>
</div>`;

// Floating can for the home "Power your moment" section.
// Drop a transparent PNG at assets/images/can-transparent.png and rebuild to use it; until then the black-backed render is screen-blended so its black vanishes.
const floatCan = up => {
  const real = fs.existsSync(path.join(__dirname, 'assets/images/can-transparent.png'));
  const src = real ? 'can-transparent.png' : 'can-renders.jpg';
  return '<div class="can-hero"><div class="can-glow" aria-hidden="true"></div><div class="can-floor" aria-hidden="true"></div>' +
    '<img class="can-img' + (real ? '' : ' is-blend') + '" src="' + up + 'assets/images/' + src + '" alt="ZAX BOOST stimulant drink cans, black and gold" width="1080" height="1080" loading="lazy"></div>';
};

const pages = [];

// ---------- HOME ----------
pages.push({
  dir: '', key: '', title: 'ZAX BOOST | Ignite Your Infinite Potential',
  desc: 'ZAX BOOST stimulant drink — ginseng, taurine, caffeine and vitamins. Too cool. Too Zaxy. Made in Pakistan.',
  body: up => `
<section class="hero" id="top">
  <div class="hero-bg" aria-hidden="true"><i class="hb-glow"></i><i class="hb-lines"></i><i class="hb-geo"></i><i class="hb-vignette"></i></div>
  <div class="hero-word" aria-hidden="true" data-speed=".1">ZAX</div>
  <div class="wrap"><div class="hero-copy">
    <div class="eyebrow">Stimulant Drink · 250 ml</div>
    <h1 data-split data-now>Too cool.<br><em class="shine" style="font-style:normal">Too Zaxy.</em></h1>
    <p class="lead">Ignite your infinite potential. Meet ZAX BOOST.</p>
    <div class="btn-row"><a class="btn" href="product/">Discover ZAX BOOST</a><a class="btn ghost" href="about/">Our Story</a></div>
  </div></div>
  <div class="scroll-cue"><i></i>Scroll</div>
</section>
${ribbons}

<section class="section manifesto">
  <div class="bg-word" aria-hidden="true" style="right:-6vw;top:12%;font-size:clamp(12rem,32vw,30rem)" data-speed=".08">BOLD</div>
  <div class="glow" style="left:-15%;top:10%" aria-hidden="true"></div>
  ${bolt('right:10%;top:22%;width:clamp(60px,9vw,130px);opacity:.8', '-.1')}
  <div class="wrap">
    <div class="eyebrow">The attitude</div>
    <h2 data-split>Not made<br>to <span class="outline">blend</span> <em class="shine" style="font-style:normal">in.</em></h2>
    <div class="cols">
      <p class="big" data-fill>ZAX BOOST is a stimulant drink built around four things printed on the can: ginseng, taurine, caffeine and vitamins. Black and gold. Cold. Loud on the shelf.</p>
      <ul class="chips reveal rv-right">
        <li><b>250 ml</b><small>Net volume</small></li>
        <li><b>Stimulant drink</b><small>As printed on the can</small></li>
        <li><b>Made in Pakistan</b><small>Karachi</small></li>
      </ul>
    </div>
  </div>
</section>

<section class="section showcase cut-both">
  <div class="bg-word" aria-hidden="true" data-speed=".07">BOOST</div>
  <div class="wrap showcase-grid">
    <div>
      <div class="eyebrow">Signature product</div>
      <h2 data-split>Power<br>your <span class="metal">moment.</span></h2>
      <p class="reveal d1" style="margin-top:26px;max-width:30em;font-size:1.1rem">One can. 250 ml. Black and gold packaging with the lightning bolt front and centre, ready to go.</p>
      <div class="btn-row reveal d2"><a class="btn" href="product/">See the product</a><a class="btn ghost" href="#ingredients">What's inside</a></div>
    </div>
    ${floatCan('')}
  </div>
</section>

<section class="cine">
  ${lazyVid('video-b.mp4', 'macro-can-detail.png')}
  <div class="wrap"><div style="max-width:760px"><div class="eyebrow">Every detail</div>
    <h2 data-split>Every detail.<br><span class="shine">Every drop.</span></h2>
    <p class="reveal d2" style="margin-top:20px;max-width:28em;font-size:1.1rem;color:#ddd">Brushed metal, cold condensation, a lightning bolt you can't miss.</p></div></div>
  <span class="tag">ZAX BOOST — film</span>
</section>

<section class="section campaign"><div class="wrap"><div class="eyebrow">The campaign</div><h2 data-split>Five looks.<br><span class="gold">One can.</span></h2></div>
  ${slider('', 'home', HOME_SLIDES, 'ZAX BOOST campaign')}
</section>

<section class="section ingredients cut-both" id="ingredients" style="margin-block:calc(var(--cut) * -.5)">
  ${lazyVid('video-c.mp4', 'ice-splash-action.png')}
  <div class="wrap">
    <div class="ingr-head">
      <div><div class="eyebrow">Zaxy inside</div><h2 data-split>Four things.<br><span class="metal">One can.</span></h2></div>
      <p class="reveal d1">The four ingredients printed on every can. Quantities and nutritional values haven't been published, so we only show what's on the label.</p>
    </div>
    ${ingrCards}
  </div>
</section>

<section class="moment">
  <div class="moment-bg" aria-hidden="true"><i class="mb-edge"></i><i class="mb-core"></i><i class="mb-line"></i></div>
  <div class="wrap">
    <div class="eyebrow">Together</div>
    <h2 data-split>Make it<br>a <span class="outline">moment.</span></h2>
    <p class="reveal d2" style="max-width:26em;font-size:1.15rem;color:#ddd;margin-top:22px">Cold cans. Good company. Cheers.</p>
  </div>
</section>

<section class="section panel-gold cut-top" style="margin-top:calc(var(--cut) * -1);padding-top:calc(var(--cut) + clamp(60px,9vw,130px))">
  <div class="bg-word" aria-hidden="true" data-speed=".05">PK</div>
  <div class="wrap split">
    <div>
      <div class="eyebrow">Born here</div>
      <h2 data-split>Born here.<br>Built to go further.</h2>
      <p class="reveal d1" style="margin-top:24px;max-width:32em;font-size:1.15rem">ZAX BOOST is made in Pakistan and is looking for operational partners across the country. If you have the capacity, we want to hear from you.</p>
      <div class="btn-row reveal d2"><a class="btn dark" href="distributor/">Become a Distributor</a></div>
    </div>
    <div class="frame reveal rv-scale" style="aspect-ratio:424/498"><img src="assets/images/macro-can-detail.png" alt="Close-up of a cold ZAX BOOST can lid with condensation" loading="lazy" width="424" height="498"></div>
  </div>
</section>
${ctaBand('')}`
});

// ---------- ABOUT ----------
pages.push({
  dir: 'about', key: 'about/', title: 'Our Story | ZAX BOOST', ogImg: 'splash-ad-2.png',
  desc: 'The story behind ZAX BOOST — a black-and-gold stimulant drink made in Pakistan.',
  body: up => `
${pageHero(up, 'Our Story', 'Ignite your<br><span class="shine" style="font-style:normal">infinite potential.</span>', 'ZAX BOOST is a stimulant drink made in Karachi, Pakistan — designed to look and feel as bold as the people who drink it.', 'STORY')}
<section class="section"><div class="wrap split">
  <div><div class="eyebrow">The brand</div><h2 data-split>Too cool.<br>Too Zaxy.</h2></div>
  <div><p class="reveal" style="font-size:1.25rem;color:#ddd">ZAX BOOST is built on a simple idea: boost, charge, repeat. Ginseng, taurine, caffeine and vitamins in a black-and-gold can made to stand out.</p>
  <p class="reveal d1">The brand is based in Karachi and is actively building its distribution network across Pakistan. Distributor enquiries are open through the application page.</p>
  <div class="btn-row reveal d2"><a class="btn" href="${up}distributor/">Become a Distributor</a></div></div>
</div></section>
<section class="cine" style="min-height:90vh">${pv(up, 'video-b.mp4', 'macro-can-detail.png')}<div class="wrap"><div class="eyebrow">Our promise to the can</div><h2 data-split>Boost.<br><span class="shine">Charge. Repeat.</span></h2></div></section>
<section class="section"><div class="wrap split">
  <div class="frame clip clip-x" style="aspect-ratio:4/5;max-width:440px;margin-inline:auto"><img data-speed="-.04" style="--sc:1.12" src="${up}assets/images/hands-toasting.png" alt="Hands toasting two ZAX BOOST cans" loading="lazy"></div>
  <div><div class="eyebrow">Origin</div><h2 data-split>Made in<br><span class="gold">Pakistan.</span></h2><p class="reveal d1" style="margin-top:20px;font-size:1.1rem">Z486, BYJ CHS, Karachi.</p><div class="rule" style="margin-top:30px"></div></div>
</div></section>
${ctaBand(up)}`
});

// ---------- PRODUCT ----------
pages.push({
  dir: 'product', key: 'product/', title: 'The Product | ZAX BOOST', ogImg: 'can-renders.jpg',
  desc: 'ZAX BOOST stimulant drink, 250 ml. Ginseng, taurine, caffeine and vitamins.',
  body: up => `
${pageHero(up, 'Signature product', 'ZAX <span class="shine" style="font-style:normal">BOOST</span>', 'Stimulant drink. 250 ml. Black and gold, built to be noticed.', 'CAN', 'video-b.mp4', 'macro-can-detail.png')}
<section class="section showcase"><div class="bg-word" aria-hidden="true" data-speed=".07">250</div><div class="wrap showcase-grid">
  ${stage(up)}
  <div>
    <div class="eyebrow">On the can</div>
    <h2 data-split>Stimulant<br>drink.</h2>
    <div class="facts reveal d1" style="grid-template-columns:1fr 1fr"><div><b>250 ml</b><small>Net volume</small></div><div><b>Stimulant</b><small>Drink</small></div><div style="grid-column:1/-1"><b>Ginseng · Taurine · Caffeine · Vitamins</b><small>As printed on the can</small></div></div>
    <p class="reveal d2" style="margin-top:24px;font-size:.9rem">Detailed nutritional information and ingredient quantities have not been published; we only show what's on the packaging.</p>
  </div>
</div></section>
<section class="section campaign"><div class="wrap"><div class="eyebrow">Gallery</div><h2 data-split>The can,<br>every angle.</h2></div>
  ${slider(up, 'product', PRODUCT_SLIDES, 'ZAX BOOST product gallery')}
</section>
${ctaBand(up)}`
});

// ---------- DISTRIBUTOR ----------
const field = (label, name, type = 'text', req = true, extra = '') => `<div class="field"><label for="${name}">${label}${req ? ' <span class="req" aria-hidden="true">*</span>' : ''}</label><input id="${name}" name="${name}" type="${type}"${req ? ' required' : ''} ${extra}><div class="err" role="alert"></div></div>`;
pages.push({
  dir: 'distributor', key: 'distributor/', title: 'Distributor Application | ZAX BOOST', ogImg: 'double-can-splash.png',
  desc: 'Apply to become a ZAX BOOST distributor in Pakistan.',
  body: up => `
${pageHero(up, 'Distribution', 'The distributor<br><span class="shine" style="font-style:normal">application.</span>', 'We filter out casual inquiries. We are actively locking down operational strongholds in Pakistan. Prove your capacity.', 'APPLY')}
<section class="section"><div class="wrap" style="max-width:820px">
  <h2 style="font-size:clamp(1.8rem,4vw,2.8rem);margin-bottom:30px">Application information</h2>
  <form class="card" data-validate novalidate data-subject="ZAX BOOST distributor application">
    ${field('Full Name', 'name', 'text', true, 'autocomplete="name"')}
    ${field('Company / Agency Name', 'company', 'text', true, 'autocomplete="organization"')}
    ${field('WhatsApp Number', 'whatsapp', 'tel', true, 'autocomplete="tel" inputmode="tel"')}
    ${field('Email Address', 'email', 'email', false, 'autocomplete="email"')}
    <div class="field"><label for="city">Primary City of Operation <span class="req" aria-hidden="true">*</span></label>
      <select id="city" name="city" required><option value="">Select City...</option>${['Karachi', 'Lahore', 'Islamabad', 'Faisalabad', 'Rawalpindi', 'Peshawar', 'Multan', 'Other'].map(c => `<option>${c}</option>`).join('')}</select><div class="err" role="alert"></div></div>
    <div class="field"><label for="message">Message / Additional Details</label><textarea id="message" name="message"></textarea><div class="err" role="alert"></div></div>
    <button class="btn" type="submit">Apply for Distribution</button>
    <div class="form-status" role="status" aria-live="polite"></div>
  </form>
</div></section>`
});

// ---------- CONTACT ----------
const ICON = {"mail":"<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" aria-hidden=\"true\"><rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"1\"/><path d=\"m3 7 9 6 9-6\"/></svg>","phone":"<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" aria-hidden=\"true\"><path d=\"M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z\"/></svg>","pin":"<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" aria-hidden=\"true\"><path d=\"M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z\"/><circle cx=\"12\" cy=\"9.5\" r=\"2.5\"/></svg>","ig":"<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" aria-hidden=\"true\"><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"5\"/><circle cx=\"12\" cy=\"12\" r=\"4\"/><circle cx=\"17.5\" cy=\"6.5\" r=\".8\" fill=\"currentColor\"/></svg>"};
pages.push({
  dir: 'contact', key: 'contact/', title: 'Contact | ZAX BOOST', ogImg: 'hero-splash-1.png',
  desc: 'Contact ZAX BOOST — email, phone and address in Karachi, Pakistan.',
  body: up => `
<section class="c-hero">
  <div class="bg-word" aria-hidden="true" data-speed=".06">HELLO</div>
  <div class="wrap c-hero-grid">
    <div>
      <div class="eyebrow">Contact</div>
      <h1 data-split data-now>Let’s<br><span class="shine" style="font-style:normal">talk.</span></h1>
      <p class="lead reveal d2">Questions, partnerships or distribution — the ZAX BOOST team in Karachi would like to hear from you.</p>
      <div class="c-meta reveal d3"><span class="live"></span><span>Karachi, Pakistan</span><span class="sep"></span><span data-clock="Asia/Karachi">--:--</span><span>PKT</span></div>
    </div>
    <div class="radar reveal rv-scale" aria-hidden="true">
      <svg viewBox="0 0 400 400"><g fill="none" stroke="currentColor"><circle cx="200" cy="200" r="190" opacity=".25"/><circle cx="200" cy="200" r="140" opacity=".3"/><circle cx="200" cy="200" r="90" opacity=".4"/><circle cx="200" cy="200" r="40" opacity=".5"/><path d="M200 10v380M10 200h380" opacity=".18"/><ellipse cx="200" cy="200" rx="90" ry="190" opacity=".18"/><ellipse cx="200" cy="200" rx="190" ry="90" opacity=".18"/></g></svg>
      <div class="sweep"></div>
      <div class="pin"><i></i><b>Karachi</b></div>
      <img src="${up}assets/images/logo.png" alt="" class="r-logo" width="755" height="331">
    </div>
  </div>
</section>

<section class="section c-cards-sec">
  <div class="wrap">
    <div class="c-cards">
      <a class="c-card reveal" href="mailto:info@zaxboost.com"><span class="ic">${ICON.mail}</span><small>Email</small><b>info@zaxboost.com</b><i class="go">→</i></a>
      <a class="c-card reveal d1" href="tel:03069290007"><span class="ic">${ICON.phone}</span><small>Phone</small><b>0306 929 0007</b><i class="go">→</i></a>
      <div class="c-card reveal d2"><span class="ic">${ICON.pin}</span><small>Visit</small><b>Z486, BYJ CHS,<br>Karachi, Pakistan</b></div>
      <a class="c-card reveal d3" href="https://www.instagram.com/zaxboost/" target="_blank" rel="noopener"><span class="ic">${ICON.ig}</span><small>Instagram</small><b>@zaxboost</b><i class="go">↗</i></a>
    </div>
  </div>
</section>

<section class="section c-form-sec cut-both">
  <div class="wrap c-form-grid">
    <div class="c-side reveal rv-left">
      <img src="${up}assets/images/hands-toasting.png" alt="Hands toasting two ZAX BOOST cans" loading="lazy" width="394" height="518" data-speed="-.04">
      <div class="c-side-copy"><h2>Say<br><span class="metal">hello.</span></h2></div>
    </div>
    <div>
      <div class="eyebrow">Send a message</div>
      <h2 data-split style="font-size:clamp(2rem,4.5vw,3.6rem);margin-bottom:28px">Tell us what you need</h2>
      <form class="card" data-validate novalidate data-subject="ZAX BOOST enquiry">
        <div class="field-row">
          ${field('Your Name', 'name', 'text', true, 'autocomplete="name"')}
          ${field('Email Address', 'email', 'email', true, 'autocomplete="email"')}
        </div>
        <div class="field"><label for="topic">Topic</label><select id="topic" name="topic"><option>General enquiry</option><option>Distribution</option><option>Media / partnerships</option><option>Other</option></select><div class="err" role="alert"></div></div>
        <div class="field"><label for="message">Message <span class="req" aria-hidden="true">*</span></label><textarea id="message" name="message" required></textarea><div class="err" role="alert"></div></div>
        <button class="btn" type="submit">Send message</button>
        <div class="form-status" role="status" aria-live="polite"></div>
      </form>
      <p style="margin-top:18px;font-size:.9rem">Looking to distribute ZAX BOOST? <a class="gold" href="${up}distributor/">Apply here →</a></p>
    </div>
  </div>
</section>

<a class="ig-strip" href="https://www.instagram.com/zaxboost/" target="_blank" rel="noopener" aria-label="ZAX BOOST on Instagram">
  <div class="ribbon-track" aria-hidden="true">${'<span>@zaxboost</span><span class="fill">⚡</span><span>Follow the energy</span><span class="fill">⚡</span>'.repeat(8)}</div>
</a>`
});

for (const p of pages) {
  const out = path.join(__dirname, p.dir, 'index.html');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, layout(p));
  console.log('wrote', path.relative(__dirname, out));
}
