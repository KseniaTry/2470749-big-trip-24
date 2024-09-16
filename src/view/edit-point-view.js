import { capitalize, humanizePointDate } from '../util';
import { CITIES, DATE_WITH_TIME_FORMAT, TYPES } from '../const';
import AbstractView from '../framework/view/abstract-view';

const createOfferClass = (offerTitle) => {
  const splittedOfferTitles = offerTitle.split(' ');
  return splittedOfferTitles[splittedOfferTitles.length - 1];
};

const createDestinationsList = (destination) =>
  `<option value="${destination}"></option>`;

const createPointTypeItem = (pointType, pointTypeChecked) => `
  <div class="event__type-item">
  <input id="event-type-${pointType}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${pointType}" ${pointTypeChecked}>
  <label class="event__type-label  event__type-label--${pointType}" for="event-type-${pointType}-1">${capitalize(pointType)}</label>
  </div>`;

const getPointOfferItem = (pointOffer, pointOfferChecked) => `<div class="event__offer-${createOfferClass(pointOffer.title)}">
  <input class="event__offer-checkbox  visually-hidden" id="event-offer-${createOfferClass(pointOffer.title)}-1" type="checkbox" name="event-offer-${createOfferClass(pointOffer.title)}" ${pointOfferChecked}>
  <label class="event__offer-label" for="event-offer-${createOfferClass(pointOffer.title)}-1">
    <span class="event__offer-title">${pointOffer.title}</span>
    &plus;&euro;&nbsp;
    <span class="event__offer-price">${pointOffer.price}</span>
  </label>
  </div>`;

function createEditPointViewTemplate(point, offers, destinations) {
  const { type, destination, dateFrom, dateTo, basePrice, description, offers: pointOffers } = point;
  const modifiedDestination = destinations.find((destinationElement) => destinationElement.id === destination).name;
  const offersArray = offers.find((offer) => offer.type === type).offers;

  const getOfferCheckedAttribute = (offerId) => {
    if (pointOffers.includes(offerId)) {
      return 'checked';
    } else {
      return '';
    }
  };

  const getTypeCheckedAttribute = (pointType) => {
    if (pointType === type) {
      return 'checked';
    } else {
      return '';
    }
  };

  return `<li class="trip-events__item">
  <form class="event event--edit" action="#" method="post">
    <header class="event__header">
      <div class="event__type-wrapper">
        <label class="event__type  event__type-btn" for="event-type-toggle-1">
          <span class="visually-hidden">Choose event type</span>
          <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
        </label>
        <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">

        <div class="event__type-list">
          <fieldset class="event__type-group">
            <legend class="visually-hidden">Event type</legend>
            ${TYPES.map((pointType) => createPointTypeItem(pointType, getTypeCheckedAttribute(pointType))).join('')}
          </fieldset>
        </div>
      </div>

      <div class="event__field-group  event__field-group--destination">
        <label class="event__label  event__type-output" for="event-destination-1">
          ${type}
        </label>
        <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${modifiedDestination}" list="destination-list-1">
        <datalist id="destination-list-1">
          ${CITIES.map((city) => createDestinationsList(city)).join('')}
        </datalist>
      </div>

      <div class="event__field-group  event__field-group--time">
        <label class="visually-hidden" for="event-start-time-1">From</label>
        <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${humanizePointDate(dateFrom, DATE_WITH_TIME_FORMAT)}">
        &mdash;
        <label class="visually-hidden" for="event-end-time-1">To</label>
        <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${humanizePointDate(dateTo, DATE_WITH_TIME_FORMAT)}">
      </div>

      <div class="event__field-group  event__field-group--price">
        <label class="event__label" for="event-price-1">
          <span class="visually-hidden">Price</span>
          &euro;
        </label>
        <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price" value="${basePrice}">
      </div>

      <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
      <button class="event__reset-btn" type="reset">Delete</button>
      <button class="event__rollup-btn" type="button">
        <span class="visually-hidden">Open event</span>
      </button>
    </header>
    <section class="event__details">
      <section class="event__section  event__section--offers">
        <h3 class="event__section-title  event__section-title--offers">Offers</h3>

        <div class="event__available-offers">
        ${offersArray.map((pointOffer) => getPointOfferItem(pointOffer, getOfferCheckedAttribute(pointOffer.id))).join('')}
        </div>
      </section>

      <section class="event__section  event__section--destination">
        <h3 class="event__section-title  event__section-title--destination">Destination</h3>
        <p class="event__destination-description">${description}</p>
      </section>
    </section>
  </form>
</li>`;
}

export default class EditPointView extends AbstractView {
  #point = null;
  #offers = null;
  #destinations = null;
  #handleEditClick = null;
  #handleFormSave = null;

  constructor({ point, offers, destinations, onEditClick, onFormSave }) {
    super();
    this.#point = point;
    this.#offers = offers;
    this.#destinations = destinations;
    this.#handleEditClick = onEditClick;
    this.#handleFormSave = onFormSave;

    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#editClickHandler);
    this.element.querySelector('form').addEventListener('submit', this.#formSaveHandler);
  }

  get template() {
    return createEditPointViewTemplate(this.#point, this.#offers, this.#destinations);
  }

  #editClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleEditClick();
  };

  #formSaveHandler = (evt) => {
    evt.preventDefault();
    this.#handleFormSave();
  };
}
