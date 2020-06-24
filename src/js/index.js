import { preloadImages, preloadFonts } from './utils';
import Slideshow from './slideshow';

// Preload  images and fonts
Promise.all([preloadImages('.content__slide-item', {background: true}), preloadFonts('qhm2ggg')]).then(() => {
    // Remove loader (loading class)
    document.body.classList.remove('loading');
    
    // Initialize stuff
    new Slideshow(document.querySelectorAll('.content__slide')); 
});

