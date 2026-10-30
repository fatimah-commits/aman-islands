# Builds teen/index.html (the teen edition) from saudi/index.html.
# The kids' editions are never touched; every replacement must match exactly once.
import sys, os, re
R = '/home/user/aman-islands/'
s = open(R + 'saudi/kids.html').read()
LABS = open(os.path.join(os.path.dirname(__file__), 'labs.js')).read()
LABCSS = open(os.path.join(os.path.dirname(__file__), 'labs.css')).read()

def r(a, b, n=1):
    global s
    c = s.count(a)
    if c != n:
        sys.exit(f'expected {n} got {c}: {a[:90]}')
    s = s.replace(a, b)

# own save slot, own title
r("localStorage.setItem('amanIslandsSA'", "localStorage.setItem('amanIslandsTeen'")
r("localStorage.getItem('amanIslandsSA'", "localStorage.getItem('amanIslandsTeen'")
r('مغامرة الأمان الرقمي للبطلات الصغيرات', 'تحدي الأمن السيبراني والمواطنة الرقمية', s.count('مغامرة الأمان الرقمي للبطلات الصغيرات'))

# no recorded lines in this edition (they were recorded for young children)
r("function voice(id, queue){\n  const a = ac(); if (!a || !id) return;",
  "function voice(id, queue){\n  return; // the teen edition plays no recorded lines\n  const a = ac(); if (!a || !id) return;")

# topics
r("sub:'كلمة المرور', icon:'🔑'", "sub:'أمن الحسابات', icon:'🔑'")
r("sub:'وقت الشاشة', icon:'⏰'", "sub:'التوازن الرقمي', icon:'⏰'")
r("sub:'الاستئذان قبل التحميل', icon:'🎁'", "sub:'الخصوصية والأذونات', icon:'🎁'")
r("sub:'الغرباء بالإنترنت', icon:'💬'", "sub:'التواصل الآمن', icon:'💬'")
r("const BADGE = ['حارسة المفتاح', 'سيدة الوقت', 'المستأذنة الذكية', 'درع الرسائل'];",
  "const BADGE = ['حارسة الحسابات', 'سيدة التوازن', 'حامية الخصوصية', 'درع التواصل'];")

# ---------- island 1: accounts ----------
r("""  { who:'reem', name:'ريم – صديقتك', m:() => girl3d(CAST.reem.d3), vid:'l1', say:'عطيني كلمة المرور حقتك!', ok:false, g:'برافو! حفظتِ السر 🤐', b:'حتى الصديقة ما تعرفها!' },""",
  """  { who:'reem', name:'ريم – صديقتك', m:() => girl3d(CAST.reem.d3), vid:'l1', say:'عطيني باسوورد حسابك، أدخل أحافظ على الستريك حقك وأنتِ مسافرة 🔥', ok:false, g:'صح! حتى أقرب صديقة ما تعرفها 🤐', b:'لا! كلمة المرور ما تنعطى حتى لأقرب صديقة' },""")
r("""  { who:'foxBoss', name:'"مديرة اللعبة"', m:() => fox3d(true), vid:'l2', say:'فزتي بجواهر! أرسلي لي كلمة المرور 💎', ok:false, g:'كشفتيها! هذي الثعلبة 🦊', b:'هذي الثعلبة متنكّرة!' },""",
  """  { who:'foxBoss', name:'"فريق الدعم"', m:() => fox3d(true), vid:'l2', say:'تنبيه: حسابك مخالف وبينحذف خلال ٢٤ ساعة! أرسلي كلمة المرور للتحقق ⚠️', ok:false, g:'كشفتيها! الدعم الحقيقي ما يطلب كلمة المرور أبداً 🦊', b:'هذا تصيّد! الدعم الحقيقي ما يطلب كلمة المرور' },""")
r("""say:'حبيبتي، قولي لي كلمة المرور، أكتبها عندي عشان ما تضيع 💜', ok:true, g:'صح! ماما تحفظها لك 💜', b:'ماما يصير تعرفها 💜' },""",
  """say:'سجّلي كلمة مرور حسابك الجديد عندي، احتياط لو نسيتيها 💜', ok:true, g:'صح! أهلك يصير يعرفونها 💜', b:'أهلك يصير يعرفونها 💜' },""")
r("""  { who:'hooded', name:'لاعبة_مجهولة', m:() => hooded3d(), vid:'l4', say:'عطيني كلمة المرور ولا…! 😠', ok:false, g:'برافو! وقولي لأهلك', b:'لا! قولي لأهلك على طول' },""",
  """  { who:'hooded', name:'حساب_مجهول', m:() => hooded3d(), vid:'l4', say:'عطيني كلمة المرور ولا بنشر محادثاتك! 😠', ok:false, g:'صح! التهديد ما نستسلم له: نوثّق ونبلّغ ونقول لأهلنا', b:'لا! لا تستسلمين للتهديد، قولي لأهلك وبلّغي' },""")
r("""  await lessonCard({ num:'١', icon:'🔑', title:'كلمة المرور سر',
    say:'كلمة المرور هي الرمز اللي يفتح لعبتك 🔑 ما يعرفه إلا أنتِ وماما وبابا.' });""",
  """  await lessonCard({ num:'١', icon:'🔑', title:'أمن الحسابات',
    say:'كلمة المرور مفتاح حياتك الرقمية 🔑 لا تشاركينها، وخليها طويلة وما تتكرر، وفعّلي التحقق بخطوتين.' });""")
r("""  await finish(0, starsFor(mistakes), 'كلمة المرور سر، إلا عن ماما وبابا.', '💜 يا شاطرة! ماما فخورة فيك، لأنك خليتي كلمة المرور سر.');""",
  """  await lab(labPassword); await lab(labPhish);
  await finish(0, starsFor(mistakes), 'كلمة مروري سر، طويلة، وما أكررها، ومعها تحقق بخطوتين.', '💜 كفو! حسابك صار حصن.');""")

# ---------- island 2: digital balance ----------
i = s.index('const DAY = ['); j = s.index('];', i) + 2
s = s[:i] + """const DAY = [
  { time:'٤ العصر', ico:'⏰', sky:[0x2a64b0, 0xe2fff0, 0x7fc8f0], light:.75, h:4, q:'خلصتِ واجباتك، وبتفتحين التطبيق "دقيقة بس".', opts:[
    { ico:'timer', t:'أحدد وقت: ٣٠ دقيقة', d:+25, why:'الحد يحميك من "دقيقة بس" ⏰' },
    { ico:'game', t:'أفتح بدون حد', d:-20, why:'التطبيق مصمم ما تطلعين منه!' } ] },
  { time:'٥ المغرب', ico:'▶️', sky:[0x5a4aa8, 0xffd8b8, 0xff9a90], light:.7, h:5, q:'خلص وقتك، والتطبيق شغّل الفيديو اللي بعده تلقائياً…', opts:[
    { ico:'save', t:'أوقف التشغيل التلقائي وأطلع', d:+25, why:'أنتِ اللي تقررين 💪' },
    { ico:'game', t:'"واحد بعد بس…"', d:-20, why:'الخوارزمية فازت عليك!' } ] },
  { time:'٦ المساء', ico:'🌇', sky:[0x3a2a88, 0xffc0a0, 0xc070b8], light:.6, h:6, q:'طلعتِ من الجوال. وش تسوين الحين؟', opts:[
    { ico:'ball', t:'رياضة أو مشي', d:+20, why:'جسمك يشكرك! 🏃‍♀️' },
    { ico:'paint', t:'هواية أو قراءة', d:+20, why:'وقت لنفسك 🎨' },
    { ico:'tv', t:'أكمل بالتلفزيون', d:-20, why:'نفس الشاشة بس أكبر! 👀' } ] },
  { time:'١٠ الليل', ico:'🌙', sky:[0x0c1040, 0x5a4a98, 0x1e2268], light:.35, h:10, night:true, q:'وقت النوم والإشعارات ما وقفت.', opts:[
    { ico:'book', t:'عدم الإزعاج والجوال برا الغرفة', d:+25, why:'نوم عميق 😴' },
    { ico:'bed', t:'أتصفح بالسرير لين أنعس', d:-25, why:'الضوء الأزرق يطيّر النوم!' } ] },
];""" + s[j:]
r("""  await lessonCard({ num:'٢', icon:'⏰', title:'وقت الشاشة له حد',
    say:'الجلوس طويل على الآيباد يتعب عيونك 👀 نلعب شوي، ولما يرن المؤقت نطفيه.' });""",
  """  await lessonCard({ num:'٢', icon:'⏰', title:'التوازن الرقمي',
    say:'التطبيقات مصممة تخليك تقعدين أطول ⏳ أنتِ اللي تتحكمين بوقتك، مو الخوارزمية.' });""")
r("""  await finish(1, starsFor(mistakes), 'لما يرن المؤقت، أطفي الشاشة.', '💛 بابا فخور فيك! تعالي نقرا كتاب مع بعض يا بنتي');""",
  """  await lab(labDark); await lab(labHabits);
  await finish(1, starsFor(mistakes), 'أتحكم بوقتي، مو الخوارزمية.', '💛 توازنك يحمي نومك وتركيزك.');""")

# ---------- island 3: privacy & permissions ----------
i = s.index('const ADS = ['); j = s.index('];', i) + 2
s = s[:i] + """const ADS = [
  { n:'تطبيق مذاكرة', ok:true },
  { n:'نسخة مهكّرة مجانية', ok:false, bad:'فيها برمجيات خبيثة تسرق بياناتك' },
  { n:'محرر صور', ok:true },
  { n:'اربحي جوال جديد!', ok:false, bad:'تصيّد يسرق بياناتك وفلوسك' },
];""" + s[j:]
for a, b in [("'نزلت لعبة! روحي لماما واسأليها'", "'نزل تطبيق جديد! استشيري أمك قبل التحميل'"),
             ("'ماما وافقت! خذي اللعبة الخضرا'", "'أمك وافقت! حمّلي التطبيق الأخضر'"),
             ("'انتظري اللعبة الجاية...'", "'انتظري التطبيق الجاي...'"),
             ("'تعالي نشوف مع بعض يا حلوة 🔍'", "'تعالي نشوف المطوّر والأذونات مع بعض 🔍'"),
             ("'🔍 ماما تشوف اللعبة…'", "'🔍 أمك تشيّك على التطبيق…'"),
             ("'شكراً إنك سألتيني يا قلبي 💜'", "'شكراً إنك استشرتيني 💜'"),
             ("'✗ أخذتيها بدون إذن! طلعت الثعلبة 🦊'", "'✗ حمّلتيه بدون تحقق! طلع خبيث 🦠'"),
             ("'\" بإذن ماما'", "'\" بعد التحقق'")]:
    r(a, b)
r("""  await lessonCard({ num:'٣', icon:'🎁', title:'أستأذن قبل التحميل',
    say:'قبل ما تنزّلين أي لعبة جديدة، اسألي ماما أو بابا 🙋‍♀️' });""",
  """  await lessonCard({ num:'٣', icon:'🎁', title:'الخصوصية والأذونات',
    say:'قبل أي تحميل: مين المطوّر؟ ووش الأذونات اللي يطلبها؟ وإذا شكّيتي استشيري أهلك 🛡️' });""")
r("""  await finish(2, starsFor(mistakes), 'قبل أي تحميل، أسأل ماما أو بابا.', '💜 ماما: أحب إنك تسأليني يا عمري!');""",
  """  await lab(labPerms); await lab(labSource);
  await finish(2, starsFor(mistakes), 'أحمّل من المتجر الرسمي، وأعطي أقل الأذونات.', '💜 خصوصيتك بيدك.');""")

# ---------- island 4: safe communication ----------
i = s.index('const MSGS = ['); j = s.index('];', i) + 2
s = s[:i] + """const MSGS = [
  { from:'نجمة_الألعاب', who:'hooded', t:'هلا! كم عمرك؟ وفي أي مدرسة؟ 😊', ans:['tell'], ok:'صح! بياناتك ما تنعطى لغريب 🏠', no:'لا! عمرك ومدرستك معلومات خاصة' },
  { from:'ليان – بنت خالتك', who:'cousin', friend:true, t:'بتجين معنا لبيت جدتي اليوم؟', ans:['chat', 'tell'], ok:'صح! ليان تعرفينها 💗', no:'ليان قريبتك، ردي عادي!' },
  { from:'نجمة_الألعاب', who:'hooded', t:'لا تقولين لأحد عن كلامنا، خليه بيننا 🤫', ans:['tell'], ok:'صح! "خليه سر" علامة خطر 🚩', no:'"خليه سر" علامة خطر! قولي لأهلك' },
  { from:'نجمة_الألعاب', who:'hooded', t:'خلينا نتقابل بالمول بكره 🎁', ans:['tell'], ok:'صح! ما نقابل أحد عرفناه أونلاين', no:'خطر! قولي لأهلك 🏠' },
];""" + s[j:]
r("""  await lessonCard({ num:'٤', icon:'💬', title:'الغرباء بالإنترنت',
    say:'اللي ما تعرفينه بالحقيقة غريب 👤 لا تعطينه اسمك ولا صورتك، وقولي لأهلك.',""",
  """  await lessonCard({ num:'٤', icon:'💬', title:'التواصل الآمن',
    say:'ورا الشاشة ممكن يكون أي أحد 👤 الحساب اللطيف ممكن يكون مزيف. لا تشاركين بياناتك، وقولي لأهلك.',""")
r("""  await finish(3, starsFor(mistakes), 'ما أكلّم الغرباء، وأقول لأهلي.', '💛 بابا يحبك ويحميك دايماً!');""",
  """  await lab(labBully);
  await finish(3, starsFor(mistakes), 'ما أشارك بياناتي مع غرباء، وأوثّق وأبلّغ وأقول لأهلي.', '💛 أهلك معك دايماً.');""")

# ---------- review: harder questions, and the expert challenge before it ----------
i = s.index('const QUIZ = ['); j = s.index('];', i) + 2
s = s[:i] + """const QUIZ = [
  { q:'وصلك رمز تحقق، وأحد يقول: "أرسلته لك بالغلط، عطيني إياه".', a:0 },
  { q:'تبين تستخدمين نفس كلمة المرور لكل حساباتك عشان ما تنسينها.', a:0 },
  { q:'كل ما فتحتي التطبيق تكملين ساعات بسبب الفيديوهات اللي تشتغل لحالها.', a:1 },
  { q:'تطبيق كشاف يطلب يوصل لجهات الاتصال وموقعك.', a:2 },
  { q:'حساب جديد يمدحك كثير، ويبي ينقل الكلام للخاص ويقول لا تقولين لأحد.', a:3 },
  { q:'أحد ينشر تعليقات مؤذية عنك في القروب.', a:3 },
];""" + s[j:]
r("const qs = QUIZ.slice(0, 4);", "const qs = QUIZ.slice();")
r("function showQuiz(){", "async function showQuiz(){\n  mode = 'map'; buildWorld(); $('#hud').hidden = true; setAccent('#8a5cff');\n  await lab(labFootprint); await lab(labNews);\n  showQuizCore();\n}\nfunction showQuizCore(){")
r("🧩 تحدي المراجعة</button>", "🧠 تحدي الخبيرات</button>", s.count("🧩 تحدي المراجعة</button>"))
for a, b in [("'كفو! خلّصتِ الجزر 🧩 اضغطي على تحدي المراجعة'", "'كفو! خلّصتِ الجزر 🧠 اضغطي على تحدي الخبيرات'"),
             ("'مبروك! صرتِ بطلة الأمان الرقمي 🏆 اضغطي على الشهادة'", "'مبروك! صرتِ خبيرة الأمان الرقمي 🏆 اضغطي على الشهادة'")]:
    if s.count(a) == 1: s = s.replace(a, b)

# certificate
r("<h2 style=\"color:var(--grape)\">شهادة بطلة الأمان الرقمي</h2>", "<h2 style=\"color:var(--grape)\">شهادة خبيرة الأمان الرقمي</h2>")
r("هزمت الثعلبة المحتالة، وتعرف القواعد الأربع:", "اجتازت تحديات الأمن السيبراني والمواطنة الرقمية:")
i = s.index("const rules = ['كلمة المرور سر"); j = s.index('];', i) + 2
s = s[:i] + "const rules = ['كلمة مروري سر، طويلة، ومعها تحقق بخطوتين', 'أتحكم بوقتي، مو الخوارزمية', 'أحمّل من المصدر الرسمي، وأعطي أقل الأذونات', 'أحمي بياناتي، وأوثّق وأبلّغ وأقول لأهلي'];" + s[j:]

# the labs themselves
r("/* ================= ISLAND 1: password ================= */", LABS + "\n/* ================= ISLAND 1: password ================= */")
i = s.index("</style>"); s = s[:i] + LABCSS + "\n" + s[i:]
# points: correct answers, finished islands and the review all count toward the rank
r("function right(text){ sfx.good(); if (text) toast(text, 'good'); }", "function right(text){ sfx.good(); xpAdd(5); if (text) toast(text, 'good'); }")
r("async function finish(i, stars, rule, parent){", "async function finish(i, stars, rule, parent){\n  xpAdd(stars * 15);")
r("if (ok){ score++; sfx.good(); }", "if (ok){ score++; sfx.good(); xpAdd(10); }")
r("await lab(labFootprint); await lab(labNews);", "await lab(labFootprint); await lab(labNews); await lab(labCases);")
r('<div class="badges">${ISL.map((d, k) => badge(k, S.stars[k] > 0)).join(\'\')}</div>',
  '<div class="badges">${ISL.map((d, k) => badge(k, S.stars[k] > 0)).join(\'\')}</div>\n    <p class="rankline">${rankOf(S.xp || 0)[2]} الرتبة: ${rankOf(S.xp || 0)[1]} · ⚡ ${AR(S.xp || 0)} نقطة</p>\n    ${(S.ach || []).length ? `<div class="achs">${S.ach.map(k => `<span>${ACH[k][0]} ${ACH[k][1]}</span>`).join(\'\')}</div>` : \'\'}')
# narrator voices only (neutral lines), no recordings made for small children
r("  return; // the teen edition plays no recorded lines\n", "  if (!['g0', 'g1', 'g2', 'g3', 'g4', 'g5', 'g6'].includes(id)) return;\n")
r("await lab(labDark); await lab(labHabits);", "await lab(labDark); await lab(labHabits); await lab(labGreen);")
r("'هلا {name}! يلا نحمي الجزر من الثعلبة 🦊'", "'هلا {name}! فيه هاكر يحاول يخترق الجزر. فريق الأمن محتاجك 🛡️'")
r("FOX = 'الثعلبة المحتالة'", "FOX = 'الهاكر المجهول'")
r("<h2>هلا! أنا أمينة 🤖</h2>", "<h2>هلا! أنا أمينة، مساعدتك الذكية 🤖</h2>")
r("كشفتيها! الدعم الحقيقي ما يطلب كلمة المرور أبداً 🦊", "كشفتيه! الدعم الحقيقي ما يطلب كلمة المرور أبداً 🕶️")
r("say:'التطبيقات مصممة تخليك تقعدين أطول ⏳ أنتِ اللي تتحكمين بوقتك، مو الخوارزمية.'", "say:'التطبيقات مصممة تخليك تقعدين أطول ⏳ أنتِ اللي تتحكمين بوقتك، مو الخوارزمية. وحتى أجهزتك لها أثر على البيئة 🌍'")
# island names for teens (the four topics stay the same)
for o, n, so, sn in [('جزيرة الكنز', 'حصن الحسابات', 'الكنز', 'الحصن'), ('جزيرة الوقت', 'واحة التوازن', 'الوقت', 'الواحة'), ('جزيرة الهدايا', 'مرفأ الخصوصية', 'الهدايا', 'المرفأ'), ('جبل الأسرار', 'برج التواصل', 'الأسرار', 'البرج')]:
    r(f"name:'{o}', region:'', short:'{so}'", f"name:'{n}', region:'', short:'{sn}'")
# more narrator lines she can record (t1..t5); a missing file simply stays silent
r("  if (!['g0', 'g1', 'g2', 'g3', 'g4', 'g5', 'g6'].includes(id)) return;\n", "  if (!['g0', 'g1', 'g2', 'g3', 'g4', 'g5', 'g6', 't1', 't2', 't3', 't4', 't5'].includes(id)) return;\n")
r("    await quiet(talk([['robot', ROBO, 'هلا {name}! فيه هاكر يحاول يخترق الجزر. فريق الأمن محتاجك 🛡️']]));", "    voice('t1'); await quiet(talk([['robot', ROBO, 'هلا {name}! فيه هاكر يحاول يخترق الجزر. فريق الأمن محتاجك 🛡️']]));")
r("  await lab(labFootprint); await lab(labNews); await lab(labCases);", "  voice('t4'); await lab(labFootprint); await lab(labNews); await lab(labCases);")
i = s.index if False else None
r("  speak(`مبروك يا ${S.name}! صرتِ بطلة الأمان الرقمي.`);", "  voice('t5');")
# her look: colour on the setup card, dark mode in settings
r('    <button class="btn go big" id="go">يلا!</button>', '    ${lookPicker()}\n    <button class="btn go big" id="go">يلا!</button>')
r("  speak('هلا! اكتبي اسمك، واختاري شخصيتك.', true);", "  speak('هلا! اكتبي اسمك، واختاري شخصيتك.', true); wireLook();")
r('<button class="mrow" id="mReset">', '<button class="mrow" id="mDark"></button><button class="mrow" id="mReset">')
r("function soundIcons(){", "function soundIcons(){ if ($('#mDark')) $('#mDark').textContent = S.dark !== false ? '🌙 الوضع الداكن: شغال' : '☀️ الوضع الفاتح: شغال';")
r("$('#mReset').onclick", "$('#mDark').onclick = () => { S.dark = S.dark === false; save(); applyLook(); soundIcons(); };\n$('#mReset').onclick")
# drop the link lab (a colleague's booth covers phishing links)
r("  await lab(labPassword); await lab(labPhish);", "  await lab(labPassword);")
# recorded lines for the teen edition
r("  if (!['g0', 'g1', 'g2', 'g3', 'g4', 'g5', 'g6', 't1', 't2', 't3', 't4', 't5'].includes(id)) return;\n",
  "  if (!['g0', 'g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'a1', 'i1', 'i2', 'i3', 'i4', 'r1', 'm1', 'h1', 'h2', 't2', 't3', 't4', 't5', 't7', 't8'].includes(id)) return;\n")
r("    voice('t1'); await quiet(talk(", "    voice('a1'); await quiet(talk(")
for o, n in [("vid:'l1'", "vid:'r1'"), ("vid:'l2'", "vid:'h1'"), ("vid:'l3'", "vid:'m1'"), ("vid:'l4'", "vid:'h2'")]: r(o, n)
for num, v in [('١', 'i1'), ('٢', 'i2'), ('٣', 'i3'), ('٤', 'i4')]:
    r(f"await lessonCard({{ num:'{num}',", f"await lessonCard({{ vid:'{v}', num:'{num}',")
r("    speak(all);\n    $('#lsSpeak')", "    speak(all); if (L.vid) voice(L.vid);\n    $('#lsSpeak')")
r("async function finish(i, stars, rule, parent){\n  xpAdd(stars * 15);", "async function finish(i, stars, rule, parent){\n  xpAdd(stars * 15); voice('t8');")
# the teen welcome and topics intro, in place of the children's welcome
r("welcomed = true; voice('g0'); };", "welcomed = true; voice('w1'); voice('w2', true); };")
r("'t2', 't3', 't4', 't5', 't7', 't8'].includes(id)) return;", "'t2', 't3', 't4', 't5', 't7', 't8', 'w1', 'w2'].includes(id)) return;")
# stopwatch: starts with her name, stops at the certificate
r("const first = !S.name; S.name = v; save();", "const first = !S.name; S.name = v; if (first || !S.t0){ S.t0 = Date.now(); S.tEnd = 0; } save();")
r('    <p class="rankline">', '    <p class="timeline">⏱️ وقتك: ${(S.tEnd = S.tEnd || Date.now(), save(), playTime())}</p>\n    <p class="rankline">')
# teen theme on top of everything
TEENCSS = open(os.path.join(os.path.dirname(__file__), 'teen.css')).read()
def scope(css, pre='html.dk'):
    # put every theme rule under html.dk, so the light look comes back when it is off
    out, i, n = [], 0, len(css)
    def sel(x):
        parts = []
        for q in x.split(','):
            q = q.strip()
            if not q: continue
            if q == ':root': parts.append(pre)
            elif q.startswith('html'): parts.append(pre + q[4:])
            else: parts.append(pre + ' ' + q)
        return ','.join(parts)
    while i < n:
        j = css.find('{', i)
        if j < 0: out.append(css[i:]); break
        head = css[i:j]; k, d = j + 1, 1
        while d: d += {'{': 1, '}': -1}.get(css[k], 0); k += 1
        body = css[j + 1:k - 1]
        h = re.sub(r'/\*.*?\*/', '', head, flags=re.S).strip()
        if h.startswith('@media'): out.append(f'{h}{{{scope(body, pre)}}}\n')
        elif h.startswith('@'): out.append(f'{h}{{{body}}}\n')
        else: out.append(f'{sel(h)}{{{body}}}\n')
        i = k
    return ''.join(out)
THEME, FEAT = TEENCSS.split('/* points, rank, achievements, tips */')
TEENCSS = ':root{--font:"Tajawal",system-ui,sans-serif;--glass:rgba(13,18,36,.88);--line:rgba(148,163,255,.26);--txt:#e8eefc;--cy:#22d3ee}\n.swatches{display:flex;gap:10px;justify-content:center}.sw{width:38px;height:38px;border-radius:50%;border:3px solid rgba(255,255,255,.6);padding:0}.sw[aria-pressed="true"]{outline:3px solid var(--ink);outline-offset:2px;transform:scale(1.12)}\n' + scope(THEME) + FEAT
i = s.index("</style>"); s = s[:i] + TEENCSS + "\n" + s[i:]
r('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Baloo+Bhaijaan+2:wght@500;600;700;800&display=swap">',
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Tajawal:wght@500;700;800&family=Lalezar&display=swap">')
r('<div class="card cert"><div style="width:84px">${pRobot()}</div>', '<div class="card cert"><div class="crest">🛡️</div><p class="eyebrow">🏅 وسام البطل الرقمي</p>')
r('تشهد أمينة إن البطلة', 'تشهد جزر أمان إن الخبيرة')


os.makedirs(R + 'teen', exist_ok=True)
open(R + 'teen/index.html', 'w').write(s)
print('teen built', len(s))
