/* ================= teen edition: interactive labs ================= */
// each lab is a card over the island; a wrong answer counts as a mistake on the island's stars
async function lab(fn){
  busy = true; moveTarget = null; guide(null); $('#mission').hidden = true; hush();
  xpUI(0);
  brief = BRIEFS().get(fn) || null; voice('t7');
  await fn();
  try{ speechSynthesis.cancel(); }catch(e){}
  $('#panel').hidden = true; busy = false;
}
const labMiss = () => { if (mode === 'level') mistakes++; sfx.bad(); };
function labCard(step, title, task, body){
  const op = brief && OPS[brief[0]];
  const head = op ? `<div class="brief"><div class="bp">${pGirl({ ...op.av, mood:'happy' })}</div><div><small>📡 مهمة من فريق الأمن السيبراني</small><b>${op.n} <em>· ${op.r}</em></b><p>${brief[1]}</p></div></div>` : '';
  return panel(`<div class="card lab">${head}<p class="eyebrow">🛰️ ${step}</p><h2>${title}</h2><p class="ltask">${task}</p>${body}<div class="lfb" id="lfb" hidden></div><div class="row"><button class="btn go big" id="lnext" hidden>كمّلي ←</button></div></div>`);
}
function lfb(ok, html){ const f = $('#lfb'); f.hidden = false; f.className = 'lfb ' + (ok === null ? 'info' : ok ? 'good' : 'bad'); f.innerHTML = html; f.style.animation = 'none'; f.offsetWidth; f.style.animation = ''; }
const labNext = (label = 'كمّلي ←') => pending(res => { const b = $('#lnext'); b.textContent = label; b.hidden = false; b.onclick = () => { sfx.click(); res(); }; });
/* ---------- points, ranks, achievements, sound and read-aloud ---------- */
const RANKS = [[0, 'مبتدئة', '🌱'], [90, 'محللة أمن', '🔍'], [200, 'محققة رقمية', '🕵️‍♀️'], [330, 'خبيرة أمن سيبراني', '🛡️']];
const rankOf = xp => RANKS.filter(r => xp >= r[0]).pop();
const sfx2 = {
  up: () => [523, 659, 784, 1046].forEach((f, i) => sweep(f, f * 1.01, .16, .12, i * .1)),
  ach: () => [880, 1175, 1568].forEach((f, i) => sweep(f, f * 1.02, .14, .1, i * .08)),
  alarm: () => [740, 520, 740, 520].forEach((f, i) => sweep(f, f, .12, .06, i * .13)),
  scan: () => sweep(300, 2400, .35, .05),
};
function xpUI(gain){
  let el = document.getElementById('xp');
  if (!el){ el = document.createElement('div'); el.id = 'xp'; document.body.appendChild(el); setInterval(() => { el.hidden = mode === 'title'; }, 400); }
  const xp = S.xp || 0, r = rankOf(xp), next = RANKS[RANKS.indexOf(r) + 1];
  const pct = next ? (xp - r[0]) / (next[0] - r[0]) * 100 : 100;
  el.innerHTML = `<span class="xr">${r[2]} ${r[1]}</span><span class="xb"><i style="width:${pct}%"></i></span><span class="xn">⚡ ${AR(xp)}</span><span class="xt">⏱️ ${playTime()}</span>${gain ? `<em>+${AR(gain)}</em>` : ''}`;
  el.hidden = mode === 'title';
}
function xpAdd(n){
  const before = rankOf(S.xp || 0);
  S.xp = (S.xp || 0) + n; save(); xpUI(n);
  const after = rankOf(S.xp);
  if (after !== before){
    sfx2.up(); voice('t2', true);
    const d = document.createElement('div'); d.className = 'lvlup'; d.innerHTML = `<small>⬆️ ترقية!</small><b>${after[2]} ${after[1]}</b>`;
    document.body.appendChild(d); setTimeout(() => d.remove(), 2600);
  }
}
const ACH = {
  pw:['🔐', 'صانعة الحصون', 'بنت كلمة مرور قوية جداً'],
  phish:['🎣', 'صيّادة التصيّد', 'كشفت كل روابط التصيّد'],
  dark:['🪤', 'كاشفة الفخاخ', 'كشفت فخاخ التصميم'],
  perm:['🛡️', 'حامية الأذونات', 'ضبطت الأذونات بدون غلط'],
  bully:['🤝', 'درع الصديقات', 'رتبت خطوات التنمر صح'],
  print:['🔎', 'محققة البصمة', 'كشفت كل التسريبات'],
  news:['📰', 'مدققة الأخبار', 'تحققت قبل النشر'],
  cases:['🕵️‍♀️', 'محللة القضايا', 'صنّفت القضايا مثل الخبيرات'],
  green:['♻️', 'سفيرة الاستدامة', 'صنّفت كل التصرفات البيئية صح'],
};
function achieve(k){
  S.ach = S.ach || []; if (S.ach.includes(k)) return;
  S.ach.push(k); save(); sfx2.ach(); voice('t3', true); xpAdd(15);
  const [i, n, d] = ACH[k], t = document.createElement('div'); t.className = 'achtoast';
  t.innerHTML = `<i>${i}</i><div><small>🏅 إنجاز جديد</small><b>${n}</b><span>${d}</span></div>`;
  document.body.appendChild(t); setTimeout(() => t.classList.add('out'), 2800); setTimeout(() => t.remove(), 3300);
}
// the expert tip at the end of each lab, with an optional read-aloud for listeners
let arVoice = null;
const findVoice = () => { try{ arVoice = speechSynthesis.getVoices().find(v => /^ar/i.test(v.lang)) || null; }catch(e){} };
try{ findVoice(); speechSynthesis.onvoiceschanged = findVoice; }catch(e){}
function readAloud(text){
  try{ speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text.replace(/<[^>]+>/g, ' ').replace(/\([^)]*[A-Za-z][^)]*\)/g, '')); u.lang = arVoice ? arVoice.lang : 'ar-SA'; if (arVoice) u.voice = arVoice; u.rate = .95; speechSynthesis.speak(u); }catch(e){}
}
function tipBox(term, en, html){
  const box = document.createElement('div'); box.className = 'tip';
  box.innerHTML = `<div class="th"><span>📘 معلومة خبيرة</span><b>${term} <em dir="ltr">${en}</em></b>${arVoice ? '<button class="btn small" type="button">🔊 اسمعي</button>' : ''}</div><p>${html}</p>`;
  const b = box.querySelector('button'); if (b) b.onclick = () => { sfx.click(); readAloud(`${term}. ${html}`); };
  const f = document.getElementById('lfb'); f.after(box);
}
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/* ---------- 1a. password lab: how long would a guesser need? ---------- */
const COMMON_PW = ['123456','12345678','123456789','1234567890','password','password1','qwerty','qwerty123','111111','000000','123123','654321','666666','abc123','iloveyou','admin','welcome','monkey','dragon','football','princess','sunshine','1q2w3e4r','aaaaaa','superman','asdfgh','zxcvbn','11223344','987654321','pass123','letmein','hello123','love123','qwertyuiop','asdfghjkl'];
function pwBits(pw){
  if (!pw) return 0;
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/[0-9٠-٩]/.test(pw)) pool += 10;
  if (/[ء-ي]/.test(pw)) pool += 36;
  if (/[^a-zA-Z0-9٠-٩ء-ي]/.test(pw)) pool += 33;
  let bits = pw.length * Math.log2(Math.max(pool, 2));
  const low = pw.toLowerCase();
  // easy patterns: runs like abc/123, repeats like aaa, keyboard rows
  for (let i = 0; i + 2 < low.length; i++){
    const a = low.charCodeAt(i), b = low.charCodeAt(i + 1), c = low.charCodeAt(i + 2);
    if ((b - a === 1 && c - b === 1) || (a - b === 1 && b - c === 1) || (a === b && b === c)) bits -= 6;
  }
  for (const w of ['qwe', 'asd', 'zxc', 'pass', 'love', '2024', '2025', '2026']) if (low.includes(w)) bits -= 8;
  if (COMMON_PW.includes(low)) bits = Math.min(bits, 8);
  return Math.max(0, bits);
}
function crackTime(bits){
  const sec = Math.pow(2, bits) / 2 / 1e10; // ten billion guesses a second
  const u = [[60, 'ثانية'], [60, 'دقيقة'], [24, 'ساعة'], [365, 'يوم'], [100, 'سنة'], [1e9, 'قرن']];
  if (sec < 1) return 'أقل من ثانية!';
  let v = sec, k = 0;
  while (k < u.length - 1 && v >= u[k][0]){ v /= u[k][0]; k++; }
  if (k === u.length - 1 && v > 1e4) return 'أكثر من مليون سنة 🏰';
  return `${AR(Math.max(1, Math.round(v)))} ${u[k][1]}`;
}
const PW_LEVELS = [[28, 'ضعيفة جداً', '#ff3b5b'], [40, 'ضعيفة', '#ff8a3c'], [60, 'متوسطة', '#ffc93c'], [80, 'قوية', '#4fc38a'], [1e9, 'قوية جداً', '#1fb88a']];
function labPassword(){
  labCard('مختبر كلمة المرور', 'كم تاخذ وقت لين تنكسر؟', 'المخترق يجرّب ١٠ مليار كلمة بالثانية. ابني كلمة مرور توصل لـ "قوية جداً".',
    `<div class="pwwarn">⚠️ لا تكتبين كلمة مرورك الحقيقية هنا</div>
     <input id="pwin" class="pwin" dir="ltr" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="جرّبي هنا…">
     <div class="meter"><i id="pwbar"></i></div>
     <div class="pwstats"><span>الطول: <b id="pwlen">٠</b></span><span>القوة: <b id="pwlvl">—</b></span></div>
     <div class="pwtime">وقت التخمين: <b id="pwtime">—</b></div>
     <button class="btn small" id="pwhint">💡 تلميح</button>`);
  let done = false;
  $('#pwhint').onclick = () => { sfx.click(); lfb(null, 'الطول أهم من التعقيد! جربي <b>عبارة مرور</b> من ٤ كلمات عشوائية مع رقم، مثل <span dir="ltr">نخلة-قمر-سحاب-٧٣</span> (بس لا تستخدمين المثال نفسه).'); };
  return pending(res => {
    const inp = $('#pwin');
    inp.oninput = () => {
      if (performance.now() - (inp._t || 0) > 70){ sfx.click(); inp._t = performance.now(); } // a soft key tick
      const pw = inp.value, bits = pwBits(pw), lv = PW_LEVELS.find(l => bits < l[0]);
      $('#pwlen').textContent = AR([...pw].length);
      $('#pwlvl').textContent = pw ? lv[1] : '—'; $('#pwlvl').style.color = lv[2];
      $('#pwbar').style.width = Math.min(100, bits / 90 * 100) + '%'; $('#pwbar').style.background = lv[2];
      $('#pwtime').textContent = pw ? crackTime(bits) : '—';
      if (!done && bits >= 80 && [...pw].length >= 12){
        done = true; sfx.win(); inp.blur();
        lfb(true, '<b>✓ قوية جداً!</b> وحتى لو انسرقت، <b>التحقق بخطوتين</b> يقفل الباب الثاني 🔐 ولا تكررينها في أكثر من حساب.');
        xpAdd(30); achieve('pw');
        tipBox('هجوم القوة الغاشمة', '(Brute Force)', 'المخترق يجرب كل الاحتمالات بالكمبيوتر. كل حرف تزيدينه يضاعف عدد الاحتمالات أضعاف، عشان كذا الطول أقوى سلاح. واستخدمي <b>مدير كلمات مرور</b> (Password Manager) يحفظها لك.');
        labNext().then(res);
      }
    };
    setTimeout(() => inp.focus({ preventScroll:true }), 300);
  });
}

/* ---------- 1b. phishing: real or bait? ---------- */
const PHISH = [
  { kind:'url', https:true, show:'https://<b>manasati.edu.sa</b>/login', parts:[['https://', 'البروتوكول', 'p'], ['manasati.edu.sa', 'النطاق الحقيقي ✓', 'ok'], ['/login', 'المسار', 'p']], bad:false, why:'النطاق هو <b dir="ltr">manasati.edu.sa</b> ويبدأ بـ https. هذا الرابط الحقيقي ✓' },
  { kind:'url', https:true, show:'https://manasati.edu.sa.<b>login-verify.co</b>/auth', parts:[['https://', 'البروتوكول', 'p'], ['manasati.edu.sa.', 'تمويه', 'sub'], ['login-verify.co', 'النطاق الحقيقي ⚠️', 'bad'], ['/auth', 'المسار', 'p']], bad:true, why:'النطاق الحقيقي هو آخر جزء قبل "/": <b dir="ltr">login-verify.co</b>! كلمة "منصتي" بالبداية تمويه.' },
  { kind:'sms', from:'منصتي', text:'تم تحديث جدولك الدراسي. تقدرين تشوفينه من التطبيق الرسمي.', bad:false, why:'ما فيه رابط ولا طلب بيانات، ويوجّهك للتطبيق الرسمي ✓' },
  { kind:'url', https:false, show:'http://<b>rn</b>anasati.edu.sa', bad:true, why:'"<b dir="ltr">rn</b>" تشبه "<b dir="ltr">m</b>"! وما فيه https كمان.' },
  { kind:'sms', from:'+966 5x xxx xxxx', text:'عاجل! حسابك بينقفل خلال ساعة 😱 أرسلي رمز التحقق اللي وصلك عشان نثبّته.', bad:true, why:'الاستعجال + طلب رمز التحقق = تصيّد. <b>رمز التحقق ما ينعطى لأي أحد أبداً.</b>' },
];
async function labPhish(){
  let got = 0;
  for (let i = 0; i < PHISH.length; i++){
    const it = PHISH[i];
    const mock = it.kind === 'url'
      ? `<div class="mock url"><span>${it.https ? '🔒' : '⚠️'}</span><span dir="ltr">${it.show}</span></div>`
      : `<div class="mock sms"><b>💬 ${esc(it.from)}</b><p>${esc(it.text)}</p></div>`;
    labCard(`فحص الروابط ${AR(i + 1)} / ${AR(PHISH.length)}`, 'آمن ولا تصيّد؟', it.kind === 'url' ? 'وصلك هالرابط لتسجيل الدخول:' : 'وصلتك هالرسالة:',
      `${mock}<div class="row ans"><button class="btn big" data-a="0">✅ آمن</button><button class="btn big" data-a="1">🎣 تصيّد</button></div>`);
    const pick = await pending(res => document.querySelectorAll('.ans .btn').forEach(b => b.onclick = () => res(b.dataset.a === '1')));
    document.querySelectorAll('.ans .btn').forEach(b => { b.disabled = true; b.classList.toggle('dim', (b.dataset.a === '1') !== it.bad); });
    const ok = pick === it.bad; if (ok){ got++; sfx.good(); xpAdd(10); } else labMiss();
    if (it.bad) sfx2.alarm();
    lfb(ok, `<b>${ok ? '✓ صح!' : '✗ لا!'}</b> ${it.why}`);
    if (it.parts){ const a = document.createElement('div'); a.className = 'anat'; a.innerHTML = '<small>🧬 تشريح الرابط</small><div dir="ltr">' + it.parts.map(q => `<span class="${q[2]}"><b>${q[0]}</b><i>${q[1]}</i></span>`).join('') + '</div>'; $('#lfb').after(a); }
    if (i === PHISH.length - 1){ if (got === PHISH.length) achieve('phish'); tipBox('التصيّد الاحتيالي', '(Phishing)', 'رسالة أو رابط يتنكر بجهة موثوقة عشان تعطينه بياناتك. علاماته: <b>الاستعجال</b>، و<b>طلب رمز أو كلمة مرور</b>، و<b>رابط نطاقه غريب</b>. اقري النطاق الحقيقي: آخر جزء قبل أول «/».'); }
    await labNext(i < PHISH.length - 1 ? 'التالي ←' : 'كمّلي ←');
  }
}

/* ---------- 2a. design traps: what keeps you scrolling? ---------- */
const TRAPS = {
  badge:{ trap:true, t:'الأحمر والأرقام تحسسك إنك فاتك شي، عشان ترجعين.' },
  feed:{ trap:true, t:'التمرير اللانهائي ما له نهاية تقول لك: وقّفي.' },
  streak:{ trap:true, t:'الستريك يخليك تفتحين كل يوم خوف تخسرينه، مو لأنك تبين.' },
  auto:{ trap:true, t:'التشغيل التلقائي يقرر عنك إنك بتكملين.' },
  search:{ trap:false, t:'البحث أداة عادية، مو فخ.' },
  settings:{ trap:false, t:'الإعدادات عادية، ومنها تقدرين تقفلين الفخاخ!' },
};
function labDark(){
  labCard('فخاخ التصميم', 'وش اللي يخليك تقعدين أكثر؟', 'التطبيق مصمم يسرق وقتك. اضغطي على <b>٤ فخاخ</b> في الشاشة.',
    `<div class="phone">
      <div class="ph-top"><span class="hs" data-k="settings">⚙️</span><span class="ph-name">تطبيق</span><span class="hs" data-k="search">🔍</span><span class="hs" data-k="badge">🔔<em>99+</em></span></div>
      <div class="hs ph-streak" data-k="streak">🔥 ستريك ٤٥ يوم! لا تخسرينه</div>
      <div class="hs ph-feed" data-k="feed"><i></i><i></i><i></i><span>⬇️ مرري… المحتوى ما يخلص</span></div>
      <div class="hs ph-auto" data-k="auto">▶ الفيديو التالي خلال ٣…</div>
    </div><div class="found">الفخاخ: <b id="tfound">٠</b> / ٤</div>`);
  let found = 0;
  return pending(res => document.querySelectorAll('.phone .hs').forEach(el => el.onclick = () => {
    if (el.classList.contains('hit') || found >= 4) return;
    const t = TRAPS[el.dataset.k];
    if (t.trap){ found++; el.classList.add('hit'); sfx.good(); xpAdd(5); $('#tfound').textContent = AR(found); lfb(true, `<b>🪤 فخ!</b> ${t.t}`); }
    else { labMiss(); el.classList.add('miss'); setTimeout(() => el.classList.remove('miss'), 500); lfb(false, t.t); }
    if (found === 4){ sfx.win(); achieve('dark'); setTimeout(() => { lfb(true, '<b>✓ كشفتيها كلها!</b> اعرفي الفخ، وتقدرين تقفلينه من الإعدادات.'); tipBox('الأنماط المظلمة', '(Dark Patterns)', 'حيل في تصميم التطبيقات تخليك تسوين شي ما كنتِ ناوية عليه، مثل تقعدين أطول أو تشترين. التطبيق يكسب من وقتك وانتباهك.'); labNext().then(res); }, 900); }
  }));
}

/* ---------- 2b. healthy settings ---------- */
const HABITS = [
  { t:'🔕 ملخص الإشعارات مرة باليوم', ok:true },
  { t:'⏳ حد زمني للتطبيقات', ok:true },
  { t:'🔌 الجوال يشحن برا غرفة النوم', ok:true },
  { t:'▶️ تشغيل الفيديو تلقائياً', ok:false, why:'يقرر عنك إنك تكملين' },
  { t:'❤️ إشعار لكل لايك', ok:false, why:'كل إشعار يسحبك للتطبيق' },
  { t:'🌙 أتصفح قبل النوم لين أنعس', ok:false, why:'يأخر نومك ويقلل جودته' },
];
async function labHabits(){
  const list = shuffle(HABITS);
  labCard('إعداداتي الصحية', 'اختاري ٣ إعدادات تحمي وقتك', 'اضغطي على ٣ بطاقات، بعدين "تحقّقي".',
    `<div class="opts">${list.map((h, k) => `<button class="btn opt" data-k="${k}">${h.t}</button>`).join('')}</div>
     <div class="row"><button class="btn go" id="hcheck" disabled>تحقّقي ✓</button></div>`);
  const sel = new Set();
  await pending(res => {
    document.querySelectorAll('.opt').forEach(b => b.onclick = () => { sfx.click(); const k = +b.dataset.k; if (sel.has(k)) sel.delete(k); else if (sel.size < 3) sel.add(k); b.classList.toggle('on', sel.has(k)); $('#hcheck').disabled = sel.size !== 3; });
    $('#hcheck').onclick = res;
  });
  let wrong = 0;
  document.querySelectorAll('.opt').forEach(b => { const h = list[+b.dataset.k]; b.disabled = true; b.classList.add(h.ok ? 'right' : (sel.has(+b.dataset.k) ? 'wrong' : 'dim')); if (sel.has(+b.dataset.k) && !h.ok) wrong++; });
  $('#hcheck').hidden = true;
  if (wrong){ for (let k = 0; k < wrong; k++) labMiss(); } else sfx.win();
  const bads = list.filter(h => !h.ok).map(h => `<div>✗ ${h.t}: ${h.why}</div>`).join('');
  lfb(!wrong, `<b>${wrong ? `✗ ${AR(wrong)} اختيار غلط` : '✓ اختيارات ذكية!'}</b>${bads}`);
  xpAdd(wrong ? 5 : 20);
  tipBox('الضوء الأزرق والنوم', '(Blue Light)', 'ضوء الشاشات قبل النوم يأخر هرمون <b>الميلاتونين</b> اللي يساعدك تنامين، وكل إشعار يقطع تركيزك ويحتاج عقلك وقت يرجع له.');
  await labNext();
}

/* ---------- 3a. app permissions ---------- */
const PERMS = [
  { app:'🔦 كشاف', p:[['📸', 'الكاميرا (للفلاش)', true], ['👥', 'جهات الاتصال', false], ['📍', 'الموقع', false], ['🎙️', 'المايك', false]] },
  { app:'🗺️ خرائط', p:[['📍', 'الموقع أثناء الاستخدام', true], ['👥', 'جهات الاتصال', false], ['🖼️', 'الصور', false]] },
  { app:'🖌️ محرر صور', p:[['🖼️', 'الصور اللي أختارها', true], ['🎙️', 'المايك', false], ['📍', 'الموقع', false]] },
];
async function labPerms(){
  labCard('الأذونات', 'وش يحتاج كل تطبيق فعلاً؟', 'كل الأذونات مفتوحة. اقفلي اللي ما يحتاجه التطبيق، بعدين "تحقّقي".',
    `<div class="perms">${PERMS.map((a, i) => `<div class="app"><b>${a.app}</b>${a.p.map((q, j) => `<button class="perm on" data-i="${i}" data-j="${j}"><span>${q[0]} ${q[1]}</span><i>مسموح</i></button>`).join('')}</div>`).join('')}</div>
     <div class="row"><button class="btn go" id="pcheck">تحقّقي ✓</button></div>`);
  await pending(res => {
    document.querySelectorAll('.perm').forEach(b => b.onclick = () => { sfx.click(); b.classList.toggle('on'); b.querySelector('i').textContent = b.classList.contains('on') ? 'مسموح' : 'مرفوض'; });
    $('#pcheck').onclick = res;
  });
  let wrong = 0;
  document.querySelectorAll('.perm').forEach(b => { const need = PERMS[+b.dataset.i].p[+b.dataset.j][2], on = b.classList.contains('on'); b.disabled = true; b.classList.add(on === need ? 'right' : 'wrong'); if (on !== need) wrong++; });
  $('#pcheck').hidden = true;
  for (let k = 0; k < Math.min(wrong, 3); k++) labMiss();
  if (!wrong) sfx.win();
  lfb(!wrong, `<b>${wrong ? `✗ ${AR(wrong)} إذن بغير مكانه` : '✓ ممتاز!'}</b> الكشاف ما له دخل بجهات اتصالك، والخرائط تحتاج موقعك بس وأنتِ تستخدمينها.`);
  xpAdd(wrong ? 5 : 25); if (!wrong) achieve('perm');
  tipBox('مبدأ أقل صلاحية', '(Least Privilege)', 'كل تطبيق ياخذ <b>أقل إذن يكفيه يشتغل</b> وبس. التطبيق اللي يطلب أكثر من حاجته ممكن يجمع بياناتك ويبيعها.');
  await labNext();
}

/* ---------- 3b. where to download from ---------- */
const SOURCES = [
  { t:'🏪 المتجر الرسمي: المطوّر معروف، ملايين التحميلات، وتقييم ٤٫٦', ok:true, why:'المصدر الرسمي، والمطوّر واضح، والتقييمات كثيرة ✓' },
  { t:'🔗 رابط بالخاص: "حمّلي التحديث الجديد من هنا"', ok:false, why:'الروابط بالخاص من أشهر طرق نشر البرمجيات الخبيثة.' },
  { t:'📦 نسخة مهكّرة APK: كل المزايا مجاناً!', ok:false, why:'النسخ المهكّرة غالباً فيها برمجيات تسرق بياناتك.' },
  { t:'🎭 تطبيق اسمه يشبه المشهور، ٢٠ تحميل بس', ok:false, why:'تطبيق مقلّد! شيّكي على اسم المطوّر وعدد التحميلات.' },
];
async function labSource(){
  const list = shuffle(SOURCES);
  labCard('مصدر التحميل', 'من وين تحمّلين التطبيق؟', 'تبين تحمّلين تطبيق مشهور. اختاري المصدر الآمن.',
    `<div class="opts one">${list.map((s, k) => `<button class="btn opt" data-k="${k}">${s.t}</button>`).join('')}</div>`);
  await pending(res => document.querySelectorAll('.opt').forEach(b => b.onclick = () => {
    if (b.disabled) return;
    const s = list[+b.dataset.k];
    if (s.ok){ sfx.win(); b.classList.add('right'); document.querySelectorAll('.opt').forEach(o => o.disabled = true); lfb(true, `<b>✓ صح!</b> ${s.why}`); xpAdd(document.querySelector('.opt.wrong') ? 5 : 20); tipBox('البرمجيات الخبيثة', '(Malware)', 'برامج تتخفى بتطبيق عادي، منها <b>برامج التجسس</b> (Spyware) اللي تسرق صورك ورسايلك، و<b>برامج الفدية</b> (Ransomware) اللي تقفل ملفاتك وتطلب فلوس.'); labNext().then(res); }
    else { labMiss(); sfx2.alarm(); b.classList.add('wrong'); b.disabled = true; lfb(false, `<b>✗ لا!</b> ${s.why}`); }
  }));
}

/* ---------- 4. cyberbullying: steps in order ---------- */
let bullyMissed = false;
const BULLY = ['🧘‍♀️ ما أرد بانفعال', '📸 أوثّق بلقطة شاشة', '🚫 أحظر وأبلّغ', '🗣️ أكلم أهلي أو شخص أثق فيه'];
async function labBully(){
  labCard('تنمّر إلكتروني', 'وش تسوين بالترتيب؟', 'حساب ينشر تعليقات مؤذية عنك في القروب. اضغطي الخطوات <b>بالترتيب الصح</b>.',
    `<ol class="order" id="order"></ol><div class="opts">${shuffle(BULLY).map(t => `<button class="btn opt" data-t="${esc(t)}">${t}</button>`).join('')}</div>`);
  let n = 0; bullyMissed = false;
  await pending(res => document.querySelectorAll('.opt').forEach(b => b.onclick = () => {
    if (b.disabled) return;
    if (b.dataset.t === BULLY[n]){
      sfx.good(); b.disabled = true; b.classList.add('right'); n++;
      const li = document.createElement('li'); li.textContent = b.dataset.t; $('#order').appendChild(li);
      if (n === BULLY.length){ sfx.win(); xpAdd(25); if (!bullyMissed) achieve('bully'); lfb(true, '<b>✓ بالضبط!</b> والرد بانفعال يعطي المتنمر اللي يبيه. وإذا شفتي التنمر على غيرك: لا تشاركين فيه، وادعميها، وبلّغي.'); tipBox('التنمّر الإلكتروني', '(Cyberbullying)', 'إيذاء متكرر عبر الإنترنت: سخرية، أو نشر صور، أو إقصاء من القروبات. <b>التوثيق</b> مهم لأنه دليلك وقت البلاغ، و<b>اللي يتفرج</b> يقدر يوقف التنمر لو بلّغ.'); labNext().then(res); }
    } else { bullyMissed = true; labMiss(); b.classList.add('miss'); setTimeout(() => b.classList.remove('miss'), 500); lfb(false, n === 0 ? 'أول شي: لا تردين وأنتِ معصبة.' : 'فكّري: وش لازم يصير قبل الحظر؟'); }
  }));
}

/* ---------- expert 1. digital footprint: spot the leaks in a story ---------- */
const LEAKS = [
  { k:'door', leak:true, t:'رقم البيت يدل على عنوانك.' },
  { k:'car', leak:true, t:'لوحة السيارة توصّل لأهلك.' },
  { k:'pin', leak:true, t:'ملصق الموقع يقول وين أنتِ الحين.' },
  { k:'bag', leak:true, t:'شعار المدرسة يدل وين تدرسين.' },
  { k:'ticket', leak:true, t:'باركود التذكرة فيه بيانات الحجز ورقمه!' },
  { k:'palm', leak:false, t:'النخلة ما تكشف شي.' },
  { k:'cup', leak:false, t:'الكوب عادي.' },
  { k:'cat', leak:false, t:'القطوة عادية 🐈' },
];
function labFootprint(){
  labCard('تحدي الخبيرات ١ · البصمة الرقمية', 'وش يكشف هالستوري؟', 'صديقتك بتنشر هالستوري. اكتشفي <b>٥ معلومات</b> تكشفها.',
    `<div class="story">
      <div class="st-top">⏱️ الحين · <span>صديقتك</span></div>
      <div class="hs it door" data-k="door">🚪<em>١٢</em></div>
      <div class="hs it palm" data-k="palm">🌴</div>
      <div class="hs it car" data-k="car">🚗<em>أ ب ج ١٢٣٤</em></div>
      <div class="hs it pin" data-k="pin">📍 حي النخيل</div>
      <div class="hs it bag" data-k="bag">🎒<em>ثانوية الريادة</em></div>
      <div class="hs it cup" data-k="cup">☕</div>
      <div class="hs it ticket" data-k="ticket">🎫<em dir="ltr">BOARDING ▮▯▮▮▯▮</em></div>
      <div class="hs it cat" data-k="cat">🐈</div>
    </div><div class="found">المكتشف: <b id="lfound">٠</b> / ٥</div>`);
  let found = 0;
  return pending(res => document.querySelectorAll('.story .hs').forEach(el => el.onclick = () => {
    if (el.classList.contains('hit') || found >= 5) return;
    const t = LEAKS.find(l => l.k === el.dataset.k);
    if (t.leak){ found++; el.classList.add('hit'); sfx2.scan(); xpAdd(5); $('#lfound').textContent = AR(found); lfb(true, `<b>🔎 كشفتيها!</b> ${t.t}`); }
    else { labMiss(); el.classList.add('miss'); setTimeout(() => el.classList.remove('miss'), 500); lfb(false, t.t); }
    if (found === 5){ sfx.win(); achieve('print'); setTimeout(() => { lfb(true, '<b>✓ عين خبيرة!</b> انشري بعد ما تطلعين من المكان، وشيّكي الخلفية قبل النشر.'); tipBox('البصمة الرقمية', '(Digital Footprint)', 'كل شي تنشرينه يبقى ويتجمّع، حتى لو حذفتيه ممكن أحد صوّره. والصور فيها أحياناً <b>بيانات وصفية</b> (Metadata) مثل موقع التصوير بالضبط.'); labNext().then(res); }, 900); }
  }));
}

/* ---------- expert 2. check before you share ---------- */
const NEWS = [
  { t:'🏛️ أتأكد من الحساب الرسمي للجهة', ok:true },
  { t:'📅 أشوف تاريخ الخبر ومصدره', ok:true },
  { t:'🖼️ أبحث عن الصورة (بحث عكسي)', ok:true },
  { t:'📤 أنشره احتياط', ok:false, why:'نشر الخبر الكاذب يخليك جزء منه' },
  { t:'👥 وصلني من أكثر من قروب، أكيد صح', ok:false, why:'كثرة النشر مو دليل صحة' },
  { t:'📸 الصورة واضحة، أكيد حقيقية', ok:false, why:'الذكاء الاصطناعي يقدر يصنع صور مزيفة واضحة جداً' },
];
async function labNews(){
  const list = shuffle(NEWS);
  labCard('تحدي الخبيرات ٢ · تحققي قبل تنشرين', 'خبر عاجل!', 'وصلك هالخبر. اختاري <b>٣ خطوات</b> صحيحة قبل لا تنشرينه.',
    `<div class="mock news"><small>↪️ أُعيد توجيهها كثيراً</small><p>🔴 <b>عاجل!!</b> تعطيل الدراسة بكرة بسبب موجة غبار 🌪️ انشروها قبل تنحذف!</p></div>
     <div class="opts">${list.map((h, k) => `<button class="btn opt" data-k="${k}">${h.t}</button>`).join('')}</div>
     <div class="row"><button class="btn go" id="ncheck" disabled>تحقّقي ✓</button></div>`);
  const sel = new Set();
  await pending(res => {
    document.querySelectorAll('.opt').forEach(b => b.onclick = () => { sfx.click(); const k = +b.dataset.k; if (sel.has(k)) sel.delete(k); else if (sel.size < 3) sel.add(k); b.classList.toggle('on', sel.has(k)); $('#ncheck').disabled = sel.size !== 3; });
    $('#ncheck').onclick = res;
  });
  let wrong = 0;
  document.querySelectorAll('.opt').forEach(b => { const h = list[+b.dataset.k]; b.disabled = true; b.classList.add(h.ok ? 'right' : (sel.has(+b.dataset.k) ? 'wrong' : 'dim')); if (sel.has(+b.dataset.k) && !h.ok) wrong++; });
  $('#ncheck').hidden = true;
  if (wrong) sfx.bad(); else sfx.win();
  const bads = list.filter(h => !h.ok).map(h => `<div>✗ ${h.t}: ${h.why}</div>`).join('');
  lfb(!wrong, `<b>${wrong ? `✗ ${AR(wrong)} اختيار غلط` : '✓ خبيرة تحقق!'}</b>${bads}`);
  xpAdd(wrong ? 5 : 25); if (!wrong) achieve('news');
  tipBox('التزييف العميق', '(Deepfake)', 'الذكاء الاصطناعي يقدر يصنع صور وفيديوهات وأصوات مزيفة تبين حقيقية. فالوضوح مو دليل: <b>تحققي من المصدر الرسمي</b> دايماً.');
  await labNext();
}

/* ---------- expert 3. case files: name the attack like an analyst ---------- */
const CATS = [['🎣', 'تصيّد احتيالي', 'Phishing'], ['🎭', 'هندسة اجتماعية', 'Social Engineering'], ['💰', 'ابتزاز إلكتروني', 'Extortion'], ['🦠', 'برمجية خبيثة', 'Malware'], ['👤', 'انتحال شخصية', 'Impersonation'], ['💬', 'تنمّر إلكتروني', 'Cyberbullying']];
const CASES = [
  { t:'وصلتك رسالة من "البنك": حسابك موقوف، حدّثي بياناتك من الرابط بسرعة!', a:0, act:'لا تضغطين الرابط، وادخلي من التطبيق الرسمي.' },
  { t:'أحد يتصل ويقول إنه من شركة الاتصالات، ويطلب الرمز اللي وصلك على جوالك.', a:1, act:'ولا جهة رسمية تطلب الرمز. سكّري المكالمة.' },
  { t:'حساب يهدد ينشر صورك إذا ما رسلتي له فلوس.', a:2, act:'لا تدفعين ولا تحذفين المحادثة. وثّقي، وقولي لأهلك، وبلّغي الجهات الرسمية مثل تطبيق "كلنا أمن".' },
  { t:'حمّلتي لعبة مهكّرة، وصار الجوال بطيء وتطلع إعلانات غريبة.', a:3, act:'احذفيها، وغيّري كلمات المرور، وحدّثي الجهاز.' },
  { t:'حساب باسم صديقتك وصورتها يطلب منك تحوّلين له فلوس ضروري.', a:4, act:'اتصلي بصديقتك نفسها من رقمها وتأكدي، وبلّغي عن الحساب.' },
  { t:'قروب يتناقل صورة بنت من صفك مع تعليقات ساخرة.', a:5, act:'لا تشاركين ولا تضحكين. ادعميها، وبلّغي.' },
];
async function labCases(){
  let got = 0;
  for (let i = 0; i < CASES.length; i++){
    const c = CASES[i];
    labCard(`تحدي الخبيرات ٣ · ملف القضية ${AR(i + 1)} / ${AR(CASES.length)}`, 'لو كنتِ خبيرة، وش تصنّفينها؟', 'اقري القضية واختاري نوع الهجوم:',
      `<div class="mock case"><small>📁 القضية #${AR(i + 1)}</small><p>${esc(c.t)}</p></div>
       <div class="cats">${CATS.map((k, j) => `<button class="btn cat" data-j="${j}"><i>${k[0]}</i><b>${k[1]}</b><small dir="ltr">${k[2]}</small></button>`).join('')}</div>`);
    const pick = await pending(res => document.querySelectorAll('.cat').forEach(b => b.onclick = () => res(+b.dataset.j)));
    document.querySelectorAll('.cat').forEach(b => { b.disabled = true; const j = +b.dataset.j; b.classList.add(j === c.a ? 'right' : (j === pick ? 'wrong' : 'dim')); });
    const ok = pick === c.a; if (ok){ got++; sfx.good(); xpAdd(10); } else { labMiss(); sfx2.alarm(); }
    lfb(ok, `<b>${ok ? '✓ تحليل صحيح!' : '✗ مو هذا'}</b> التصنيف: <b>${CATS[c.a][1]}</b> <span dir="ltr">(${CATS[c.a][2]})</span><div>🛡️ وش تسوين: ${c.act}</div>`);
    if (i === CASES.length - 1){
      if (got === CASES.length) achieve('cases');
      tipBox('الهندسة الاجتماعية', '(Social Engineering)', 'أخطر الهجمات ما تخترق الجهاز، تخترق <b>الإنسان</b>: تلعب على الخوف أو الاستعجال أو الثقة. أقوى حماية: <b>توقفي، تحققي، وبعدين قرري</b>.');
    }
    await labNext(i < CASES.length - 1 ? 'القضية التالية ←' : 'للمراجعة الأخيرة ←');
  }
}
setTimeout(() => xpUI(0), 1200);

/* ---------- the villain: a hooded hacker instead of the fox ---------- */
function fox3d(boss){
  const g = new THREE.Group(), vis = boss ? 0xff2d55 : 0x22d3ee;
  g.add(mk(G.cone(.62, 1.75, 8), 0x1b1f3a, 0, .88, 0));
  g.add(mk(G.ico(.52, 1), 0x1b1f3a, 0, 1.82, -.08));
  g.add(mk(G.ico(.4, 1), 0x0a0c18, 0, 1.76, .08));
  g.add(mk(G.box(.5, .1, .06), vis, 0, 1.8, .44, { emissive:vis, emissiveIntensity:1.2 }));
  const lap = new THREE.Group(); lap.position.set(0, 1.05, .62); lap.rotation.x = -.35; g.add(lap);
  lap.add(mk(G.box(.7, .04, .45), 0x2a3355, 0, 0, 0));
  const scr = mk(G.box(.7, .42, .03), vis, 0, .22, -.22, { emissive:vis, emissiveIntensity:.7 }); scr.rotation.x = -.25; lap.add(scr);
  g.userData = {};
  return g;
}
function pFox(boss){
  const v = boss ? '#ff2d55' : '#22d3ee';
  return `<svg viewBox="0 0 120 140" aria-hidden="true"><rect width="120" height="140" fill="#0b1022"/><path d="M14 140 Q16 22 60 16 Q104 22 106 140Z" fill="#1b1f3a" stroke="#2a3355" stroke-width="3"/><ellipse cx="60" cy="68" rx="28" ry="32" fill="#05070f"/><rect x="36" y="58" width="48" height="12" rx="6" fill="${v}"/><rect x="36" y="58" width="48" height="12" rx="6" fill="${v}" opacity=".5" filter="blur(4px)"/><text x="60" y="122" text-anchor="middle" font-size="16" font-family="monospace" fill="${v}">01101</text></svg>`;
}

/* ---------- the cyber team that sends each mission ---------- */
const OPS = [
  { n:'نورة', r:'محللة مركز العمليات (SOC)', av:{ hair:'#1e1408', shirt:'#22d3ee', skin:'#e0ac69', style:'long' } },
  { n:'دانة', r:'مختصة الخصوصية', av:{ hair:'#5a3214', shirt:'#8b5cf6', skin:'#f1c27d', style:'bob' } },
  { n:'جود', r:'محققة جنائية رقمية', av:{ hair:'#2a1a10', shirt:'#10b981', skin:'#ffdbac', style:'pony' } },
];
let brief = null;
const BRIEFS = () => new Map([
  [labPassword, [0, 'حساب فريقنا الجديد يحتاج كلمة مرور. المهاجمين عندهم أجهزة تخمّن مليارات الكلمات بالثانية، سويها تصمد.']],
  [labPhish, [0, 'وصلتنا بلاغات عن روابط مشبوهة. افحصيها وقولي لي: آمنة ولا تصيّد؟']],
  [labDark, [1, 'نحلل تطبيق مشهور يخلي المستخدمين يقعدون ساعات. اكتشفي الحيل اللي في تصميمه.']],
  [labHabits, [1, 'اقترحي إعدادات تخلي المستخدمة هي اللي تتحكم بوقتها.']],
  [labGreen, [1, 'مشروع الاستدامة الرقمية: كل جهاز وكل ملف بالسحابة له أثر على البيئة. صنّفي هالتصرفات.']],
  [labPerms, [1, 'مراجعة خصوصية: ثلاث تطبيقات تطلب صلاحيات. اقفلي اللي ما تحتاجه.']],
  [labSource, [0, 'وحدة تبي تحمّل تطبيق مشهور. ساعديها تختار المصدر الآمن.']],
  [labBully, [2, 'وصلنا بلاغ تنمّر من طالبة. وش الخطوات الصح بالترتيب؟']],
  [labFootprint, [2, 'قبل ما تنشر صديقتك هالستوري، افحصيها مثل المحققين: وش تكشف عنها؟']],
  [labNews, [2, 'خبر ينتشر بسرعة بالقروبات. تحققي منه قبل لا ينتشر أكثر.']],
  [labCases, [0, 'عندنا ملفات قضايا جديدة. صنّفي كل هجوم مثل محللة محترفة.']],
]);

/* ---------- sustainability: devices and data have a footprint too ---------- */
const GREEN = [
  { t:'📱 تغيّرين جوالك كل سنة مع كل إصدار جديد', ok:false, why:'أكبر أثر بيئي للجوال يصير وقت تصنيعه، فكل ما طوّلتي عمره خففتي الأثر.' },
  { t:'♻️ تسلّمين جوالك القديم لنقطة تدوير إلكتروني بعد ما تمسحين بياناتك', ok:true, why:'فيه معادن تنعاد تستخدم، ومسح البيانات يحمي خصوصيتك.' },
  { t:'🗑️ ترمين الجوال القديم أو البطارية بالزبالة', ok:false, why:'البطاريات والمعادن الثقيلة تلوّث التربة والمياه.' },
  { t:'☁️ تحذفين الملفات والإيميلات اللي ما تحتاجينها من السحابة', ok:true, why:'السحابة مراكز بيانات حقيقية تشتغل بالكهرباء وتحتاج تبريد.' },
  { t:'🔧 تصلحين الشاشة المكسورة بدل ما تشترين جوال جديد', ok:true, why:'الإصلاح يطوّل عمر الجهاز ويقلل النفايات.' },
  { t:'🔌 تخلين الشاحن بالفيش طول اليوم بدون جوال', ok:false, why:'يسحب كهرباء بسيطة حتى وهو فاضي، وتتجمع مع الوقت.' },
];
async function labGreen(){
  const list = shuffle(GREEN); let good = 0;
  for (let i = 0; i < list.length; i++){
    const it = list[i];
    labCard(`الاستدامة الرقمية ${AR(i + 1)} / ${AR(list.length)}`, 'صديق للبيئة ولا يضرها؟', 'صنّفي التصرف:',
      `<div class="mock green"><p>${it.t}</p></div>
       <div class="eco"><span>🌍 أثرك البيئي</span><b><i style="width:${Math.max(6, 100 - good * 16)}%"></i></b></div>
       <div class="row ans"><button class="btn big bin" data-b="1">♻️ صديق للبيئة</button><button class="btn big bin" data-b="0">🔥 يضر البيئة</button></div>`);
    const pick = await pending(res => document.querySelectorAll('.bin').forEach(b => b.onclick = () => res(b.dataset.b === '1')));
    document.querySelectorAll('.bin').forEach(b => { b.disabled = true; b.classList.toggle('dim', (b.dataset.b === '1') !== it.ok); });
    const ok = pick === it.ok; if (ok){ good++; sfx.good(); xpAdd(5); } else labMiss();
    document.querySelector('.eco i').style.width = Math.max(6, 100 - good * 16) + '%';
    lfb(ok, `<b>${ok ? '✓ صح!' : '✗ لا!'}</b> ${it.why}`);
    if (i === list.length - 1){
      if (good === list.length) achieve('green');
      tipBox('النفايات الإلكترونية', '(E-waste)', 'العالم أنتج سنة ٢٠٢٢ حوالي <b>٦٢ مليون طن</b> نفايات إلكترونية، وأقل من ربعها انعاد تدويره بشكل موثّق. وهذا مرتبط بهدف التنمية المستدامة <b>رقم ١٢: الاستهلاك والإنتاج المسؤولان</b>. المواطِنة الرقمية تحمي نفسها، وتحمي غيرها، وتحمي كوكبها.');
    }
    await labNext(i < list.length - 1 ? 'التالي ←' : 'كمّلي ←');
  }
}

/* ---------- look: dark mode (default) and a colour of her choice ---------- */
const ACCENTS = [['#22d3ee', 'فيروزي'], ['#a78bfa', 'بنفسجي'], ['#f472b6', 'وردي'], ['#34d399', 'أخضر'], ['#fbbf24', 'ذهبي']];
function applyLook(){
  const root = document.documentElement;
  root.classList.toggle('dk', S.dark !== false);
  root.style.setProperty('--cy', S.accentC || '#22d3ee');
  if (S.dark !== false) root.style.setProperty('--accent', S.accentC || '#22d3ee'); else root.style.removeProperty('--accent');
}
setTimeout(applyLook, 0);
function lookPicker(){
  return `<div class="field" style="text-align:center"><label>لون واجهتك</label><div class="swatches">${ACCENTS.map(([c, n]) => `<button class="sw" data-c="${c}" aria-label="${n}" aria-pressed="${(S.accentC || '#22d3ee') === c}" style="background:${c}"></button>`).join('')}</div></div>`;
}
function wireLook(){
  document.querySelectorAll('.sw').forEach(b => b.onclick = () => { sfx.click(); S.accentC = b.dataset.c; save(); applyLook(); document.querySelectorAll('.sw').forEach(x => x.setAttribute('aria-pressed', x === b)); });
}

/* ---------- game HUD: gamer tag over the player, shield bar and topic hotbar ---------- */
function gamerTag(){ if (!S.tagNo){ S.tagNo = 1000 + Math.floor(Math.random() * 9000); save(); } return `${S.name || 'لاعبة'}_${S.tagNo}`; }
function gameHud(){
  let hb = document.getElementById('hotbar');
  if (!hb){ hb = document.createElement('div'); hb.id = 'hotbar'; document.body.appendChild(hb); }
  const on = mode === 'level' && !!player;
  hb.hidden = !on;
  if (!on) return;
  if (!labels.some(l => l.obj === player && l.el.classList.contains('tag'))) label(player, esc(gamerTag()), 'tag', 2.35);
  const pct = Math.round(Math.max(0, hearts) / 3 * 100);
  const html = `<div class="shield"><b style="width:${pct}%"></b><span>🛡️ درع الحماية ${AR(pct)}٪</span></div>
    <div class="slots">${ISL.map((d, k) => `<div class="slot${k === curIsland ? ' cur' : ''}${S.stars[k] > 0 ? ' done' : ''}"><small>${AR(k + 1)}</small><i>${d.icon}</i><span>${d.sub}</span></div>`).join('')}</div>`;
  if (hb.__h !== html){ hb.innerHTML = html; hb.__h = html; }
}
setInterval(gameHud, 250);

/* ---------- stopwatch for the fastest-expert challenge ---------- */
function playTime(){
  if (!S.t0) return AR(0) + ':' + AR(0).repeat(2);
  const sec = Math.floor(((S.tEnd || Date.now()) - S.t0) / 1000), m = Math.floor(sec / 60), ss = sec % 60;
  return `${AR(m)}:${ss < 10 ? AR(0) : ''}${AR(ss)}`;
}
setInterval(() => { const t = document.querySelector('#xp .xt'); if (t) t.textContent = '⏱️ ' + playTime(); }, 1000);
