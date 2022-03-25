const LitElement = Object.getPrototypeOf(
    customElements.get("ha-panel-lovelace")
);
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

function hasConfigOrEntityChanged(element, changedProps) {
    if (changedProps.has("_config")) {
      return true;
    }

    const oldHass = changedProps.get("hass");
    if (oldHass) {
      return (
        oldHass.states[element._config.entity] !==
          element.hass.states[element._config.entity]
      );
    }

    return true;
  }

class HvvCard extends LitElement {
    static get properties() {
        return {
            _config: {},
            hass: {}
        };
    }

    setConfig(config) {
        if (!config.entity) {
            throw new Error("Please define a departure entity");
        }
        this._config = config;
    }

    shouldUpdate(changedProps) {
        return hasConfigOrEntityChanged(this, changedProps);
    }

    render() {
        if (!this._config || !this.hass) {
            return html ``;
        }

        const stateObj = this.hass.states[this._config.entity];

        if (!stateObj) {
            return html `
          <style>
            .not-found {
              flex: 1;
              background-color: yellow;
              padding: 8px;
            }
          </style>
          <ha-card>
            <div class="not-found">
              Entity not available: ${this._config.entity}
            </div>
          </ha-card>
        `;
        }

        const today = new Date();
        const max = this._config.max ? this._config.max : 5;
        var count = 0;

        return html `
        <ha-card>
          ${
            stateObj.attributes['friendly_name']
              ? html`
                <h1 class="card-header">${stateObj.attributes['friendly_name']}</h1>
                `
              : ""
          }
          <div>
            <table>
                ${stateObj.attributes['next'].map(attr => {
                    const direction = attr['direction'];
                    const line = attr['line'];
                    const type = attr['type'];
                    const delay = attr['delay'];
                    const departure = new Date(attr["departure"]);
					const dept_ms = departure - today;
					const dept_s = dept_ms / 1000;
					const dept_h = Math.floor(dept_s / 3600);
					const dept_m = Math.round((dept_s % 3600) / 60);
                    const departureInMins = dept_h + " h " + dept_m + " m";

                    count++;

                    return count <= max
                    ? html`
                        <tr>
                            <td class="narrow" style="text-align:center;"><span class="line ${type} ${line}">${line}</span></td>
                            <td class="expand">${direction}</td>
                                ${
									switch (this._config.show) {
										case "time":
											html`<td class="narrow" style="text-align:right;">`;
											departure.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
											delay > 0 ?
												html`<span class="delay">+${delay}</span> min` :
												html``;
											html`</td>`;
											break;
										case "difference":
											html `<td class="narrow" style="text-align:right;">${departureInMins}`
											delay > 0 ?
												html`<span class="delay">+${delay}</span> min` :
												html``;
											html`</td>`;
											break;
										case "both":
											html`<td class="narrow" style="text-align:right;">`;
											departure.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
											delay > 0 ?
												html`<span class="delay">+${delay}</span> min` :
												html``;
											html `</td>`;
											html `<td class="narrow" style="text-align:right;">${departureInMins}</td>`;
											break;
									}
                                }
                        </tr>
                        `
                    : html ``;
                })}
            </table>
          </div>
        </ha-card>
      `;
    }

    getCardSize() {
        return 1;
    }

    static get styles() {
        return css`
        table {
            width: 100%;
            padding: 6px 14px;
        }

        td {
            padding: 3px 0px;
        }

        td.narrow {
            white-space: nowrap;
        }

        td.expand {
            width: 95%
        }

        span.line {
            font-weight: bold;
            font-size: 0.9em;
            padding: 3px 8px 2px 8px;
            color: #ffffff;
            background-color: #888888;
            margin-right: 0.7em;
        }

        span.delay {
             color: #e2001a;
        }

        span.S, span.A{
            background-color: #009252;
            border-radius: 999px;
        }

        span.U {
            border-radius: 0px;
        }

        span.Bus, span.XpressBus, span.Schnellbus, span.NachtBus {
            background-color: #e2001a;
            clip-path: polygon(20% 0, 80% 0, 100% 50%, 80% 100%, 20% 100%, 0 50%);
            width: 48px;
            margin-left: 0;
        }

        span.XpressBus {
            background-color: #1a962b;
        }

        span.NachtBus {
            background-color: #000000;
        }

        span.Schiff {
            background-color: #009dd1;
            clip-path: polygon(0 0, 100% 0, 90% 100%, 10% 100%);
        }

        span.ICE, span.RE, span.EC, span.IC, span.RB, span.R {
            background-color: transparent;
            color: #000;
        }

        span.U1 {
            background-color: #1c6ab3;
        }

        span.U2 {
            background-color: #e2021b;
        }

        span.U3 {
            background-color: #fddd00;
        }

        span.U4 {
            background-color: #0098a1;
        }

        span.S1 {
            background-color: #31962b;
        }

        span.S2 {
            background-color: #b51143;
        }

        span.S3 {
            background-color: #622181;
        }

        span.S11 {
            background-color: #31962b;
        }

        span.S21 {
            background-color: #b51143;
        }

        span.S31 {
            background-color: #622181;
        }
      `;
    }
}
customElements.define("hvv-card", HvvCard);
