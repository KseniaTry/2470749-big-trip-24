import { humanizePointDate, getPointDuration } from '../util';
import { DATE_FORMAT, TIME_FORMAT } from '../const';
import AbstractView from '../framework/view/abstract-view';

const getOffers = (offerType, offersList) => {
  const offers = offersList.find((offer) => offer.type === offerType).offers;

  const renderOffers = (title, price) => `<li class="event__offer">
      <span class="event__offer-title">${title}</span>
      &plus;&euro;&nbsp;
      <span class="event__offer-price">${price}</span>
      </li>`;

  return offers.map((offer) => renderOffers(offer.title, offer.price)).join('');
};

function createPointItemViewTemplate(point, offers, destinations) {
  const { type, destination, dateFrom, dateTo, basePrice } = point;

  const modifiedDestination = destinations.find((destinationElement) => destinationElement.id === destination).name;

  return `<li class="trip-events__item">
  <div class="event">
    <time class="event__date" datetime="2019-03-18">${humanizePointDate(dateFrom, DATE_FORMAT)}</time>
    <div class="event__type">
      <img class="event__type-icon" width="42" height="42" src="img/icons/${type}.png" alt="Event type icon">
    </div>
    <h3 class="event__title">${type} ${modifiedDestination}</h3>
    <div class="event__schedule">
      <p class="event__time">
        <time class="event__start-time" datetime="2019-03-18T10:30">${humanizePointDate(dateFrom, TIME_FORMAT)}</time>
        &mdash;
        <time class="event__end-time" datetime="2019-03-18T11:00">${humanizePointDate(dateTo, TIME_FORMAT)}</time>
      </p>
      <p class="event__duration">${getPointDuration(dateFrom, dateTo)}</p>
    </div>
    <p class="event__price">
      &euro;&nbsp;<span class="event__price-value">${basePrice}</span>
    </p>
    <h4 class="visually-hidden">Offers:</h4>
    <ul class="event__selected-offers">
      ${getOffers(type, offers)}
    </ul>
    <button class="event__favorite-btn event__favorite-btn--active" type="button">
      <span class="visually-hidden">Add to favorite</span>
      <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
        <path d="M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.67376 9.8855 8.33688 14 0l4.1145 8.33688 9.2003 1.33688-6.6574 6.48934 1.5716 9.1631L14 21z"/>
      </svg>
    </button>
    <button class="event__rollup-btn" type="button">
      <span class="visually-hidden">Open event</span>
    </button>
  </div>
</li>`;
}

export default class PointItemView extends AbstractView {
#point = null;
#offers = null;
#destinations = null;

  constructor({ point, offers, destinations }) {
    super();
    this.#point = point;
    this.#offers = offers;
    this.#destinations = destinations;
  }

  get template() {
    return createPointItemViewTemplate(this.#point, this.#offers, this.#destinations);
  }
}
