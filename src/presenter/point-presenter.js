import { render, replace, remove } from '../framework/render';
import PointItemView from '../view/point-item-view';
import EditPointView from '../view/edit-point-view';

const Mode = {
  DEFAULT: 'DEFAULT',
  EDIT: 'EDIT'
};

export default class PointPresenter {
  #point = null;
  #destinations = null;
  #offers = null;
  #pointsListComponent = null;

  #pointComponent = null;
  #editPointComponent = null;

  #handlePointsChange = null;
  #handleModeChange = null;
  #clearPoint = null;
  #resetPointView = null;

  #mode = Mode.DEFAULT;

  constructor({ pointsListComponent, onPointsChange, onModeChange, onPointClear, onEditPointView }) {
    this.#pointsListComponent = pointsListComponent;
    this.#handlePointsChange = onPointsChange;
    this.#handleModeChange = onModeChange;
    this.#clearPoint = onPointClear;
    this.#resetPointView = onEditPointView;
  }

  init(point, offers, destinations) {
    this.#point = point;
    this.#offers = offers;
    this.#destinations = destinations;

    const prevPointComponent = this.#pointComponent;
    const prevEditPointComponent = this.#editPointComponent;

    this.#pointComponent = new PointItemView({
      point: this.#point,
      offers: this.#offers,
      destinations: this.#destinations,
      onEditClick: () => {
        this.#replacePointToForm();
      },
      onFavoriteClick: this.#handleFavoriteClick
    });

    this.#editPointComponent = new EditPointView({
      point,
      offers,
      destinations,
      onEditClick: this.#handleFormEditClick,
      onFormSaveClick: this.#handleFormSaveClick,
      onFormDeleteClick: this.#handleFormDeleteClick,
    });

    if (prevPointComponent === null || prevEditPointComponent === null) {
      render(this.#pointComponent, this.#pointsListComponent);
      return;
    }

    if (this.#mode === Mode.DEFAULT) {
      replace(this.#pointComponent, prevPointComponent);
    }

    if (this.#mode === Mode.EDIT) {
      replace(this.#editPointComponent, prevEditPointComponent);
    }

    remove(prevPointComponent);
    remove(prevEditPointComponent);
  }

  #replacePointToForm() {
    replace(this.#editPointComponent, this.#pointComponent);
    document.addEventListener('keydown', this.#escKeyDownHandler);
    this.#handleModeChange();
    this.#mode = Mode.EDIT;
  }

  #replaceFormToPoint() {
    replace(this.#pointComponent, this.#editPointComponent);
    document.removeEventListener('keydown', this.#escKeyDownHandler);
    this.#mode = Mode.DEFAULT;
  }

  destroy() {
    remove(this.#pointComponent);
    remove(this.#editPointComponent);
  }

  resetView() {
    if (this.#mode !== Mode.DEFAULT) {
      this.#editPointComponent.reset(this.#point);
      this.#replaceFormToPoint();
    }
  }

  // обработчики событий
  #handleFavoriteClick = () => {
    this.#handlePointsChange({ ...this.#point, isFavorite: !this.#point.isFavorite });
  };

  #handleFormSaveClick = (point) => {
    this.#handlePointsChange(point);
    this.#replaceFormToPoint();
    document.removeEventListener('keydown', this.#escKeyDownHandler);
  };

  #handleFormDeleteClick = (point) => {
    this.#clearPoint(point);
    this.#replaceFormToPoint();
    document.removeEventListener('keydown', this.#escKeyDownHandler);
  };

  #handleFormEditClick = (point) => {
    this.#resetPointView(point);
    document.removeEventListener('keydown', this.#escKeyDownHandler);
  };

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this.#editPointComponent.reset(this.#point);
      this.#replaceFormToPoint();
      document.removeEventListener('keydown', this.#escKeyDownHandler);
    }
  };
}

