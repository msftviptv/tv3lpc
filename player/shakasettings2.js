async function initPlayer() {
    const video = document.getElementById('video');
    const ui = video['ui'];
    const controls = ui.getControls();
    const player = controls.getPlayer();

    const uiConfig = {
        'controlPanelElements': [
            'play_pause', 'time_and_duration', 'spacer', 
            'mute', 'volume', 'quality', 'fullscreen', 'overflow_menu'
        ],
        'overflowMenuButtons': ['language', 'playback_rate', 'statistics', 'cast'],
        'addCustomButtons': true
    };
    ui.configure(uiConfig);

    player.configure({
        streaming: {
            jumpLargeGaps: true,
            lowLatencyMode: true,
            rebufferingGoal: 10
        }
    });

    // 1. رابط البروكسي الخاص بك في Cloudflare
    // استبدل الرابط ده بالرابط اللي طلعلك من Cloudflare
    const myProxy = "https://blue-paper-3226.03ab59a70f.workers.dev/?url=";

    const urlParams = new URLSearchParams(window.location.search);
    const directUrl = urlParams.get('s');  
    const channelId = urlParams.get('id'); 

    try {
        if (directUrl) {
            console.log("تشغيل عبر البروكسي...");
            
            // تنظيف الرابط من أي بارامترات زائدة تبدأ بـ &h_
            const cleanUrl = decodeURIComponent(directUrl).split('&h_')[0];
            
            // 2. التحميل من خلال البروكسي لتخطي الـ CORS والـ User-Agent
            await player.load(myProxy + encodeURIComponent(cleanUrl));
            
        } else if (channelId) {
            // الطريقة القديمة بالـ ID
            const response = await fetch(`https://your-api-server.com/api?id=${channelId}`);
            const data = await response.json();
            
            if (data.keyId && data.key) {
                player.configure({
                    drm: { clearKeys: { [data.keyId]: data.key } }
                });
            }
            await player.load(data.url);
        }
    } catch (e) {
        console.error("خطأ في التحميل:", e);
    }
}

document.addEventListener('shaka-ui-loaded', initPlayer);
