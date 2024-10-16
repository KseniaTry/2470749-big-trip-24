import { render, replace, remove } from '../framework/render';
import PointItemView from '../view/point-item-view';
import EditPointView from '../view/edit-point-view';
import { UpdateType, UserAction, Mode } from '../const';

export default class PointPresenter {
  #point = null;
  #allDestinations = [];
  #allOffers = [];

  #pointComponent = null;
  #editPointComponent = null;

  #pointsListComponent = null;
  #handleModelEvent = null;
  #handleModeChange = null;
  #clearPoint = null;
  #resetPointView = null;
  #handleModelUpdate = null;

  #mode = Mode.DEFAULT;

  constructor({ pointsListComponent, onPointsChange, onModeChange, onPointClear, onEditPointView, onModelUpdate }) {
    this.#pointsListComponent = pointsListComponent;
    this.#handleModelEvent = onPointsChange;
    this.#handleModeChange = onModeChange;
    this.#clearPoint = onPointClear;
    this.#resetPointView = onEditPointView;
    this.#handleModelUpdate = onModelUpdate;
  }

  init(point, offers, destinations) {
    this.#point = point;
    this.#allOffers = offers;
    this.#allDestinations = destinations;

    const prevPointComponent = this.#pointComponent;
    const prevEditPointComponent = this.#editPointComponent;

    this.#pointComponent = new PointItemView({
      point: this.#point,
      allOffers: this.#allOffers,
      allDestinations: this.#allDestinations,
      onEditClick: () => {
        this.#replacePointToForm();
      },
      onFavoriteClick: this.#handleFavoriteClick
    });

    this.#editPointComponent = new EditPointView({
      point: this.#point,
      allOffers: this.#allOffers,
      allDestinations: this.#allDestinations,
      onEditClick: this.#handleFormEditClick,
      onFormSaveClick: this.#handleFormSaveClick,
      onFormDeleteClick: this.#handleFormDeleteClick,
      isNewPoint: false,
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
      this.#mode = Mode.DEFAULT;
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

  setSaving() {
    if (this.#mode === Mode.EDIT) {
      this.#editPointComponent.updateElement({
        isDisabled: true,
        isSaving: true,
      });
    }
  }

  setDeleting() {
    if (this.#mode === Mode.EDIT) {
      this.#editPointComponent.updateElement({
        isDisabled: true,
        isDeleting: true,
      });
    }
  }

  setAborting() {
    if (this.#mode === Mode.DEFAULT) {
      this.#pointComponent.shake();
      return;
    }

    const resetFormState = () => {
      this.#editPointComponent.updateElement({
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
      });
    };

    this.#editPointComponent.shake(resetFormState);
  }

  // обработчики событий
  #handleFavoriteClick = () => {
    this.#handleModelEvent(UpdateType.PATCH, { ...this.#point, isFavorite: !this.#point.isFavorite });
  };

  #handleFormSaveClick = (point) => {
    this.#handleModelUpdate(UserAction.UPDATE_POINT, UpdateType.MINOR, point);
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

