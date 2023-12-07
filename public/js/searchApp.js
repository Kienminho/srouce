const key = document.querySelector(".key").value;
const url = `/result?key=${key}`;
let category;
fetch(url)
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    if (data.status === 200) {
      filter(data.data);
    }
  });

//lấy div của các thẻ radio
const filterContainer = document.querySelector(".filter-container");
const filterInputs = filterContainer.querySelectorAll('input[name="filter"]');

function filter(array) {
  filterInputs.forEach((input) => {
    input.addEventListener("change", () => {
      const selectedFilter = document.querySelector(
        'input[name="filter"]:checked'
      ).value;
      console.log(selectedFilter);
      if (selectedFilter === "games") {
        category = "G";
      } else if (selectedFilter === "books") {
        category = "B";
      } else if (selectedFilter === "all") {
        category = "";
      } else {
        category = "A";
      }
      console.log(category);
      filterForCategory(array, category);
    });
  });
}
function filterForCategory(array, category) {
  let filteredApps;
  if (category !== "") {
    filteredApps = array.filter((app) => app.category === category);
  } else {
    filteredApps = array;
  }
  const resultContainer = document.getElementById("result-container");
  resultContainer.innerHTML = "";
  filteredApps.forEach((app) => {
    let appHTML = `<div class="col-md-4 mb-3">
    <div class="app-cover p-2 shadow-md bg-white">
        <a href="/app/${app._id}">
            <div class="row">
                <div class="img-cover pe-0 col-3">
                    <img class="rounded" src="images/imgApps/${
                      app.image
                    }.png" alt="">
                </div>
                <div class="det mt-2 col-9">
                    <h5 class="ml-0 mb-0 fs-6">${app.nameApp}</h5>
                    ${generateCategory(category)}
                    <ul class="row">
                        <li class="col-8 ratfac">
                        ${generateRatingStars(app.rating)}
                        </li>
                        <li class="col-4"><span class="text-success float-end">Free</span></li>
                    </ul>
                </div>
            </div>
        </a>
    </div>
</div>`;

    resultContainer.insertAdjacentHTML("beforeend", appHTML);
  });
}
// số sao đánh giá
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

// phân loại app
function generateCategory(category) {
  let html = "";
  if (category === "A") {
    html += '<span class="fs-8">Application</span>';
  } else if (category === "G") {
    html += '<span class="fs-8">Game</span>';
  } else {
    html += '<span class="fs-8">Book</span>';
  }
  return html;
}
