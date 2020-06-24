const imagesLoaded = require('imagesloaded');

// Map number x from range [a, b] to [c, d]
const map = (x, a, b, c, d) => (x - a) * (d - c) / (b - a) + c;

// Linear interpolation
const lerp = (a, b, n) => (1 - n) * a + n * b;

const clamp = (num, min, max) => num <= min ? min : num >= max ? max : num;

const calcWinsize = () => {
    return {width: window.innerWidth, height: window.innerHeight};
};

const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

// Gets the mouse position
const getMousePos = (e) => {
    let posx = 0;
    let posy = 0;
    if (!e) e = window.event;
    if (e.pageX || e.pageY) {
        posx = e.pageX;
        posy = e.pageY;
    }
    else if (e.clientX || e.clientY)    {
        posx = e.clientX + body.scrollLeft + document.documentElement.scrollLeft;
        posy = e.clientY + body.scrollTop + document.documentElement.scrollTop;
    }
    
    return { x : posx, y : posy }
};

const distance = (x1,x2,y1,y2) => {
    var a = x1 - x2;
    var b = y1 - y2;

    return Math.hypot(a,b);
}

// Preload images
const preloadImages = (selector, opts) => {
    return new Promise((resolve) => {
        imagesLoaded(document.querySelectorAll(selector), opts, resolve);
    });
};

// Preload images
const preloadFonts = (id) => {
    return new Promise((resolve) => {
        WebFont.load({
            typekit: {
                id: id
            },
            active: resolve
        });
    });
};

export { 
    map, 
    lerp, 
    clamp, 
    calcWinsize, 
    getRandomNumber, 
    getMousePos,
    distance,
    preloadImages, 
    preloadFonts 
};