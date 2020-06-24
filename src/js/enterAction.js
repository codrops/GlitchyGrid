import { EventEmitter } from 'events';
import gsap from 'gsap';
import { map, lerp, getMousePos, calcWinsize, distance } from './utils';

// Calculate the viewport size
let winsize = calcWinsize();
window.addEventListener('resize', () => winsize = calcWinsize());

// Track the mouse position
let mousepos = {x: winsize.width/2, y: winsize.height/2};
window.addEventListener('mousemove', ev => mousepos = getMousePos(ev));

export default class EnterActionCTRL extends EventEmitter {
    constructor(el) {
        super();
        this.DOM = {el: el};
        this.DOM.text = this.DOM.el.querySelector('.content__action-text');
        // amounts to move in each axis
        this.translationVals = {tx: 0, ty: 0};
        // start movement boundaries
        this.calc();
        this.initEvents();
        requestAnimationFrame(() => this.render());
    }
    calc() {
        this.rect = this.DOM.el.getBoundingClientRect();
        this.boundingBox = {x: this.rect.width*0.9, y: this.rect.height*0.9};
    }
    initEvents() {
        this.DOM.el.addEventListener('mouseenter', () => this.emit('enter'));
        this.DOM.el.addEventListener('mouseleave', () => this.emit('leave'));
        this.onResize = () => this.calc();
        window.addEventListener('resize', this.onResize);
    }
    hide(direction) {
        this.toggle(false, direction);
    }
    show(direction) {
        this.toggle(true, direction);
    }
    toggle(show, direction) {
        gsap.to(this.DOM.el, {
            duration: show ? 0.5 : 0.3,
            ease: 'Power3.easeOut',
            opacity: +show
        });
    }
    render() {
        const d = distance(mousepos.x, this.rect.left + this.rect.width/2, mousepos.y, (this.rect.top + this.rect.height/2));
        const x = d < this.boundingBox.x ? mousepos.x - (this.rect.left + this.rect.width/2) : 0;
        const y = d < this.boundingBox.y ? mousepos.y - (this.rect.top + this.rect.height/2) : 0;
        this.translationVals.tx = lerp(this.translationVals.tx, x*.6, 0.17);
        this.translationVals.ty = lerp(this.translationVals.ty, y*.6, 0.17);
        gsap.set(this.DOM.el, {x: this.translationVals.tx, y: this.translationVals.ty});
        gsap.set(this.DOM.text, {x: -this.translationVals.tx*.12, y: -this.translationVals.ty*.12});

        requestAnimationFrame(() => this.render());
    }
}