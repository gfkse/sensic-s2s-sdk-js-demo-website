export class TcfBox extends HTMLElement {
  radioButtonsTemplateString = `
      <table>
        <tr>
          <td class='key'>TCF:</td>
          <td class='value'>
            <div class='radiobox'>
            <input id='tcfFalse' type='radio' name='tcf' class='radio' value='false'/><label for='false'>off</label
            ><input id='tcfTrue' type='radio' name='tcf' class='radio' value='true' /><label for='true'>on</label>
            </div>
          </td>
        </tr>
      </table>`;
  showSettingsButton = document.createElement('button');
  trueTcf = 'tcf=true';
  falseTcf = 'tcf=false';

  constructor() {
    super();
    //by default, tcf is turned off
    if (!document.location.href.includes('tcf')) {
        window.history.replaceState({},'',document.location.href + `?${this.falseTcf}`);
    }
    this.addTcfOptions();
    this.addSettingsButton();
    this.style = 'display:block';
    if (document.location.href.includes(this.trueTcf)) {
      document.getElementById('tcfTrue').setAttribute('checked', '');
      this.addTcfScripts();
    } else {
      document.getElementById('tcfFalse').setAttribute('checked', '');
    }
  }

  addCookieLawScript() {
    var cookielawScript = document.createElement('script');
    cookielawScript.src = 'https://cdn.cookielaw.org/consent/tcf.stub.js';
    cookielawScript.setAttribute('charset', 'UTF-8');
    document.head.appendChild(cookielawScript);
  }

  addCookieCdnScript() {
    var cookieCdnScript = document.createElement('script');
    cookieCdnScript.src = 'https://cookie-cdn.cookiepro.com/scripttemplates/otSDKStub.js';
    cookieCdnScript.setAttribute('data-domain-script', '0edcd832-896a-4ad5-bb7b-69b05eca59b1-test');
    cookieCdnScript.setAttribute('charset', 'UTF-8');
    document.head.appendChild(cookieCdnScript);
  }

  addOptanonWrapperScript() {
    var optanonWrapperScript = document.createElement('script');
    optanonWrapperScript.innerHTML = 'function OptanonWrapper() {}';
    optanonWrapperScript.setAttribute('type', 'text/javascript');
    document.head.appendChild(optanonWrapperScript);
  }

  addSettingsButton() {
    this.showSettingsButton.innerText = 'Cookie Settings';
    this.showSettingsButton.setAttribute('class', 'ot-sdk-show-settings');
    if (!document.location.href.includes(this.trueTcf)) {
      this.showSettingsButton.classList.add('hidden');
    }
    document.getElementsByClassName('tableContainer')[0].appendChild(this.showSettingsButton);
  }

  addTcfOptions() {
    var that = this;
    var template = document.createElement('div');
    template.style = 'display:flex';
    template.classList.add('tableContainer');
    template.innerHTML = this.radioButtonsTemplateString;
    this.appendChild(template);
    var url = document.location.href;
    document.getElementById('tcfTrue').onclick = function() {
      if (url.includes('tcf')) {
        document.location.href = url.replace(that.falseTcf, that.trueTcf);
      }
    };
    document.getElementById('tcfFalse').onclick = function() {
      if (url.includes('tcf')) {
        document.location.href = url.replace(that.trueTcf, that.falseTcf);
      }
    };
  }

  addTcfScripts() {
    this.addCookieLawScript();
    this.addCookieCdnScript();
    this.addOptanonWrapperScript();
  }
}

window.customElements.define('tcf-box', TcfBox);
