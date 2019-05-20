export class Portfolio {
  constructor({ element, balance }) {
      this._el = element;
      this._portfolioWorth = 0;
      this._balance = balance;
      this._items = {};
      this._render();
  }

  addItem(item, amount) {
    const currentItem = this._items[item.id] || {
      name: item.name,
      id: item.id,
      amount: 0,
      total: 0,
    }

    currentItem.price = item.price;
    currentItem.amount = currentItem.amount + amount;
    currentItem.total = currentItem.price * currentItem.amount;
    this._items[item.id] = currentItem;

    const purchasePrice = item.price * amount;
    this._balance -= purchasePrice;

    this._portfolioWorth = Object.values(this._items)
      .reduce((total, item) => total + item.total, 0);
    
    this._render();
  }

  _render() {
      const items = Object.values(this._items);
      this._el.innerHTML = `
            <ul class="collapsible portfolio">
              <li>
                <p class="collapsible-header">
                    Current balance: ${this._balance}.
                    Portfolio Worth: ${this._portfolioWorth}
                </p>
                <div class="collapsible-body">
                ${
                  items.length === 0
                    ? ''
                    : `
                    <table class="highlight striped"> 
                      <thead>
                        <tr>
                            <th>Name</th>
                            <th>Amount</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                      </thead>
              
                      <tbody>
                          ${items.map(item => `
                            <tr data-id="${item.id}">
                                <td>${item.name}</td>
                                <td>${item.amount}</td>
                                <td>${item.price}</td>
                                <td>${item.total}</td>
                            </tr>
                          `).join('')}
                      </tbody>
                  </table>
                    `
                }
      
                </div>
              </li>
            </ul>
      `;

      let elems = document.querySelectorAll('.collapsible');
      M.Collapsible.init(elems);
  }
}
