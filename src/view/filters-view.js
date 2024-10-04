import { capitalize } from '../utils/common-utils';
import AbstractView from '../framework/view/abstract-view';

const getFiltersItem = (type, count) => `<div class="trip-filters__filter">
    <input
    id="filter-${type}"
    class="trip-filters__filter-input  visually-hidden"
    type="radio"
    name="trip-filter"
    value="${type}"
    ${type === 'everything' ? 'checked' : ''}>
    <label class="trip-filters__filter-label" data-filter-type="${type}" for="filter-${type}">${capitalize(type)} ${count}</label>
    </div>`;

function createFiltersTemplate(filters) {
  return `<form class="trip-filters" action="#" method="get">
  ${Object.values(filters).map((filter) => getFiltersItem(filter.type, filter.count)).join('')}
  <button class="visually-hidden" type="submit">Accept filter</button>
</form>`;
}

export default class FiltersView extends AbstractView {
  #filters = [];
  #handleFiltersChange = null;

  constructor({ filters, onFiltersChange }) {
    super();
    this.#filters = filters;
    this.#handleFiltersChange = onFiltersChange;

    this.element.addEventListener('click', this.#filtersChangeHandler);
  }

  get template() {
    return createFiltersTemplate(this.#filters);
  }

  #filtersChangeHandler = (evt) => {
    if (evt.target.tagName !== 'LABEL') {
      return;
    }

    evt.preventDefault();
    console.log(evt.target.dataset.filterType);

    this.#handleFiltersChange(evt.target.dataset.filterType);
  }
}
