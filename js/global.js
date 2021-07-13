"use strict";

//CONSTANTES

const $searchButton = document.querySelector(".js-button");
const $searchInput = document.querySelector(".js-search");
const $resetInput = document.querySelector(".js-reset");
const $seriesUl = document.querySelector(".js-card-ul");
const $favoritesUl = document.querySelector(".js-favorites-ul");

//Necesitamos crear una variable global para asignarle el parámetro data
let globalData = [];

//Una variable para guardar favoritos
let favoriteShows = [];

//FETCH

function getShows() {
  fetch(`//api.tvmaze.com/search/shows?q=${$searchInput.value}`)
    //then recoge la respuesta positiva (como un if)
    .then((response) => response.json()) //ejecuto el método json porque lo que espero recibir es un json
    .then((data) => {
      globalData.splice(0, globalData.length);
      for (let item of data) {
        globalData.push(item);
      }

      // paso 3: setItem
      // hacemos un JSON.stringify para convertir el objeto data
      // que inicialmente es un JSON, a un string
      // porque el localStorage SOLO ADMITE arrays y strings
      //  localStorage.setItem("shows", JSON.stringify(globalData));
      //render series
      renderSeries(globalData);
    })

    //catch recoge la respuesta negativa (como un else)
    .catch((error) => console.log("Inténtalo de nuevo más tarde", error));
}

//FUNCIONES

//Creamos las cards
function renderSeries(data) {
  //recorro el array que tiene dentro score y show, show es un objeto
  for (const object of data) {
    //Crear la lista desde el DOM
    const $newLi = document.createElement("li");
    $newLi.classList = "card";
    $newLi.classList.add("card-serie");

    //le añadimos su id porque necesitaremos algo que conecte
    //la etiqueta pintada en HTML con el objeto del DATA
    $newLi.dataset.id = object.show.id;

    //Si no hay portada se pondrá una default img
    if (!object.show.image) {
      $newLi.style = `background: url(https://via.placeholder.com/210x295/ffffff/666666/?text=TV) center`;
    } else {
      $newLi.style = `background: url(${object.show.image.medium}) center; background-size: cover`;
    }

    $seriesUl.appendChild($newLi);
    const $newH3Title = document.createElement("h3");
    $newH3Title.classList = "card-title";
    $newLi.appendChild($newH3Title);
    const $text = document.createTextNode(object.show.name);
    $newH3Title.appendChild($text);
  }
  //Seleccionar cards
  const $allCards = document.querySelectorAll(".card");
  for (const card of $allCards) {
    //se le asigna un listener a CADA card, por eso se mete dentro del for of
    card.addEventListener("click", handleClickCard);
  }
}

function renderFavs() {
  //guardar favoritos en el local storage
  localStorage.setItem("favorite shows", JSON.stringify(favoriteShows));
  favoriteShows = JSON.parse(localStorage.getItem("favorite shows"));

  console.log(favoriteShows);
  cleanFavs();
  for (let object of favoriteShows) {
    const $newLi = document.createElement("li");
    $newLi.classList = "card";
    $newLi.classList.add("favorite-card");

    //le añadimos su id porque necesitaremos algo que conecte
    //la etiqueta pintada en HTML con el objeto del DATA
    $newLi.dataset.id = object.show.id;

    //Si no hay portada se pondrá una default img
    if (!object.show.image) {
      $newLi.style = `background: url(https://via.placeholder.com/210x295/ffffff/666666/?text=TV) center`;
    } else {
      $newLi.style = `background: url(${object.show.image.medium}) center; background-size: cover`;
    }
    const $newH3Title = document.createElement("h3");
    $newH3Title.classList = "card-title";
    $newLi.appendChild($newH3Title);
    const $text = document.createTextNode(object.show.name);
    $newH3Title.appendChild($text);

    $favoritesUl.appendChild($newLi);
    /*
    · //Botón de eliminar - Esto no está terminado
    · const $newDeleteButton = document.createElement("div");
    · $newDeleteButton.classList = "delete";
    · $newLi.appendChild($newDeleteButton);
    · const $x = document.createTextNode("X");
    · $newDeleteButton.appendChild($x);

    · 

    · const $deleteButton = document.querySelector(".delete");
    */
  }
}

//////////////FAVORITOS

function handleClickCard(e) {
  //hacemos currentTarget para que seleccione SOLO
  //el elemento al que le tenemos puesto el LISTENER
  const clickedCard = e.currentTarget;

  //guardamos el id de la card seleccionada
  //le hacemos un parseInt porque inicialmente era una STRING
  //y necesitamos convertirla en NUMBER para que sea el mismo tipo de dato
  //que el que tenemos en data
  const selectedId = parseInt(clickedCard.dataset.id);

  //En el array de favoriteShows buscamos la coincidencia del data-id de la card seleccionada
  //con el id de la serie del objeto data
  //si la card clickada está en favoritos
  const isPresent = favoriteShows.find((fav) => fav.show.id === selectedId);

  //si isPresent no está en el array de favoritos, mételo
  if (isPresent === undefined) {
    const fav = globalData.find((fav) => fav.show.id === selectedId);
    favoriteShows.push(fav);
  } else {
    //filtro y sobreescribo mi array inicial con los favoritos
    //con esto, si dejo de seleccionar la card, se elimina del array
    favoriteShows = favoriteShows.filter((fav) => fav.show.id !== selectedId);
  }

  //hacemos un toggle para añadir y quitar la clase
  clickedCard.classList.toggle("favorite");

  renderFavs();
}

/////

//Función para resetear las cards y que no se me acumulen
function cleanCards() {
  //Seleccionar las cards para poder eliminarlas
  const $allCards = document.querySelectorAll(".card-serie");

  for (const card of $allCards) {
    card.remove();
  }
}

function cleanFavs() {
  const $allFavCards = document.querySelectorAll(".favorite-card");

  for (const card of $allFavCards) {
    card.remove();
  }
}

////

//paso 1: getItem
//si el localStorage está vacío llama al fetch
//"shows" es una KEY que me he inventado, puede tener cualquier otro nombre
if (localStorage.getItem("shows") === null) {
  getShows();
} else {
  //mostrar las series
  renderSeries(globalData);
}
//////

function handleSubmit(ev) {
  //para prevenir que se recargue la página con submit
  ev.preventDefault();

  cleanCards();
  getShows();
}

renderFavs();

//EVENT LISTENERS
//$searchInput.addEventListener("keyup", handleSubmit);
$searchButton.addEventListener("click", handleSubmit);
$resetInput.addEventListener("click", cleanFavs);
