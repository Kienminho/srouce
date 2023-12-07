$("#uploadForm").on("click", "textarea", function () {
  $("#alert").fadeOut("fast");
});

$("#uploadForm").on("click", "input", function () {
  $("#alert").fadeOut("fast");
});

$("#uploadForm").on("click", "select", function () {
  $("#alert").fadeOut("fast");
});

$("#editModal").on("click", "textarea", function () {
  $("#editModal").find("#alert").fadeOut("fast");
});

$("#editModal").on("click", "input", function () {
  $("#editModal").find("#alert").fadeOut("fast");
});

$("#editModal").on("click", "select", function () {
  $("#editModal").find("#alert").fadeOut("fast");
});

$("#imageModal").on("click", "#fileImage", function () {
  $("#imageModal").find("#alert").fadeOut("fast");
});

function acceptUpload(id) {
  containerProgress.style.display = "block";
  $.ajax({
    url: "/admin/uploadToCloud",
    type: "POST",
    data: { id: id },
    dataType: "json",
    success: function (d) {
      containerProgress.style.display = "none";
      $("table").load(window.location.href + " table>");
    },
  });
}

$("#uploadForm").submit(function (e) {
  e.preventDefault();

  var imageExtension = ["jpeg", "jpg", "png"];

  let source = $("#file").val();
  let image = $("#fileImage").val();
  let category = $("#category").val();
  let description = $("#fileDescription").val();

  let fileType = source.substr(source.lastIndexOf(".") + 1, source.length);
  let imageType = image.substr(image.lastIndexOf(".") + 1, image.length);

  if (
    !$("#fileName").val() ||
    !source ||
    !image ||
    category == "none" ||
    !description
  ) {
    setAlert("Please fill all the field to make a request!");
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
      url: "appControl/upload",
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
          $("#file").val("");
          $("#fileImage").val("");
          $("#fileDescription").val("");
          $("#fileName").val("");
          $("#category").val("none").change();

          $("#successAlert").hide();
          $("#uploadModal .btn-close").click();
          $("#uploadRequestButton").removeClass("disabled");
        }, 3000);
      },
      error: function (e) {
        $("#uploadRequestButton").removeClass("disabled");
        console.log("Error: ", e);
      },
    });
  }
});

$("table").on("click", "#block", function () {
  let id = $(this).closest("tr").find("td:eq(0)").text().trim();

  $.ajax({
    url: "appControl/block",
    type: "POST",
    data: {
      idApp: id,
    },
    dataType: "json",
    success: function (r) {
      if (r.message == "success") {
        $("#liveToast").addClass("bg-success text-white");
        $("#liveToast").find(".toast-body").text("Success");
        $("#liveToast").toast("show");

        $("table").load(window.location.href + " table>");
      } else {
        $("#liveToast").addClass("bg-danger text-white");
        $("#liveToast").find(".toast-body").text("Edit failed");
        $("#liveToast").toast("show");
      }
    },
  });
});

$("table").on("click", "#editDetail", function (e) {
  let id = $(this).closest("tr").find("td:eq(0)").text().trim();
  let name = $(this).closest("tr").find("td:eq(1)").text().trim();
  let category = $(this).closest("tr").find("td:eq(3)").text().trim();
  let description = $(this).closest("tr").find("td:eq(7)").text().trim();
  $("#editModal").find("#category").val(category).change();
  $("#editModal")
    .find("h4")
    .html("Update app id &nbsp;<strong>" + id + "</strong>");
  $("#editModal").find("#fileName").val(name);
  $("#editModal").find("#fileDescription").val(description);
  $("#editModal").modal("show");
});

$("table").on("click", "#editImage", function (e) {
  let id = $(this).closest("tr").find("td:eq(0)").text().trim();
  $("#imageModal").find("#idApp").val(id);
  $("#imageModal").modal("show");
});

$("table").on("click", "#editFile", function (e) {
  let id = $(this).closest("tr").find("td:eq(0)").text().trim();
  let category = $(this).closest("tr").find("td:eq(3)").text().trim();
  $("#fileModal").find("#category").val(category);
  $("#fileModal").find("#idApp").val(id);
  $("#fileModal").modal("show");
});

function saveChanges() {
  let idApp = $("#editModal").find(".modal-title").find("strong").text();
  let category = $("#editModal").find("#category").val();
  let nameApp = $("#editModal").find("#fileName").val();
  let description = $("#editModal").find("#fileDescription").val();
  if (!category || !nameApp || category == "none" || !description) {
    $("#editModal").find("#alert").text("Please fill all the fields!");
    $("#editModal").find("#alert").fadeIn("fast");
  } else {
    $.ajax({
      url: "appControl/updateDetails",
      type: "POST",
      data: {
        idApp: idApp,
        nameApp: nameApp,
        description: description,
        category: category,
      },
      dataType: "json",
      success: function (r) {
        if (r.message == "success") {
          $("#liveToast").addClass("bg-success text-white");
          $("#liveToast").find(".toast-body").text("Success");
          $("#liveToast").toast("show");

          $("#editModal .btn-close").click();
          $("table").load(window.location.href + " table>");
        } else {
          $("#alert").text(r.message);
          $("#alert").fadeIn("fast");
        }
      },
      error: function (e) {
        console.log(e);
      },
    });
  }
}

function saveChangeImage() {
  let idApp = $("#imageModal").find("#idApp").val();

  let img = $("#imageModal").find("#fileImage").val();

  var form = new FormData();
  form.append("image", $("#imageModal").find("#fileImage")[0].files[0]);
  form.append("idApp", idApp);
  var imageExtension = ["jpeg", "jpg", "png"];
  let imgType = img.substr(img.lastIndexOf(".") + 1, img.length);
  if (!img) {
    $("#imageModal").find("#alert").text("Please select an image!");
    $("#imageModal").find("#alert").fadeIn("fast");
  } else if (!imageExtension.includes(imgType)) {
    $("#imageModal").find("#alert").text("Invalid image format!");
    $("#imageModal").find("#alert").fadeIn("fast");
  } else {
    $("#imageModal").find("#submitBtn").attr("disabled", "disabled");
    $.ajax({
      type: "POST",
      url: "appControl/updateImage",
      data: form,
      processData: false,
      contentType: false,
      success: function (r) {
        if (r.message == "success") {
          $("#imageModal").find("#fileImage").val("");
          $("#imageModal").find("#submitBtn").removeAttr("disabled");
          $("#liveToast").addClass("bg-success text-white");
          $("#liveToast").find(".toast-body").text("Success");
          $("#liveToast").toast("show");

          $("#imageModal .btn-close").click();
          $("table").load(window.location.href + " table>");
        } else {
          $("#imageModal").find("#submitBtn").removeAttr("disabled");
          $("#liveToast").addClass("bg-danger text-white");
          $("#liveToast").find(".toast-body").text("Failed");
          $("#liveToast").toast("show");
        }
      },
      error: function (e) {
        $("#liveToast").addClass("bg-danger text-white");
        $("#imageModal").find("#submitBtn").removeAttr("disabled");
        $("#liveToast").find(".toast-body").text("Failed");
        $("#liveToast").toast("show");
      },
    });
  }
}

function saveChangeFile() {
  let idApp = $("#fileModal").find("#idApp").val();
  let category = $("#fileModal").find("#category").val();
  let file = $("#fileModal").find("#file").val();

  var form = new FormData();
  form.append("file", $("#fileModal").find("#file")[0].files[0]);
  form.append("idApp", idApp);
  form.append("category", category);

  var imageExtension = ["jpeg", "jpg", "apk"];
  let fileType = file.substr(file.lastIndexOf(".") + 1, file.length);
  if (!file) {
    $("#fileModal").find("#alert").text("Please select a file!");
    $("#fileModal").find("#alert").fadeIn("fast");
  } else if (
    (fileType == "pdf" && category != "B") ||
    (fileType == "apk" && category != "A" && category != "G")
  ) {
    $("#fileModal")
      .find("#alert")
      .text("This file cannot be put into that category!");
    $("#fileModal").find("#alert").fadeIn("fast");
  } else {
    $("#fileModal").find("#submitBtn").attr("disabled", "disabled");
    $.ajax({
      type: "POST",
      url: "appControl/updateFile",
      data: form,
      processData: false,
      contentType: false,
      success: function (r) {
        if (r.message == "success") {
          $("#fileModal").find("#file").val("");
          $("#fileModal").find("#submitBtn").removeAttr("disabled");
          $("#liveToast").addClass("bg-success text-white");
          $("#liveToast").find(".toast-body").text("Success");
          $("#liveToast").toast("show");

          $("#fileModal .btn-close").click();
          $("table").load(window.location.href + " table>");
        } else {
          $("#fileModal").find("#submitBtn").removeAttr("disabled");
          $("#liveToast").addClass("bg-danger text-white");
          $("#liveToast").find(".toast-body").text("Failed");
          $("#liveToast").toast("show");
        }
      },
      error: function (e) {
        $("#liveToast").addClass("bg-danger text-white");
        $("#fileModal").find("#submitBtn").removeAttr("disabled");
        $("#liveToast").find(".toast-body").text("Failed");
        $("#liveToast").toast("show");
      },
    });
  }
}

function setAlert(text) {
  $("#alert").text(text);
  $("#alert").fadeIn("fast");
}
