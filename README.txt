jquery.touchDeviceWorkarrounds

if ($.touchDeviceWorkarrounds.isTargetDevice()) {
    var tdw = $(".modal").touchDeviceWorkarrounds();
    $(".modalOpener").on('click', function(){
        ...open modal
        tdw.emulatePositionFixedModalWithAbsolute(true);
        tdw.preventOverscrollBehindModal(true);
    });
    $(".modalCloser").on('click', function(){
        tdw.preventOverscrollBehindModal(false);
        tdw.emulatePositionFixedModalWithAbsolute(false);
        ...close modal
    });
}

