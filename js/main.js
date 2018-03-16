$(document).ready(function () {
    if (matchMedia) {
        var mq = window.matchMedia("(min-width: 1024px)");
        mq.addListener(WidthChange);
        WidthChange(mq);
    }

    function WidthChange(mq) {
        if (mq.matches) {
            $("#algorithms").addClass("show");
            $("#datastructures").addClass("show");
        }
        else {
            $("#algorithms").removeClass("show");
            $("#datastructures").removeClass("show");
        }
    }
});