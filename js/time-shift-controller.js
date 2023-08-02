export class TimeShiftController extends HTMLElement {
  templateString = `
    <br/>
    <div id='stream_inputs'>
      <label class='stream_input_label' for='stream_start'>
        Stream start:
      </label>
      <input id='stream_start' type='datetime-local'><br />
    </div>
    <br/>
  `;

  shadowRoot = null;

  constructor() {
    super();
    const template = document.createElement('template');
    template.innerHTML = this.templateString;
    this.shadowRoot = this.attachShadow({ mode: 'closed' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.shadowRoot.querySelector('#stream_start').onchange = () => {
      this.streamStartChanged();
    };
  }

  streamStartChanged() {
    streamStart = new Date(this.shadowRoot.querySelector('#stream_start').value).toISOString();
    if (typeof extension !== 'undefined') {
      extension.setParameter({
        customParams: {
          cp1: 'cp1',
          cp2: 'cp2'
        },
        streamStart: streamStart
      });
    }
  }
}

window.customElements.define('time-shift-controller', TimeShiftController);
