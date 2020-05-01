new Pageable("#container", {
    pips: true,
    animation: 300,
    delay: 0,
    orientation: "horizontal",
    childSelector: "[data-anchor]",
    events: {
        wheel: true,
        mouse: false,
        touch: true,
        keydown: true
    }
});