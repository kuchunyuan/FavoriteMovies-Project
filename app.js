const API_URL = {
  BASE_URL: "https://webdev.alphacamp.io",
  INDEX_URL: "https://webdev.alphacamp.io/api/movies/",
  POSTER_URL: "https://webdev.alphacamp.io/posters/",
};

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator");
const displayButton = document.querySelector("#change-mode");

const View = {
  renderMovieList(data) {
    if (dataPanel.dataset.mode === "card-mode") {
      let rawHTML = "";
      data.forEach((item) => {
        rawHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img src="${
              API_URL.POSTER_URL + item.image
            }" alt="Movie Poster" class="card-img-top">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${
                item.id
              }">+</button>
            </div>
          </div>
        </div>
      </div>
    `;
      });
      dataPanel.innerHTML = rawHTML;
    } else if (dataPanel.dataset.mode === "list-mode") {
      let rawHTML = `<ul class="list-group col-sm-12 mb-2">`;
      data.forEach((item) => {
        rawHTML += `
          <li class="list-group-item d-flex justify-content-between">
            <h5 class="card-title">${item.title}</h5>
            <div>
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal"
                data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </li>
        `;
      });
      rawHTML += "</ul>";
      dataPanel.innerHTML = rawHTML;
    }
  },

  renderPaginator(amount) {
    const numberOfPages = Math.ceil(amount / Model.MOVIES_PER_PAGE);
    let rawHTML = "";
    for (let page = 0; page < numberOfPages; page++) {
      rawHTML += `
      <li class="page-item"><a class="page-link" href="#" data-page="${
        page + 1
      }">${page + 1}</a></li>
    `;
    }
    paginator.innerHTML = rawHTML;
  },

  showMovieModal(id) {
    const movieTitle = document.querySelector("#movie-modal-title");
    const movieImage = document.querySelector("#movie-modal-image");
    const movieDate = document.querySelector("#movie-modal-date");
    const movieDescription = document.querySelector("#movie-modal-description");

    axios.get(API_URL.INDEX_URL + id).then((response) => {
      const data = response.data.results;
      movieTitle.innerText = data.title;
      movieImage.innerHTML = `<img src="${
        API_URL.POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`;
      movieDate.innerText = "Release Date: " + data.release_date;
      movieDescription.innerText = data.description;
    });
  },

  getMoviesByPage(page) {
    // page 1 -> movies 0 - 11
    // page 2 -> movies 12 - 23
    // page 3 -> movies 24 - 35

    const data = Model.filteredMovies.length
      ? Model.filteredMovies
      : Model.movies;

    const startIndex = (page - 1) * Model.MOVIES_PER_PAGE;
    return data.slice(startIndex, startIndex + Model.MOVIES_PER_PAGE);
  },
};

const Model = {
  MOVIES_PER_PAGE: 12,
  movies: [],
  filteredMovies: [],
  currentPage: 1,
};

const Controller = {
  generateMovies() {
    axios
      .get(API_URL.INDEX_URL)
      .then((response) => {
        // for (const movie of response.data.results) {
        //   movies.push(movie)
        // }
        Model.movies.push(...response.data.results);
        console.log(Model.movies);
        View.renderPaginator(Model.movies.length);
        View.renderMovieList(View.getMoviesByPage(1));
      })
      .catch((err) => console.log(err));
  },

  addFavoriteMovie(id) {
    const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
    const movie = Model.movies.find((movie) => {
      return movie.id === id;
    });

    if (list.some((movie) => movie.id === id)) {
      return alert("此電影已經在收藏清單中!");
    }

    list.push(movie);
    console.log(list);

    localStorage.setItem("favoriteMovies", JSON.stringify(list));
  },

  changeDisplayMode(displayMode) {
    if (dataPanel.dataset.mode === displayMode) return;
    dataPanel.dataset.mode = displayMode;
  },

  onPanelClicked(event) {
    if (event.target.matches(".btn-show-movie")) {
      const movieID = event.target.dataset.id;
      View.showMovieModal(Number(movieID));
    } else if (event.target.matches(".btn-add-favorite")) {
      const movieID = event.target.dataset.id;
      Controller.addFavoriteMovie(Number(movieID));
    }
  },

  onPaginatorClicked(event) {
    if (event.target.tagName !== "A") return;
    const dataPage = Number(event.target.dataset.page);
    Model.currentPage = dataPage;
    View.renderMovieList(View.getMoviesByPage(Model.currentPage));
  },

  searchMovies(event) {
    event.preventDefault();
    const keyword = searchInput.value.trim().toLowerCase();

    Model.filteredMovies = Model.movies.filter((movie) => {
      return movie.title.toLowerCase().includes(keyword);
    });

    if (Model.filteredMovies.length === 0) {
      return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`);
    }
    // for (const movie of movies) {
    //   if (movie.title.toLowerCase().includes(keyword)) {
    //     filteredMovies.push(movie);
    //   }
    // }
    View.renderPaginator(Model.filteredMovies.length);
    View.renderMovieList(View.getMoviesByPage(1));
  },

  toSwitchDisplay(event) {
    const target = event.target;
    if (target.matches("#list-mode-button")) {
      Controller.changeDisplayMode("list-mode");
      View.renderMovieList(View.getMoviesByPage(Model.currentPage));
    } else if (target.matches("#card-mode-button")) {
      Controller.changeDisplayMode("card-mode");
      View.renderMovieList(View.getMoviesByPage(Model.currentPage));
    }
  },
};

dataPanel.addEventListener("click", Controller.onPanelClicked);
paginator.addEventListener("click", Controller.onPaginatorClicked);
searchForm.addEventListener("submit", Controller.searchMovies);
displayButton.addEventListener("click", Controller.toSwitchDisplay);

Controller.generateMovies();
