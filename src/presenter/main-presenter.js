import PointListView from '../view/point-list-view';
import SortingView from '../view/sorting-view';
import NoPointsView from '../view/no-points-view';
import { RenderPosition, remove, render, replace } from '../framework/render';
import PointPresenter from './point-presenter';
import { SortType, UpdateType, UserAction, FilterType } from '../const';
import { getWeightForPrice, getWeightForTime } from '../utils/point-utils';
import { filter } from '../utils/filter-utils';
import { updatePoint } from '../utils/common-utils';

export default class MainPresenter {
  #pointsListComponent = new PointListView();
  #pointsContainer = null;
  #pointModel = null;
  #pointPresenters = new Map();
  #noPoints = null;
  #filtersModel = null;

  #sorting = null;
  #currentSortType = SortType.DAY;
  #currentFilterType = FilterType.EVERYTHING;

  constructor({ pointsContainer, pointModel, filtersModel }) {
    this.#pointsContainer = pointsContainer;
    this.#pointModel = pointModel;
    this.#filtersModel = filtersModel;

    this.#pointModel.addObserver(this.#handleModelEvent);
    this.#filtersModel.addObserver(this.#handleModelEvent);
  }

  get filter() {
    return this.#filtersModel.filter;
  }

  get points() {
    this.#currentFilterType = this.filter;
    const points = [...this.#pointModel.points];
    const filteredPoints = filter[this.#currentFilterType](points);

    switch (this.#currentSortType) {
      case SortType.TIME:
        return filteredPoints.sort(getWeightForTime);
      case SortType.PRICE:
        return filteredPoints.sort(getWeightForPrice);
      case SortType.EVENT:
        break;
      case SortType.OFFER:
        break;
      case SortType.DAY:
        return filteredPoints;
    }
    return filteredPoints;
  }

  get offers() {
    return this.#pointModel.offers;
  }

  get destinations() {
    return this.#pointModel.destinations;
  }

  init() {
    this.#renderSorting(this.#currentSortType);
    this.#renderMain();
  }

  #renderMain() {
    render(this.#pointsListComponent, this.#pointsContainer);

    this.#renderPointsList();
  }

  #renderSorting(sortType) {
    this.#sorting = new SortingView({
      onSortingClick: this.#handleSortingClick,
      sortType: sortType
    });

    render(this.#sorting, this.#pointsContainer, RenderPosition.AFTERBEGIN);
  }

  #handleSortingClick = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;
    this.#clearPointsList();
    this.#renderPointsList();
  };

  #renderPoint(point) {
    const pointPresenter = new PointPresenter({
      pointsListComponent: this.#pointsListComponent.element,
      onPointsChange: this.#handleModelEvent,
      onModeChange: this.#handleModeChange,
      onPointClear: this.#clearPoint,
      onEditPointView: this.#resetPointView
    });

    pointPresenter.init(point, this.offers, this.destinations);
    this.#pointPresenters.set(point.id, pointPresenter);
  }

  // Здесь будем вызывать обновление модели.
  // actionType - действие пользователя, нужно чтобы понять, какой метод модели вызвать
  // updateType - тип изменений, нужно чтобы понять, что после нужно обновить
  // update - обновленные данные
  #handleViewAction = (actionType, updateType, update) => {
    switch (actionType) {
      case UserAction.UPDATE_TASK:
        this.#pointModel.updateTask(updateType, update);
        break;
      case UserAction.ADD_TASK:
        this.#pointModel.addTask(updateType, update);
        break;
      case UserAction.DELETE_TASK:
        this.#pointModel.deleteTask(updateType, update);
        break;
    }
  };

  // В зависимости от типа изменений решаем, что делать:
  #handleModelEvent = (updateType, updatedPoint) => {
    switch (updateType) {
      // - обновить часть списка (например, когда поменялись данные поинта при редактировании)
      case UpdateType.PATCH:
        this.#pointPresenters.get(updatedPoint.id).init(updatedPoint, this.offers, this.destinations);
        break;
      // - обновить список
      case UpdateType.MINOR:
        this.#clearPointsList();
        this.#renderPointsList();
        break;
      // - обновить всю доску (с очисткой фильтров и сортировки)
      case UpdateType.MAJOR:
        this.#clearPointsList({ resetFilters: true, resetSorting: true });
        this.#renderPointsList();
        break;
    }
  };

  #handleModeChange = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #resetPointView = (point) => {
    this.#pointPresenters.get(point.id).resetView();
  };

  #renderPointsList() {
    if (this.points.length === 0) {
      this.#renderNoPoints();
    } else {
      remove(this.#noPoints);
    }

    for (const point of this.points) {
      this.#renderPoint(point);
    }
  }

  #clearPointsList({ resetFilters = false, resetSorting = false } = {}) {
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();

    if (resetFilters) {
      this.#currentFilterType = FilterType.EVERYTHING
    }

    if (resetSorting) {
      this.#currentSortType = SortType.DAY;
    }

  }

  #renderNoPoints() {
    remove(this.#noPoints);

    this.#noPoints = new NoPointsView({
      filter: this.#currentFilterType,
    });

    render(this.#noPoints, this.#pointsListComponent.element);
  }

  #clearPoint = (point) => {
    const targetPresenter = this.#pointPresenters.get(point.id);
    targetPresenter.destroy();
  };
}
