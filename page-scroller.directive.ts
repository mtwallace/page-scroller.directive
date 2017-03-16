import { Directive, HostListener, Input } from '@angular/core'

@Directive({
    selector: '[scrollPage]'
})

export class PageScroller {
    @Input('scrollPage') target: any;
    @Input() duration: number;
    @Input() offset: number;
    @Input() elementFocus: boolean;

    distance: number;
    location: number;
    element: any;
    start: number;
    stop: number;
    timeStart: number;
    timeElapsed: number;

    @HostListener('click') onClick() {
        this.jump(this.target);
    }

    private jump(target) {
        var offset = this.offset || 0;
        this.start = this.getLocation();
        
        switch (typeof target) {
            case 'number':
                this.element = undefined;
                this.stop = this.start + target;
                break;

            case 'object':
                this.element = target;
                this.stop = this.top(this.element);
                break;

            case 'string':
                this.element = document.querySelector(target);
                this.stop = this.top(this.element);
                break;
        }
        
        this.distance = this.stop - this.start + offset;
        
        requestAnimationFrame(this.loop);
    }

    private loop = (timeCurrent) => {
        if (!this.timeStart) this.timeStart = timeCurrent;

        var duration = this.duration || 1000;
        this.timeElapsed = timeCurrent - this.timeStart;
        var next = this.easing(this.timeElapsed, this.start, this.distance, duration);
        
        window.scrollTo(0, next);

        this.timeElapsed < this.duration
            ? requestAnimationFrame(this.loop)
            : this.done();
    }

    private getLocation() {
        return window.scrollY || window.pageYOffset;
    }

    private top(element) {
        return element.getBoundingClientRect().top + this.start;
    }

    // Generate new easing functions here: http://www.timotheegroleau.com/Flash/experiments/easing_function_generator.htm
    private easing(timeElapsed, startTime, distance, duration) {
        timeElapsed /= duration / 2;
        if (timeElapsed < 1) return distance / 2 * timeElapsed * timeElapsed + startTime;
        timeElapsed--;
        return -distance / 2 * (timeElapsed * (timeElapsed - 2) - 1) + startTime;
    }

    private done() {
        window.scrollTo(0, this.start + this.distance);
        
        var elementFocus = this.elementFocus || false;
        
        if (this.element && elementFocus) {
            this.element.setAttribute('tabindex', '-1');
            this.element.focus();
        }

        this.timeStart = 0;
    }
}
