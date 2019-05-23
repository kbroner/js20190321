import BaseComponent from '../BaseComponent/BaseComponent.js';

export class Filter extends BaseComponent {
    constructor({ element }) {
        super();
        this._el = element;
        this._render();

        this._el.addEventListener('input', debounce(e => {
            let value = e.target.value;
            let filterEvent = new CustomEvent('filter', { detail: value.toLowerCase() });
            this._el.dispatchEvent(filterEvent);
        }, 300))
    }

    _render() {
        this._el.innerHTML = `
            <div class="input-field col s4">
                <input type="text">
                <label for="first_name">Filter</label>
            </div>
        `
    }
}

function debounce(f, delay) {
  let timerId;
  return function wrapper(...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => { f.apply(this, args); }, delay);
  }
}

