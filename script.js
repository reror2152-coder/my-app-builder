async function generateMyApp() {
    const idea = document.getElementById("app-idea").value.trim();
    if (!idea) {
        alert("الرجاء كتابة فكرة التطبيق أولاً يا بطل!");
        return;
    }

    // اظهر صندوق التحميل واخفِ النتائج السابقة
    document.getElementById("loading").style.display = "block";
    document.getElementById("result-area").style.display = "none";

    // ⚠️ ضع مفتاح الـ API الخاص بك من Google AI Studio هنا
    const apiKey = "ضع_مفتاح_API_الخاص_بك_هنا"; 
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    // هندسة البرومبت لجعل الذكاء الاصطناعي يلتزم بـ 3 ملفات فقط وبصيغة JSON ليسهل قصها
    const systemPrompt = `أنت مبرمج محترف ومساعد ذكي جداً. مهمتك هي أخذ فكرة التطبيق المكتوبة وتحويلها إلى تطبيق ويب كامل ومصمم بشكل احترافي وألوان متناسقة وجذاب وسريع الاستجابة على الجوال. يجب أن تعطيني النتيجة وتوزعها في 3 ملفات برمجية (index.html و style.css و script.js) وتضع الرد بالكامل على شكل نص JSON نظيف جداً وصحيح بدون أي علامات ماركداون (لا تضع \`\`\`json)، فقط كائن JSON يحتوي على المفاتيح التالية: "html" و "css" و "js" لتكون الأكواد جاهزة مباشرة للنسخ واللصق. فكرة التطبيق هي: ${idea}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt }] }]
            })
        });

        const data = await response.json();
        let rawText = data.candidates[0].content.parts[0].text.trim();
        
        // تنظيف النص لو وضع علامات كود بالخطأ
        if (rawText.startsWith("```json")) {
            rawText = rawText.replace("```json", "").replace("```", "").trim();
        } else if (rawText.startsWith("```")) {
            rawText = rawText.replace("```", "").replace("```", "").trim();
        }

        const parsedCodes = JSON.parse(rawText);

        // توزيع الأكواد في الصناديق الخاصة بها
        document.getElementById("code-html").value = parsedCodes.html;
        document.getElementById("code-css").value = parsedCodes.css;
        document.getElementById("code-js").value = parsedCodes.js;

        // اظهر منطقة النتائج واخفِ التحميل
        document.getElementById("loading").style.display = "none";
        document.getElementById("result-area").style.display = "block";

    } catch (error) {
        console.error(error);
        alert("حدث خطأ أثناء الاتصال بالذكاء الاصطناعي، تأكد من صحة مفتاح الـ API وصلاحية الإنترنت!");
        document.getElementById("loading").style.display = "none";
    }
}

// دالة النسخ السريع بضغطة زر
function copyCode(id) {
    const copyText = document.getElementById(id);
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(copyText.value);
    alert("تم نسخ الكود بنجاح! اذهب وضعه في ملفه بجيت هاب 📋");
}
