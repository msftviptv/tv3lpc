async function initPlayer() {
    // 1. تعريف العناصر الأساسية
    const video = document.getElementById('video');
    const ui = video['ui'];
    const controls = ui.getControls();
    const player = controls.getPlayer();

    // 2. إعدادات الشكل والزراير (نفس اللي كانت في ملفك)
    const uiConfig = {
        'controlPanelElements': [
            'play_pause', 'time_and_duration', 'spacer', 
            'mute', 'volume', 'quality', 'fullscreen', 'overflow_menu'
        ],
        'overflowMenuButtons': ['language', 'playback_rate', 'statistics', 'cast'],
        'addCustomButtons': true
    };
    ui.configure(uiConfig);

    // 3. إعدادات البث (عشان الـ User-Agent والـ CORS)
    player.configure({
        streaming: {
            jumpLargeGaps: true,
            lowLatencyMode: true,
            rebufferingGoal: 10
        }
    });

    // إضافة فلتر الـ User-Agent اللي اتفقنا عليه
    player.getNetworkingEngine().registerRequestFilter(function(type, request) {
        request.headers['User-Agent'] = 'VAVOO2/6';
    });

    // 4. الذكاء الجديد: نختار هنشغل إيه؟
    const urlParams = new URLSearchParams(window.location.search);
    const directUrl = urlParams.get('s');  // لو فيه رابط مباشر
    const channelId = urlParams.get('id'); // لو فيه ID

    try {
        if (directUrl) {
            // أ - لو بعت رابط مباشر: شغله علطول
            console.log("تشغيل رابط مباشر...");
            await player.load(decodeURIComponent(directUrl));
        } 
        else if (channelId) {
            // ب - لو بعت ID: روح اسأل السيرفر زي زمان
            console.log("جاري جلب بيانات القناة بالـ ID...");
            const response = await fetch(`https://your-api-server.com/api?id=${channelId}`);
            const data = await response.json();
            
            // لو القناة فيها تشفير (Keys)
            if (data.keyId && data.key) {
                player.configure({
                    drm: { clearKeys: { [data.keyId]: data.key } }
                });
            }
            await player.load(data.url);
        } else {
            console.error("لا يوجد رابط (s) ولا يوجد معرف (id)!");
        }
    } catch (e) {
        console.error("خطأ في التحميل:", e);
    }
}

// تشغيل عند جاهزية المكتبة
document.addEventListener('shaka-ui-loaded', initPlayer);
