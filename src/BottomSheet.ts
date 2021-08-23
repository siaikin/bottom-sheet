import {html, LitElement, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {IBottomSheetConfig, IBottomSheetItemOptions, IBottomSheetItemParams} from "./IBottomSheet";
import {vector} from "./Utils";

@customElement('bottom-sheet')
export class BottomSheet extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    .test-border {
      box-sizing: border-box;
      border: 1px red dashed;
    }
    .bs-wrapper {
      position: relative;
      overflow: hidden;
      width: 100%;
      height: 100%;
    }
    .bs-item {
      position: absolute;
      width: 100%;
      left: 0;
    }
  `;

  @property({
    attribute: 'item',
    type: String,
    hasChanged(value: unknown, oldValue: unknown): boolean {
      console.log(value, oldValue);
      return true;
    }
  })
  item: string = '';

  @property({ attribute: 'slots', type: Array })
  slots: Array<string> = [];

  private _config: IBottomSheetConfig;
  private _selectionDOMMapToBottomSheetItem: Map<HTMLSelectElement, IBottomSheetItemParams>;
  private _startTouch?: Touch;
  private _lastTouch?: Touch;
  private _curSection?: HTMLSelectElement;
  private _bsRect: DOMRect;

  constructor() {
    super();

    this._config = {items: {}};
    this._selectionDOMMapToBottomSheetItem = new Map<HTMLSelectElement, IBottomSheetItemParams>();
    this._bsRect = this.getBoundingClientRect();
  }

  connectedCallback() {
    super.connectedCallback();

    this._bsRect = this.getBoundingClientRect();
    const items: Record<string, IBottomSheetItemOptions> = {};
    this.slots.forEach((name) => items[name] = {name, visibleHeightList: [0, '30%', '100%'], visibleHeight: 0});
    this._config = {
      items
    };
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    console.log('disconnectedCallback');
  }

  setConfig(_config: Partial<IBottomSheetConfig> = {}): void {
    _config.items = _config.items || {};
    const config = JSON.parse(JSON.stringify(_config));

    Object.keys(config.items)
      .forEach((name) => {
        const entity = Array.from(this._selectionDOMMapToBottomSheetItem.entries())
                            .find(([, params]) => params.name === name);
        if (!entity) return;

        this._config.items[name] = {
          ...this._config.items[name],
          ...config.items[name]
        };
        this._selectionDOMMapToBottomSheetItem.set(
          entity[0],
          this._initSectionParams(entity[0], this._config.items[name])
        );
        this._updateSectionPosition(entity[0], this._selectionDOMMapToBottomSheetItem.get(entity[0])!);
      })

    this.requestUpdate();
  }

  handleSlotChange(ev: Event) {
    const slot = ev.target as HTMLSlotElement,
          section = slot ? slot.parentNode as HTMLSelectElement : undefined;

    if (!slot || !section) return;
    const options = this._config.items[slot.name];

    if (!options) throw new Error(`cannot find item[${slot.name}] options`);

    this._selectionDOMMapToBottomSheetItem.set(section, this._initSectionParams(section, options));
  }

  handleTouchStart(ev: TouchEvent) {
    this._startTouch = this._lastTouch = ev.changedTouches[0];
    this._curSection = ev.currentTarget as HTMLSelectElement;
  }

  handleTouchMove(ev: TouchEvent) {
    if (!this._curSection) return;

    const touch = Array.from(ev.changedTouches).find((touch) => touch.identifier === this._lastTouch?.identifier),
          options = this._selectionDOMMapToBottomSheetItem.get(this._curSection);
    if (
        !touch ||
        !options ||
        !this._lastTouch
    ) return;

    const vec = vector(this._lastTouch, touch);
    this._lastTouch = touch;

    options.visibleHeight += -vec[1];

    this._updateSectionPosition(this._curSection, options);
  }

  handleTouchEnd(ev: TouchEvent) {
    if (!this._curSection) return;

    const endTouch = Array.from(ev.changedTouches).find((touch) => touch.identifier === this._startTouch?.identifier),
          options = this._selectionDOMMapToBottomSheetItem.get(this._curSection);

    if (
      !endTouch ||
      !options ||
      !this._startTouch
    ) return;

    const vec = vector(this._startTouch, endTouch);

    //  移动距离像素小于10像素认为用户是点击操作, 将其忽略
    if (Math.abs(vec[1]) < 10) return;

    const visibleH = options.visibleHeight;
    //  下滑
    if (vec[1] > 0) {
      const nextH = options.visibleHeightList.slice().reverse().find((h) => h <= visibleH) ||
                    options.visibleHeightList[0];

      options.visibleHeight = nextH as number;
    } else {
      const nextH = options.visibleHeightList.find((h) => h >= visibleH) ||
                    options.visibleHeightList[options.visibleHeightList.length - 1];

      options.visibleHeight = nextH as number;
    }
    this._updateSectionPosition(this._curSection, options);
  }

  render() {
    const slots = this.slots
                  ? this.slots.map((name) => html`
                      <section
                        class="bs-item test-border"
                        @touchstart="${this.handleTouchStart}"
                        @touchmove="${this.handleTouchMove}"
                        @touchend="${this.handleTouchEnd}"
                      >
                        <slot name="${name}" @slotchange="${this.handleSlotChange}"></slot>
                      </section>`
                    )
                  : undefined;

    return html`
      <article class="bs-wrapper test-border">
        ${slots}
      </article>
    `;
  }

  private _updateSectionPosition(section: HTMLSelectElement, options: IBottomSheetItemParams): void {
    let visibleH;
    visibleH = options.visibleHeight;

    section.style.top = `${this._bsRect.height - visibleH}px`;
  }

  private _initSectionParams(section: HTMLSelectElement, options: IBottomSheetItemOptions): IBottomSheetItemParams {
    const rect = section.getBoundingClientRect(),
          visibleHeightList: Array<number> = options.visibleHeightList
            .map((h) => typeof h === 'string' ? rect.height * parseInt(h) * 1e-2 : h);

    return {
      ...options,
      visibleHeightList,
      visibleHeight     : typeof options.visibleHeight === 'string'
        ? rect.height * parseInt(options.visibleHeight) * 1e-2
        : options.visibleHeight,
      width             : rect.width,
      height            : rect.height
    };
  }

}

