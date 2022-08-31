export class OptinBox extends HTMLElement {
  templateString = `<div class='optionsbox inline'>
      <table>
        <tr>
          <td class='key'>Opt-in:</td>
          <td class='value'>
            <div class='radiobox'>
              <input type='radio' name='optin' class='radio' value='undefined' /><label for='undefined'
            >undefined</label
            ><input type='radio' name='optin' class='radio' value='false' /><label for='false'>false</label
            ><input type='radio' name='optin' class='radio' value='true' /><label for='true'>true</label>
            </div>
          </td>
        </tr>
      </table>
    </div>`;

  shadowRoot= null;
  constructor() {
    super();
    const template = document.createElement('template');
    template.innerHTML = this.templateString;
    this.shadowRoot = this.attachShadow({ mode: 'closed' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.addRadioButtonClickEvents()
  }
  addRadioButtonClickEvents(){
    const radioButtons = this.shadowRoot.querySelectorAll('.radio');
    radioButtons[this.getIndexOfOptinValue()].checked = true;
    radioButtons[0].onclick =
      radioButtons[1].onclick =
        radioButtons[2].onclick =
          (event) => {
            this.optinClickHdl(event.target.value);
          };
  }
  getIndexOfOptinValue() {
    return gfkS2sConf.optin === true ? 2 : gfkS2sConf.optin === false ? 1 : 0;
  }

  optinClickHdl(value) {
    let url = location.href;
    const re = /([?&])optin=[^&]*([&]?)/;
    const m = url.match(re);
    if (m) {
      url = url.replace(m[0], m[1] === '?' && m[2] === '&' ? '?' : m[1] === '&' && m[2] === '&' ? '&' : '');
    }
    if (value !== 'undefined') {
      url += (url.indexOf('?') < 0 ? '?' : '&') + 'optin=' + value;
    }
    location.href = url;
  }
}

window.customElements.define('optin-box', OptinBox);
