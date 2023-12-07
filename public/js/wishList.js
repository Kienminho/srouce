// lấy tất cả các nút xóa
const deleteButtons = document.querySelectorAll(".delete");

// lặp qua các nút xóa và gán hàm xử lý sự kiện cho mỗi nút
deleteButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    // ngăn chặn hành động mặc định của thẻ a
    event.preventDefault();
    //tên của ứng dụng cần xóa
    const parent = button.parentNode.parentNode.parentNode;
    const appId = event.currentTarget.dataset.id;
    console.log(appId);
    deleteWishList(appId);

    // Lấy ra phần tử h5 bên trong phần tử cha
    const nameApp = parent.querySelector("h5").textContent;
    document.querySelector(".app-delete").textContent = nameApp;
    // hiển thị modal xóa
    $("#confirm-delete").modal("show");
  });
});

function hideModal() {
  $("#confirm-delete").modal("hide");
}

function deleteWishList(id) {
  const btnDelete = document.querySelector(".btn-delete");
  btnDelete.addEventListener("click", () => {
    fetch(`/user/delete-wish-list/${id}`, {
      method: "DELETE",
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (data.status === 200) {
          $("#app-" + id).remove();
          $("#confirm-delete").modal("hide");
        }
      })
      .catch((error) => {
        // xử lý error
      });
  });
}
