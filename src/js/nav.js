import {gsap} from 'gsap';
import { EventEmitter } from 'events';

class NavItem {
    constructor(el) {
        this.DOM = {el: el};
    }
    setCurrent() {
        this.isCurrent = true;
        this.slide();
    }
    unsetCurrent() {
        this.isCurrent = false;
        this.slide();
    }
    slide() {
        gsap
        .timeline()
        .set(this.DOM.el, {transformOrigin: '50% 0%'})
        .to(this.DOM.el, {
            duration: 0.2,
            scaleY: 0
        })
        .set(this.DOM.el, {transformOrigin: '50% 100%'})
        .add(() => this.DOM.el.classList[this.isCurrent ? 'add' : 'remove']('frame__nav-item--current'))
        .to(this.DOM.el, {
            duration: 0.5,
            ease: 'Expo.easeOut',
            scaleY: 1
        }, '+=0.2');
    }
}

export default class Nav extends EventEmitter {
    constructor(el) {
        super();
        this.DOM = {el: el};
        this.navItems = [];
        [...this.DOM.el.children].forEach(item => this.navItems.push(new NavItem(item)));
        this.current = 0;
        this.initEvents();
    }
    initEvents() {
        for (const [i, item] of this.navItems.entries()) {
            item.DOM.el.addEventListener('click', () => {
                this.cache = {upcomingItem: item, newpos: i};
                if ( this.current === this.cache.newpos ) return;
                this.emit('click', this.cache.newpos);
            });
        }
    }
    update() {        
        this.navItems[this.current].unsetCurrent();
        this.cache.upcomingItem.setCurrent();
        this.current = this.cache.newpos;
    }
}