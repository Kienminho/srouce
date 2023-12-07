const message = document.getElementById("message"); // modal thông báo
const idAppCurrent = document.querySelector(".id-app").value;
//xử lý comment
document.querySelector("#form-feedback").addEventListener("submit", (event) => {
  // Ngăn chặn hành động mặc định của form
  event.preventDefault();

  // Lấy tất cả các phần tử input có thuộc tính name bắt đầu bằng "star"
  const inputs = document.querySelectorAll('input[name^="star"]');

  // Khởi tạo biến để lưu giá trị của ratings
  let ratings = 0;

  // Duyệt qua tất cả các phần tử input đã lấy được
  inputs.forEach((input) => {
    // Nếu phần tử input đang xét được chọn và giá trị của nó lớn hơn giá trị của ratings
    if (input.checked && input.value > ratings) {
      // Lưu giá trị của phần tử input đó vào biến ratings
      ratings = input.value;
    }
  });

  // Lấy giá trị của textarea
  const comment = document.getElementById("comment").value;

  // Gửi dữ liệu được lấy được lên server để xử lý
  const url = `/app/comments/${idAppCurrent}?comment=${comment}&rating=${ratings}`;
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data.status === 200) {
        location.reload();
      } else {
        displayModel(data, "red");
      }
    })
    .catch((error) => {
      //console.log(error);
    });
});

//thêm sản phẩm vào wish list
document.querySelector(".add-wishList").addEventListener("click", (event) => {
  event.preventDefault();
  fetch(`/user/add-wish-list/${idAppCurrent}`)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if (data.status === 200) {
        displayModel(data, "green");
      } else {
        displayModel(data, "red");
      }
    })
    .catch((error) => {
      console.log(error);
    });
});

const downloadButton = document.getElementById("download-button");
const href = downloadButton.querySelector("a").getAttribute("href");
console.log(href);

downloadButton.addEventListener("click", function (event) {
  event.preventDefault(); // Ngăn chặn hành động mặc định của button

  // Gửi yêu cầu tăng số lượng download đến server
  fetch("/user/increase-download-count", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      idApp: idAppCurrent,
    }),
  })
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then(function (data) {
      if (data.status !== 200) {
        displayModel(data, "red");
      } else {
        // Mở link tới đường dẫn của app
        window.open(href, "_blank");
      }
    })
    .catch(function (error) {
      console.error("There was a problem with the fetch operation:", error);
    });
});
