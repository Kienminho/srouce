const uploadModal = $("#upload-modal");

// SEND UPLOAD REQUEST
$("#uploadForm").submit(function (e) {
  e.preventDefault();

  var imageExtension = ["jpeg", "jpg", "png"];

  let source = $("#file").val();
  let image = $("#fileImage").val();
  let category = $("#category").val();

  let fileType = source.substr(source.lastIndexOf(".") + 1, source.length);
  let imageType = image.substr(image.lastIndexOf(".") + 1, image.length);
  console.log(fileType);
  if (!$("#fileName").val() || !source || !image || category == "none") {
    setAlert("Not enough information to make an upload request!");
  } else if (fileType != "apk" && fileType != "pdf") {
    setAlert("Invalid file format!");
  } else if (
    (fileType == "apk" && category != "A" && category != "G") ||
    (fileType == "pdf" && category != "B")
  ) {
    setAlert("This file cannot be put into that category!");
  } else if (!imageExtension.includes(imageType)) {
    setAlert("Invalid image format!");
  } else {
    $("#uploadRequestButton").addClass("disabled");
    var formData = new FormData(this);
    $.ajax({
      type: "POST",
      url: "/user/upload",
      data: formData,
      processData: false,
      contentType: false,
      xhr: function () {
        var xhr = new window.XMLHttpRequest();
        // Upload progress
        xhr.upload.addEventListener("progress", function (e) {
          if (e.lengthComputable) {
            var percentComplete = (e.loaded / e.total) * 100;
            $(".container-progress").show();
            $(".progress-bar").width(percentComplete + "%");
            if (percentComplete === 100) {
              setTimeout(function () {
                $(".container-progress").hide();
                $(".progress-bar").width(0);
              }, 1500);
            }
          }
        });
        return xhr;
      },
      success: function (r) {
        console.log(r);
        $("#successAlert").text("Your request has been sent");
        $("#successAlert").show();
        setTimeout(function () {
          $("#successAlert").hide();
          $("#uploadModal .btn-close").click();
          $("#uploadRequestButton").removeClass("disabled");
        }, 4000);
      },
      error: function (e) {
        console.log("some error", e);
      },
    });
  }
});

//xử lý wish list
document.querySelector(".wish-list").addEventListener("click", (event) => {
  event.preventDefault();
  fetch("/user/wish-list")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if (data.status !== 200) {
        displayModel(data, "red");
      }
    })
    .catch((error) => {
      //console.log(error);
    });
});

//xử lý my download
document.querySelector(".my-downloads").addEventListener("click", (event) => {
  event.preventDefault();
  fetch("/user/my-downloads")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if (data.status !== 200) {
        displayModel(data, "red");
      }
    })
    .catch((error) => {
      //console.log(error);
    });
});
function displayModel(data, color) {
  const modal = document.getElementById("success-modal");
  modal.querySelector("p").style.color = color;
  message.innerHTML = data.message;
  modal.style.display = "block";
  setTimeout(() => {
    modal.style.display = "none"; // chuyển hướng sang trang đăng nhập sau 3 giây
  }, 3000);
}

//modal upload sản phẩm
function setAlert(content) {
  $("#uploadAlert").text(content);
  $("#uploadAlert").show();
  setTimeout(function () {
    $("#uploadAlert").hide();
  }, 3000);
}
