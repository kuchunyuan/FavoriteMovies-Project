const BASE_URL = "https://webdev.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/movies/";
const POSTER_URL = BASE_URL + "/posters/";

const dataPanel = document.querySelector("#data-panel");

const list = JSON.parse(localStorage.getItem("favoriteMovies"));
console.log(list);

function renderMovieList(data) {
  let rawHTML = "";

  data.forEach((item) => {
    rawHTML += `
    <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img src="${
              POSTER_URL + item.image
            }" alt="Movie Poster" class="card-img-top">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-danger btn-remove-favorite" data-id="${
                item.id
              }">X</button>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  dataPanel.innerHTML = rawHTML;
}

renderMovieList(list);

function showMovieModal(id) {
  const movieTitle = document.querySelector("#movie-modal-title");
  const movieImage = document.querySelector("#movie-modal-image");
  const movieDate = document.querySelector("#movie-modal-date");
  const movieDescription = document.querySelector("#movie-modal-description");

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results;
    movieTitle.innerText = data.title;
    movieImage.innerHTML = `<img src="${
      POSTER_URL + data.image
    }" alt="movie-poster" class="img-fluid">`;
    movieDate.innerText = "Release Date: " + data.release_date;
    movieDescription.innerText = data.description;
  });
}

function removeFromFavorite(id) {
  const movieIndex = list.findIndex((movie) => {
    return movie.id === id;
  });
  list.splice(movieIndex, 1);
  alert("已將此電影從收藏清單中移除!");

  localStorage.setItem("favoriteMovies", JSON.stringify(list));
  renderMovieList(list);
}

dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    const movieID = event.target.dataset.id;
    showMovieModal(Number(movieID));
  } else if (event.target.matches(".btn-remove-favorite")) {
    const movieID = event.target.dataset.id;
    removeFromFavorite(Number(movieID));
  }
});
