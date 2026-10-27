// 1. دالة التنقل بين التبويبات (Tabs)
function switchTab(tabId, btnElement) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('bg-burgundy', 'text-white');
        btn.classList.add('bg-darkcard', 'text-gray-300');
    });
    btnElement.classList.remove('bg-darkcard', 'text-gray-300');
    btnElement.classList.add('bg-burgundy', 'text-white');
}

// 2. قراءة البيانات من النموذج وتوليد التقرير
function generateClinicalReport() {
    // قراءة البيانات الأساسية وعوامل الخطورة
    const name = document.getElementById('childName').value || 'غير محدد';
    const age = parseInt(document.getElementById('childAge').value) || 4;
    const gender = document.getElementById('childGender').value;

    const riskFactorsCount = [
        document.getElementById('familyDisability').checked,
        document.getElementById('oxygenLack').checked,
        document.getElementById('pregnancyAccident').checked,
        document.getElementById('consanguinity').checked,
        document.getElementById('xrayExposure').checked,
        document.getElementById('pregnancyMeds').checked,
        document.getElementById('birthType').value === 'difficult',
        document.getElementById('motherAgeRisk').value === 'risk'
    ].filter(Boolean).length;

    // قراءة تاريخ النمو والفحص العضوي
    const developmentalDelays = [
        document.getElementById('teething').value === 'delayed',
        document.getElementById('crawling').value === 'delayed',
        document.getElementById('walking').value === 'delayed'
    ].filter(Boolean).length;

    const hearingIssues = document.getElementById('hearingIssues').checked;

    const organicIssuesCount = Array.from(document.querySelectorAll('.organic-check'))
        .filter(checkbox => checkbox.checked).length;

    // قراءة الأعراض السلوكية
    const beh = {
        attention: parseInt(document.getElementById('beh_attention').value),
        eyeContact: parseInt(document.getElementById('beh_eyeContact').value),
        hyperactivity: parseInt(document.getElementById('beh_hyperactivity').value),
        anxiety: parseInt(document.getElementById('beh_anxiety').value),
        shyness: parseInt(document.getElementById('beh_shyness').value),
        violence: parseInt(document.getElementById('beh_violence').value),
        fear: parseInt(document.getElementById('beh_fear').value),
        stubbornness: parseInt(document.getElementById('beh_stubbornness').value),
        incontinence: document.getElementById('beh_incontinence').checked
    };

    // قراءة التاريخ اللغوي
    const langHist = {
        babblingDelayed: document.getElementById('hist_babbling').value === 'delayed',
        firstWordDelayed: document.getElementById('hist_firstWord').value === 'delayed',
        sentencesDelayed: document.getElementById('hist_sentences').value === 'delayed',
        wordsCount: document.getElementById('hist_wordsCount').value
    };

    // قراءة اللغة الداخلية (من 0 إلى 8)
    const innerLang = {
        permanence: parseInt(document.getElementById('inner_permanence').value),
        causality: parseInt(document.getElementById('inner_causality').value),
        imitation: parseInt(document.getElementById('inner_imitation').value),
        constancy: parseInt(document.getElementById('inner_constancy').value)
    };
    const innerLangTotal = innerLang.permanence + innerLang.causality + innerLang.imitation + innerLang.constancy;

    // قراءة اللغة الاستقبالية (14 مجموعة)
    const allReceptiveBoxes = Array.from(document.querySelectorAll('.receptive-group'));
    const missingReceptiveGroups = allReceptiveBoxes.filter(cb => !cb.checked).map(cb => cb.value);
    const missingGroupsCount = missingReceptiveGroups.length;

    // قراءة اللغة التعبيرية
    const expLang = {
        phonetic: parseInt(document.getElementById('exp_phonetic').value),
        vocab: parseInt(document.getElementById('exp_vocab').value),
        narration: parseInt(document.getElementById('exp_narration').value),
        content: parseInt(document.getElementById('exp_content').value),
        context: parseInt(document.getElementById('exp_context').value)
    };
    const expLangTotal = expLang.phonetic + expLang.vocab + expLang.narration + expLang.content + expLang.context;

    // =========================================================================
    // أولاً: حساب نسبة صعوبات وبطء التعلم (من 100%)
    // =========================================================================
    let ldRawScore = 0;
    ldRawScore += (beh.attention / 3) * 25;                 // الانتباه والتركيز (25%)
    ldRawScore += (innerLangTotal / 8) * 25;                // الإدراك واللغة الداخلية (25%)
    ldRawScore += (missingGroupsCount / 14) * 25;           // الحصيلة الاستقبالية والمعرفية (25%)
    ldRawScore += ((expLang.content + expLang.narration) / 4) * 15; // تنظيم المضمون والسرد (15%)
    ldRawScore += (riskFactorsCount > 0 || developmentalDelays > 0) ? 10 : 0; // عوامل الخطورة والتأخر (10%)

    const ldPercentage = Math.min(Math.round(ldRawScore), 100);

    // =========================================================================
    // ثانياً: تقييم الاختبارات الـ 8 المطبقة (المذكورة في الورقة الأولى)
    // =========================================================================
    const appliedTests = [
        {
            name: "١- اختبار الذكاء (IQ)",
            required: developmentalDelays >= 1 || innerLangTotal >= 3 || riskFactorsCount >= 2,
            reason: (developmentalDelays >= 1 || innerLangTotal >= 3 || riskFactorsCount >= 2)
                ? "مطلوب لتحديد العمر العقلي نظراً لوجود تأخر نمائي أو قصور في مهارات اللغة الداخلية وعوامل الخطورة."
                : "المؤشرات الإدراكية الأولية لا تستدعي الإحالة الفورية."
        },
        {
            name: "٢- اختبار الفايلاند / الصورة الجانبية",
            required: beh.incontinence || developmentalDelays >= 2 || (innerLangTotal >= 4 && missingGroupsCount >= 7),
            reason: (beh.incontinence || developmentalDelays >= 2 || (innerLangTotal >= 4 && missingGroupsCount >= 7))
                ? "مطلوب لقياس السلوك التكيفي والنضج الاجتماعي (وجود عدم تحكم في البول أو تأخر نمائي شامل)."
                : "مهارات الاعتماد على النفس ضمن النطاق المقبول."
        },
        {
            name: "٣- اختبار اللغة",
            required: missingGroupsCount >= 4 || langHist.firstWordDelayed || expLang.vocab >= 1 || expLang.content >= 1,
            reason: (missingGroupsCount >= 4 || langHist.firstWordDelayed || expLang.vocab >= 1 || expLang.content >= 1)
                ? `مطلوب لتحديد العمر اللغوي (نقص في ${missingGroupsCount} مجموعة ضمنية أو تأخر في المفردات وتكوين الجمل).`
                : "الحصيلة اللغوية الاستقبالية والتعبيرية متناسبة مبدئياً."
        },
        {
            name: "٤- اختبار كارز (CARS) / جليام",
            required: beh.eyeContact >= 2 && (innerLang.imitation >= 1 || expLang.context >= 1),
            reason: (beh.eyeContact >= 2 && (innerLang.imitation >= 1 || expLang.context >= 1))
                ? "موصى به بقوة لوجود قصور واضح في التواصل البصري مع ضعف في التقليد (الانعكاسية) أو سياق الكلام."
                : "لا توجد مؤشرات طيف توحد صريحة."
        },
        {
            name: "٥- اختبار كونرز (Conners)",
            required: beh.hyperactivity >= 2 && beh.attention >= 2,
            reason: (beh.hyperactivity >= 2 && beh.attention >= 2)
                ? "مطلوب لتقييم اضطراب فرط الحركة وتشتت الانتباه (ADHD) بناءً على درجات النشاط الزائد وضعف التركيز."
                : "مستوى النشاط الحركي والانتباه لا يشير لاضطراب فرط حركة."
        },
        {
            name: "٦- اختبار النطق",
            required: organicIssuesCount > 0 || expLang.phonetic >= 1 || hearingIssues,
            reason: (organicIssuesCount > 0 || expLang.phonetic >= 1 || hearingIssues)
                ? `مطلوب لتقييم مخارج الحروف (تم رصد ${organicIssuesCount} مشكلة في الفحص العضوي أو تشوه في التركيب الصوتي).`
                : "أعضاء النطق والتركيب الصوتي سليم."
        },
        {
            name: "٧- اختبار التلعثم",
            required: !langHist.sentencesDelayed && expLang.narration >= 1 && (beh.anxiety >= 2 || beh.fear >= 2 || beh.shyness >= 2),
            reason: (!langHist.sentencesDelayed && expLang.narration >= 1 && (beh.anxiety >= 2 || beh.fear >= 2 || beh.shyness >= 2))
                ? "موصى به لوجود تعثر في السرد والحكاية مترافق مع درجات مرتفعة من القلق أو الخوف أو الخجل."
                : "لا توجد مؤشرات طلاقة كلامية نفسية."
        },
        {
            name: "٨- اختبار تدافع الكلام (دالي)",
            required: !langHist.sentencesDelayed && beh.hyperactivity >= 2 && (expLang.phonetic >= 1 || expLang.narration >= 1),
            reason: (!langHist.sentencesDelayed && beh.hyperactivity >= 2 && (expLang.phonetic >= 1 || expLang.narration >= 1))
                ? "موصى به لوجود سرعة واندفاع حركي يؤثر على وضوح التركيب الصوتي وتسلسل السرد."
                : "إيقاع الكلام لا يشير لتدافع."
        }
    ];

    // =========================================================================
    // ثالثاً: توليد البرنامج العلاجي المقترح (المحاور الـ 4 في الورقة الأولى)
    // =========================================================================
    const treatmentPlan = {
        attention: (beh.attention >= 1 || beh.eyeContact >= 1 || beh.hyperactivity >= 1)
            ? "جلسات تنمية الانتباه السمعي والبصري المشترك، تدريبات الجلوس الهادئ، تقليل المشتتات في بيئة التدريب، وأنشطة التآزر البصري الحركي."
            : "الانتباه والتركيز جيد؛ يُكتفى بأنشطة التركيز الاعتيادية المدمجة في الجلسات.",

        receptive: (missingGroupsCount > 0 || innerLangTotal > 0)
            ? `تنمية مهارات اللغة الداخلية (دوام الشيء، السببية، والتقليد)، والتدريب المكثف على تمييز المجموعات الضمنية غير المكتسبة: (${missingGroupsCount > 0 ? missingReceptiveGroups.join('، ') : 'مكتملة'}).`
            : "اللغة الاستقبالية مكتملة؛ الانتقال لتدريبات الفهم السمعي المتقدم وتنفيذ الأوامر المركبة.",

        expressive: (expLangTotal > 0 || langHist.firstWordDelayed || langHist.sentencesDelayed)
            ? "تحفيز الحصيلة اللغوية المنطوقة، التدريب على تكوين جمل من كلمتين إلى ثلاث كلمات، تنمية مهارات السرد القصصي المتسلسل، وتوظيف اللغة في سياقها الاجتماعي."
            : "اللغة التعبيرية سليمة؛ التركيز على إثراء المفردات المجردة والحوار المفتوح.",

        sounds: (organicIssuesCount > 0 || expLang.phonetic > 0)
            ? "تدريبات حركية لأعضاء النطق (تقوية عضلات اللسان والشفاه، تدريبات النفخ والشفط والمضغ) مع جلسات تصحيح مخارج الأصوات المشوهة."
            : "أعضاء النطق ومخارج الأصوات سليمة ولا تحتاج لتدخل عضوي."
    };

    // عرض النتائج في الواجهة
    renderReportUI(name, age, gender, ldPercentage, appliedTests, treatmentPlan);
}

// 3. دالة رسم النتائج في الـ DOM
function renderReportUI(name, age, gender, ldPercentage, appliedTests, treatmentPlan) {
    document.getElementById('report-patient-info').textContent = `الاسم: ${name} | العمر: ${age} سنوات | الجنس: ${gender}`;

    // تحديث شريط ونسبة صعوبات التعلم
    const badge = document.getElementById('ld-percentage-badge');
    const bar = document.getElementById('ld-progress-bar');
    const statusText = document.getElementById('ld-status-text');

    badge.textContent = `${ldPercentage}%`;
    bar.style.width = `${ldPercentage}%`;

    if (ldPercentage >= 60) {
        badge.className = "text-xl font-bold px-3 py-1 rounded bg-red-900/60 text-red-200 border border-red-500";
        bar.className = "bg-red-600 h-3.5 rounded-full transition-all duration-500";
        statusText.textContent = "⚠️ مؤشر مرتفع لوجود صعوبات أو بطء تعلم: يحتاج الطفل لتقييم قدرات عقلية وبرنامج تدخل فردي مكثف.";
    } else if (ldPercentage >= 35) {
        badge.className = "text-xl font-bold px-3 py-1 rounded bg-yellow-900/60 text-yellow-200 border border-yellow-500";
        bar.className = "bg-yellow-500 h-3.5 rounded-full transition-all duration-500";
        statusText.textContent = "⚡ مؤشر متوسط لصعوبات التعلم: توجد فجوات في الانتباه أو الاستيعاب تحتاج لجلسات تقوية وتكرار.";
    } else {
        badge.className = "text-xl font-bold px-3 py-1 rounded bg-green-900/60 text-green-200 border border-green-500";
        bar.className = "bg-green-600 h-3.5 rounded-full transition-all duration-500";
        statusText.textContent = "✅ مؤشر صعوبات التعلم منخفض: القدرات الإدراكية والاستيعابية الأساسية ضمن النطاق الطبيعي.";
    }

    // تحديث جدول الاختبارات الـ 8
    const tbody = document.getElementById('tests-table-body');
    tbody.innerHTML = '';
    appliedTests.forEach(test => {
        const statusBadge = test.required
            ? `<span class="px-2.5 py-1 rounded text-xs font-bold bg-burgundy text-white">مطلوب تطبيقه</span>`
            : `<span class="px-2.5 py-1 rounded text-xs bg-gray-800 text-gray-400">غير مطلوب حالياً</span>`;

        tbody.innerHTML += `
            <tr class="${test.required ? 'bg-red-950/20' : ''}">
                <td class="p-3 font-bold text-white">${test.name}</td>
                <td class="p-3">${statusBadge}</td>
                <td class="p-3 text-gray-300">${test.reason}</td>
            </tr>
        `;
    });

    // تحديث البرنامج العلاجي المقترح
    document.getElementById('plan-attention').textContent = treatmentPlan.attention;
    document.getElementById('plan-receptive').textContent = treatmentPlan.receptive;
    document.getElementById('plan-expressive').textContent = treatmentPlan.expressive;
    document.getElementById('plan-sounds').textContent = treatmentPlan.sounds;

    // إظهار التقرير والتمرير إليه
    const reportContainer = document.getElementById('report-container');
    reportContainer.classList.remove('hidden');
    reportContainer.scrollIntoView({ behavior: 'smooth' });
}