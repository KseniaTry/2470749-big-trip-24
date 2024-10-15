import Observable from '../framework/observable';
import { UpdateType } from '../const';
import FailedToLoadView from '../view/failed-to-load-view';
import { render } from '../framework/render';

export default class PointModel extends Observable {
  #points = [];
  #allDestinations = [];
  #allOffers = [];
  #pointsApiService = null;
  #failedToLoadComponent = new FailedToLoadView();
  #pointsContainer = null;

  constructor({ pointsApiService, pointsContainer }) {
    super();
    this.#pointsApiService = pointsApiService;
    this.#pointsContainer = pointsContainer;
  }

  get points() {
    return this.#points;
  }

  get allDestinations() {
    return this.#allDestinations;
  }

  get allOffers() {
    return this.#allOffers;
  }

  #adaptToClient(point) {
    const adaptedPoint = {
      ...point,
      dateFrom: point['date_from'] !== null ? new Date(point['date_from']) : null,
      dateTo: point['date_to'] !== null ? new Date(point['date_to']) : null,
      basePrice: point['base_price'],
      isFavorite: point['is_favorite'],
    };

    delete adaptedPoint['date_from'];
    delete adaptedPoint['date_to'];
    delete adaptedPoint['base_price'];
    delete adaptedPoint['is_favorite'];

    return adaptedPoint;
  }

  async init() {
    try {
      const points = await this.#pointsApiService.points;
      this.#points = points.map(this.#adaptToClient);

      this.#allDestinations = await this.#pointsApiService.allDestinations;

      this.#allOffers = await this.#pointsApiService.allOffers;
    } catch (err) {
      render(this.#failedToLoadComponent, this.#pointsContainer);
    }

    this._notify(UpdateType.INIT);
  }

  async updatePoint(updateType, update) {
    const pointIndex = this.#points.findIndex((point) => point.id === update.id);

    if (pointIndex === -1) {
      throw new Error('Can\'t update unexisting task');
    }

    try {
      const responce = await this.#pointsApiService.updatePoint(update);
      const updatedPoint = this.#adaptToClient(responce);

      this.#points = [
        ...this.#points.slice(0, pointIndex),
        updatedPoint,
        ...this.#points.slice(pointIndex + 1),
      ];

      this._notify(updateType, updatedPoint);
    } catch (err) {
      throw new Error('Can\'t update point');
    }
  }

  async addPoint(updateType, update) {
    try {
      const responce = await this.#pointsApiService.addPoint(update);
      const addedPoint = this.#adaptToClient(responce);
      this.#points = [addedPoint, ...this.#points];

      this._notify(updateType, addedPoint);
    } catch (err) {
      throw new Error('Can\'t add task');
    }
  }

  async deletePoint(updateType, update) {
    const pointIndex = this.#points.findIndex((point) => point.id === update.id);

    try {
      await this.#pointsApiService.deletePoint(update);
      this.#points = [
        ...this.#points.slice(0, pointIndex),
        ...this.#points.slice(pointIndex + 1),
      ];

      this._notify(updateType);
    } catch (err) {
      throw new Error('Can\'t delete task');
    }
  }
}
