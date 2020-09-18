<script>

chrome.desktopCapture.chooseDesktopMedia(
    ['screen', 'window'],
    port.sender.tab,
    onResponse
);
</script>