import { Table } from '../Table/Table.js';
import { Portfolio } from '../Portfolio/Portfolio.js';
import { TradeWidget } from '../TradeWidget/TradeWidget.js';
import { Filter } from '../Filter/Filter.js';

import DataService from '../../services/DataService.js';

import './App.css';

export class App {
  constructor({ element }) {
    this._el = element;
    this._userBalance = 10000;
     
    this._render();

    this.fetchData();

    this._initFilter();
    this._initPortfolio();
    this._initTradeWidget();
  }

  async fetchData() {
    // DataService.getCurrencies().then(data => {
    //   this._data = data;
    //   return this._initTable(this._data);
    // })
    
    try {
      let data = await DataService.getCurrencies()
      this._data = data;
      this._initTable(this._data);
    } catch (err) {
      console.error(err)
    }
  }
  
  tradeItem(id) {
    const coin = this._data.find(coin => coin.id === id);
    this._tradeWidget.trade(coin)
  }

  _initFilter() {
    this._filter = new Filter({
      element: this._el.querySelector('[data-element="filter"]'),
    });

    this._filter.on('filter', e => {
      DataService.getCurrencies({ filter: e.detail }).then(data => {
        this._data = data;
        this._table.displayData(this._data);
      });
    })
  }

  _initPortfolio() {
    this._portfolio = new Portfolio({
      element: this._el.querySelector('[data-element="portfolio"]'),
      balance: this._userBalance,
    });
  }

  _initTradeWidget() {
    this._tradeWidget = new TradeWidget({
      element: this._el.querySelector('[data-element="trade-widget"]'),
    })

    this._tradeWidget.on('buy', e => {
      const { item, amount } = e.detail;
      this._portfolio.addItem(item, amount);
    })
  }

  _initTable(data) {
    this._table = new Table({
      data,
      element: this._el.querySelector('[data-element="table"]'),
    })

    this._table.on('rowClick', e => {
      this.tradeItem(e.detail.id)
    })
  }
    
     _render() {
        this._el.innerHTML = `
            <div class="row">
                <div class="col s12">
                    <h1>Tiny Crypto Market</h1>
                </div>
            </div>
            <div class="row portfolio-row">
                <div class="col s6 offset-s6" data-element="portfolio"></div>
            </div>

            <div class="row">
              <div data-element="filter" class="col s12"></div>
            </div>
            <div class="row">
              <div data-element="table" class="col s12"></div>
            </div>
            <div data-element="trade-widget"></div>
        `;
    }
}
