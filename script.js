async function generateMyApp() {
    const userIdea = document.getElementById("app-idea").value.trim();
    if (!userIdea) {
        alert("اكتب فكرتك أولاً يا بطل!");
        return;
    }

    document.getElementById("loading").style.display = "block";
    document.getElementById("result-area").style.display = "none";
    document.getElementById("preview-area").style.display = "none";

    // ⚠️ لا تنسى استبدال هذا المفتاح بمفتاح الـ API الخاص بك من Google AI Studio
    const apiKey = "ضع_مفتاح_API_الخاص_بك_هنا"; 
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    // التحقق من الخيارات المفعلة لحقنها تلقائياً في الطلب
    const wantsPrinting = document.getElementById("add-printing").checked ? "تلقائياً قم بحقن دالة طباعة تدعم window.print() ومتوافقة تماماً مع الطابعات الحرارية المحمولة عبر البلوتوث وتعمل عند الضغط على زر اتمام الطلب الفواتير." : "";
    const wantsFirebase = document.getElementById("add-firebase").checked ? "تلقائياً قم بتأسيس وتهيئة مكتبات Firebase Firestore في أعلى ملف الـ JS مع وضع إعدادات config وهمية ليقوم المستخدم باستبدالها لاحقاً لحفظ البيانات سحابياً." : "";

    // البرومبت الخارق الذي يحول فكرتك البسيطة إلى وصف هندسي متكامل
    const structuralSystemPrompt = `أنت مهندس برمجيات ومصمم واجهات (UI/UX) خبير جداً. 
    جاءك عميل بهذه الفكرة البسيطة: "${userIdea}".
    مهمتك الآن هي تضخيم هذه الفكرة وتحسينها تلقائياً لتصبح تطبيقاً احترافيًا، متناسق الألوان، عصري المظهر، وسريع جداً على شاشات الجوال.
    
    الميزات الإضافية المطلوب حقنها إجبارياً:
    ${wantsPrinting}
    ${wantsFirebase}

    يجب أن تكون النتيجة النهائية كود كامل وشغال وموزع على 3 ملفات (index.html و style.css و script.js).
    أخرج الرد كاملاً وبشكل صارم على هيئة نص JSON نظيف جداً (بدون كتابة علامات \`\`\`json أو أي نصوص خارجية على الإطلاق لكي لا ينكسر الكود). 
    تأكد أن يحتوي كائن الـ JSON على المفاتيح الثلاثة بالضبط:
    {
      "html": "كود الـ html هنا",
      "css": "كود الـ css هنا",
      "js": "كود الـ js هنا"
    }`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: structuralSystemPrompt }] }]
            })
        });

        const data = await response.json();
        let rawText = data.candidates[0].content.parts[0].text.trim();
        
        // تنظيف وحل مشكلة الماركداون إذا وجدت
        if (rawText.startsWith("```json")) {
            rawText = rawText.replace("```json", "").replace("```", "").trim();
        } else if (rawText.startsWith("```")) {
            rawText = rawText.replace("```", "").replace("```", "").trim();
        }

        const parsedCodes = JSON.parse(rawText);

        // وضع الأكواد في حقول النص للنسخ
        document.getElementById("code-html").value = parsedCodes.html;
        document.getElementById("code-css").value = parsedCodes.css;
        document.getElementById("code-js").value = parsedCodes.js;

        // 🔥 بناء المعاينة الحية الفورية داخل الـ iframe
        const previewFrame = document.getElementById("live-preview-frame");
        const iframeDocument = previewFrame.contentDocument || previewFrame.contentWindow.document;
        
        // دمج الملفات الثلاثة في كود واحد داخل الـ iframe ليعمل فوراً
        const combinedSource = `
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <style>${parsedCodes.css}</style>
            </head>
            <body>
                ${parsedCodes.html.replace(/<thead[\s\S]*?<\/thead>/g, match => match).replace(/<body[\s\S]*?>/g, '').replace(/<\/body>/g, '').replace(/<script[\s\S]*?<\/script>/g, '')}
                <script>${parsedCodes.js}<\/script>
            </body>
            </html>
        `;
        
        iframeDocument.open();
        iframeDocument.write(combinedSource);
        iframeDocument.close();

        // عرض النتائج وإخفاء شاشة التحميل
        document.getElementById("loading").style.display = "none";
        document.getElementById("preview-area").style.display = "block";
        document.getElementById("result-area").style.display = "block";

    } catch (error) {
        console.error(error);
        alert("حدث خطأ أثناء الاتصال بالذكاء الاصطناعي، تأكد من صحة الـ API Key الخاص بك!");
        document.getElementById("loading").style.display = "none";
    }
}

function copyCode(id) {
    const copyText = document.getElementById(id);
    copyText.select();
    navigator.clipboard.writeText(copyText.value);
    alert("تم نسخ الكود بنجاح! جاهز للصقه في جيت هاب 📋");
}
