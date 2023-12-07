//nhận dữ liệu từ server và hiển thị lên home
fetch("/data")
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    if (data.status === 200) {
      //hiển thị dữ liệu phần game
      displayAppGame(data.data.G);
      //hiển thị dữ liệu phần ứng dụng
      displayAppMobile(data.data.A);
      //hiển thị dữ liệu phần sách
      displayBook(data.data.B);
      //click các nút xem thêm
      clickAppSeeAll(data.data.A);
      clickGameSeeAll(data.data.G);
    }
  });

//game
function displayAppGame(array) {
  const gameContainer = document.querySelector(".game-container");
  for (let i = 0; i <= 5; i++) {
    const gameHtml = `
    <div class="col-md-4 mb-3">
      <div class="app-cover p-2 shadow-md bg-white">
        <a href="/app/${array[i]._id}">
          <div class="row">
            <div class="img-cover pe-0 col-3">
              <img width = "250" height ="auto" class="rounded" src="/images/imgApps/${
                array[i].image
              }" alt="">
            </div>
            <div class="det mt-2 col-9">
              <h5 class="mb-0 fs-6">${array[i].nameApp}</h5>
              <span class="fs-8">Game</span>
              <ul class="row">
                <li class="col-8 ratfac">
                  ${generateRatingStars(array[i].rating)}
                </li>
                <li class="col-4">
                  <span class="text-success float-end">Free</span>
                </li>
              </ul>
            </div>
          </div>
        </a>
      </div>
    </div>
  `;
    // thêm HTML của game vào phần tử cha
    gameContainer.insertAdjacentHTML("beforeend", gameHtml);
  }
}

//hiển thị ứng dụng là app
function displayAppMobile(array) {
  const appContainer = document.querySelector(".app-container");
  for (let i = 0; i <= 7; i++) {
    let appHtml = `<div class="col-md-3 mb-3">
    <a href="/app/${array[i]._id}">
        <div class="app-cover p-2 shadow-md bg-white">
            <div class="img-cover d-flex justify-content-center"> <img width = "250" height ="auto" class="rounded" src="/images/imgApps/${
              array[i].image
            }" alt="">
            </div>
            <div class="det mt-2">
                <h5 class="mb-1 fs-6">${array[i].nameApp}</h5>
                <ul class="row">
                    <li class="col-8 ratfac">
                    ${generateRatingStars(array[i].rating)}
                    </li>
                    <li class="col-4"><span class="text-success float-end">Free</span></li>
                </ul>
            </div>
        </div>
    </a>
</div>`;
    appContainer.insertAdjacentHTML("beforeend", appHtml);
  }
}

//hiển thị sách
function displayBook(array) {
  const bookContainer = document.querySelector(".book-container");
  console.log(bookContainer);
  for (let i = 0; i <= 2; i++) {
    let bookHtml = `<div class="col-md-4 mb-3">
    <a href="/app/${array[i]._id}">
        <div class="app-cover p-2 shadow-md bg-white">
            <div class="row">
                <div class="img-cover pe-0 col-4"> <img class="rounded3" src="/images/imgApps/${
                  array[i].image
                }"
                        alt="">
                </div>
                <div class="det mt-2 col-8">
                    <h5 class="mb-0 fs-6">${array[i].nameApp}</h5>
                    <span class="fs-8">Book</span>
                    <ul class="row my-2">
                        <li class="col-8 ratfac">
                        ${generateRatingStars(array[i].rating)}
                        </li>
                        <li class="col-4"><span class="text-success fs-8 float-end">Featured</span></li>
                    </ul>
                    <b class="fs-8">Free</b>
                </div>
            </div>
        </div>
    </a>
</div>`;
    bookContainer.insertAdjacentHTML("beforeend", bookHtml);
  }
}
//sự kiện khi click nào nút button xem thêm
function clickAppSeeAll(array) {
  const button = document.getElementById("see-all-app");
  const appContainer = document.querySelector(".app-container");
  button.addEventListener("click", (event) => {
    event.preventDefault();
    for (let i = 8; i < array.length; i++) {
      let appHtml = `<div class="col-md-3 mb-3">
        <a href="/app/${array[i]._id}">
            <div class="app-cover p-2 shadow-md bg-white">
                <div class="img-cover"> <img width="300" height="auto" class="rounded2" src="/images/imgApps/${
                  array[i].image
                }" alt="">
                </div>
                <div class="det mt-2">
                    <h5 class="mb-1 fs-6">${array[i].nameApp}</h5>
                    <ul class="row">
                        <li class="col-8 ratfac">
                        ${generateRatingStars(array[i].rating)}
                        </li>
                        <li class="col-4"><span class="text-success float-end">Free</span></li>
                    </ul>
                </div>
            </div>
        </a>
    </div>`;
      appContainer.insertAdjacentHTML("beforeend", appHtml);
    }
  });
}

function clickGameSeeAll(array) {
  const button = document.getElementById("see-all-game");
  const gameContainer = document.querySelector(".game-container");
  button.addEventListener("click", (event) => {
    event.preventDefault();
    for (let i = 5; i < array.length; i++) {
      const gameHtml = `
    <div class="col-md-4 mb-3">
      <div class="app-cover p-2 shadow-md bg-white">
        <a href="/app/${array[i]._id}">
          <div class="row">
            <div class="img-cover pe-0 col-3">
              <img class="rounded1" src="/images/imgApps/${
                array[i].image
              }" alt="">
            </div>
            <div class="det mt-2 col-9">
              <h5 class="mb-0 fs-6">${array[i].nameApp}</h5>
              <span class="fs-8">Game</span>
              <ul class="row">
                <li class="col-8 ratfac">
                  ${generateRatingStars(array[i].rating)}
                </li>
                <li class="col-4">
                  <span class="text-success float-end">Free</span>
                </li>
              </ul>
            </div>
          </div>
        </a>
      </div>
    </div>
  `;
      // thêm HTML của game vào phần tử cha
      gameContainer.insertAdjacentHTML("beforeend", gameHtml);
    }
  });
}

function generateRatingStars(rating) {
  let html = "";
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      html += '<i class="bi text-warning bi-star-fill"></i>';
    } else {
      html += '<i class="bi bi-star-fill"></i>';
    }
  }
  return html;
}
