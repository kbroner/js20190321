export default class BaseComponent {
  on(eventType, callback) {
    this._el.addEventListener(eventType, callback);
  }
}