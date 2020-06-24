import {gsap} from 'gsap';
import Nav from './nav';
import EnterActionCTRL from './enterAction';
import { map, lerp, getMousePos, calcWinsize, getRandomNumber } from './utils';

// Calculate the viewport size
let winsize = calcWinsize();
window.addEventListener('resize', () => winsize = calcWinsize());

// Track the mouse position
let mousepos = {x: winsize.width/2, y: winsize.height/2};
window.addEventListener('mousemove', ev => mousepos = getMousePos(ev));

// Grid (.content__slide-item element)
class GridItem {
    constructor(el) {
        this.DOM = {el: el};
        this.layout();
        // amounts to move in each axis
        this.translationVals = {tx: 0, ty: 0};
        // get random start and end movement boundaries
        this.xstart = getRandomNumber(10,30);
        this.ystart = getRandomNumber(10,25);
        this.calcRect();
        window.addEventListener('resize', () => this.calcRect());
    }
    layout() {
        const bgImage = this.DOM.el.style.backgroundImage.match(/url\(["']?([^"']*)["']?\)/)[1];

        // Extra element for scaling animations
        this.DOM.image = document.createElement('div');
        gsap.set(this.DOM.glitch, {opacity: 1});
        this.DOM.image.classList.add('content__slide-img');
        this.DOM.imageInner = document.createElement('div');
        this.DOM.imageInner.classList.add('content__slide-imginner');
        this.DOM.imageInner.style.backgroundImage = `url(${bgImage})`;
        this.DOM.image.appendChild(this.DOM.imageInner);
        this.DOM.el.appendChild(this.DOM.image);
        // Build the necessary glitch structure (5 glitch__img divs each with a bg image)
        this.DOM.glitch = document.createElement('div');
        gsap.set(this.DOM.glitch, {opacity: 0});
        this.DOM.glitch.classList.add('glitch');        
        this.DOM.glitch.innerHTML = Array.from({length:5}).map(_ => `<div class="glitch__img" style="background-image:url(${bgImage})"></div>`).join('');
        this.DOM.el.style.backgroundImage = 'none';
        this.DOM.el.appendChild(this.DOM.glitch);
    }
    calcRect() {
        this.rect = this.DOM.el.getBoundingClientRect();
    }
    getRect() {
        return this.rect;
    }
    start() {
        if ( !this.requestId ) {
            this.requestId = requestAnimationFrame(() => this.render());
        }
    }
    stop() {
        if ( this.requestId ) {
            window.cancelAnimationFrame(this.requestId);
            this.requestId = undefined;
        }
    }
    // translate the item as the mouse moves
    render() {
        this.requestId = undefined;
        // Calculate the amount to move.
        // Using linear interpolation to smooth things out. 
        // Translation values will be in the range of [-start, start] for a cursor movement from 0 to the window's width/height
        this.translationVals.tx = lerp(this.translationVals.tx, map(mousepos.x, 0, winsize.width, this.xstart, -this.xstart), 0.07);
        this.translationVals.ty = lerp(this.translationVals.ty, map(mousepos.y, 0, winsize.height, this.ystart, -this.ystart), 0.07);
        gsap.set(this.DOM.el, {x: this.translationVals.tx, y: this.translationVals.ty});
        
        // loop
        this.start();
    }
}

// Grid (.content__slide element)
class Grid {
    constructor(el, isCurrent = false) {
        this.DOM = {el: el};
        // grid items
        this.DOM.items = [...this.DOM.el.querySelectorAll('.content__slide-item')];
        // GridItem obj array
        this.gridItems = [];
        this.DOM.items.forEach(item => this.gridItems.push(new GridItem(item)));
        // Total number of items
        this.itemsTotal = this.gridItems.length;
        // Grid's texts
        this.DOM.texts = [...this.DOM.el.querySelectorAll('.content__slide-text > .text')];
        
        this.isCurrent = !isCurrent;
        
        if ( this.isCurrent ) {
            // start the grid item's movement (mousemove)
            this.startMovement();
        }
    }
    // hide the current grid
    hide(direction) {
        this.stopMovement();
        
        return new Promise(resolve => {
            const imageElems = this.gridItems.map(item => item.DOM.image);

            gsap
            .timeline({
                onComplete: () => {
                    this.DOM.el.classList.remove('content__slide--current');
                    this.isCurrent = false;
                    resolve();
                }
            })
            // translate and fade out the items
            .to(imageElems, 0.6, {
                ease: 'Power3.easeInOut',
                y: direction === -1 ? '100%' : '-100%',
                opacity: 0,
                stagger: 0.02,
                onComplete: () => gsap.set(imageElems, {y: 0})
            }, 0)
            // animate the grid's texts out
            .to(this.DOM.texts, 0.6, {
                ease: 'Power3.easeInOut',
                y: direction === -1 ? '50%' : '-50%',
                opacity: 0,
                stagger: direction * 0.1
            }, 0)
            // animate the body color
            .to(document.body, {
                duration: 0.4,
                ease: 'Power2.easeOut',
                backgroundColor: '#c19971'
            }, 0.2);
        });
    }
    // show the next grid items
    show(direction, opts) {
        // start the grid item's movement (mousemove)
        this.startMovement();

        return new Promise(resolve => {
            const imageElems = this.gridItems.map(item => item.DOM.image);
            const glitchElems = this.gridItems.map(item => item.DOM.glitch);

            gsap
            .timeline({
                // this grid becomes the current one
                onStart: () => {
                    this.DOM.el.classList.add('content__slide--current');
                    this.isCurrent = true;
                },
                onComplete: resolve
            })
            .addLabel('start')
            // Set the items to be in the center of the viewport, scaled, rotated and not visible
            .set(imageElems, {
                // set x,y so the item is in the center of the viewport
                x: pos => {
                    const rect = this.gridItems[pos].getRect();
                    return winsize.width/2 - rect.left - rect.width/2;
                },
                y: pos => {
                    const rect = this.gridItems[pos].getRect();
                    return winsize.height/2 - rect.top - rect.height/2;
                },
                // randomly rotate the item
                rotation: () => getRandomNumber(-10,10),
                // scale it up
                scale: 2,
                // hide it
                opacity: 0
            })
            // now show each item one after the other
            .set(imageElems, {
                opacity: 1,
                stagger: 0.1
            }, 'start+=0.1')
            .addLabel('visible')
            // animate the body color
            .to(document.body, {
                duration: 0.5,
                ease: 'Power2.easeOut',
                backgroundColor: getComputedStyle(document.body).getPropertyValue('--color-bg'),
                //delay: 0.8
            }, 'visible+=0.1')
            // And once they are all stacked, animate each one to their default positions
            .to(imageElems, 0.9, {
                ease: 'Expo.easeOut',
                x: 0,
                y: 0,
                rotation: 0,
                scale: 1,
                stagger: 0.05
            }, 'visible+=0.1')
            // Adding a custom callback (after all the items are back in the grid)
            .add(() => opts?.halfWayCallback())
            // Set the grid texts to be translated up/down and hidden
            .set(this.DOM.texts, {
                y: direction === -1 ? '-50%' : '50%',
                opacity: 0,
            }, 'start')
            // Then animate them in
            .to(this.DOM.texts, 0.9, {
                ease: 'Expo.easeOut',
                y: 0,
                opacity: 1,
                stagger: direction * 0.15
            }, 'visible+=0.6');
        });
    }
    // start the grid item's movement (mousemove)
    startMovement() {
        this.gridItems.forEach(item => item.start());
    }
    // stop the grid item's movement (mousemove)
    stopMovement() {
        this.gridItems.forEach(item => item.stop());
    }
    // Trigger the CSS glitch effect
    startGlitch() {
        // Add the CSS class
        this.DOM.el.classList.add('content__slide--glitch');
        // After the CSS animation is over remove the class
        let iterationCount = this.itemsTotal;
        this.DOM.el.addEventListener('animationend', () => {
            --iterationCount;
            if ( !iterationCount ) {
                this.DOM.el.classList.remove('content__slide--glitch');  
            }
        });
    }
    // Stop the CSS glitch effect
    stopGlitch() {
        this.DOM.el.classList.remove('content__slide--glitch');
    }
}

export default class Slideshow {
    constructor(grids) {
        this.DOM = {grids: [...grids]};
        // grids grids
        this.grids = [];
        this.DOM.grids.forEach((grid, pos) => this.grids.push(new Grid(grid, pos)));
        // Slideshow navigation
        this.nav = new Nav(document.querySelector('.frame__nav'));
        // Enter grid control (circle element)
        this.enterCtrl = new EnterActionCTRL(document.querySelector('.content__action'));
        this.current = 0;
        this.initEvents();
    }
    initEvents() {
        // Navigation click
        this.nav.on('click', (nextPage) => {
            if ( this.isAnimating ) return;
            this.nav.update();
            this.navigate(nextPage);
        });

        // CSS Glitch animation
        // On hover, start the glitch effect
        this.enterCtrl.on('enter', () => this.grids[this.current].startGlitch());
        this.enterCtrl.on('leave', () => this.grids[this.current].stopGlitch());
    }
    // hides the current grid and shows the next one
    navigate(nextPage) {
        if ( this.isAnimating ) return;
        this.isAnimating = true;

        const direction = this.current < nextPage ? 1 : -1;
        // hide the circle element
        this.enterCtrl.hide(direction);
        this.grids[this.current].hide(direction)
        .then(() => this.grids[nextPage].show(direction, {halfWayCallback: () => this.enterCtrl.show(direction)}))
        .then(() => {
            this.current = nextPage;
            this.isAnimating = false;
        });
    }
}