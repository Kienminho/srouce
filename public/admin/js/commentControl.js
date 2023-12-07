$("table").on("click", "#block", function (e) {
  let id = $(this).closest("tr").find("td:eq(0)").text().trim();
  $.ajax({
    url: "/admin/appControl/comments/delete",
    type: "POST",
    data: {
      _id: id,
    },
    success: function (r) {
      if (r.message == "success") {
        $("#liveToast").addClass("bg-success text-white");
        $("#liveToast").find(".toast-body").text("Success");
        $("#liveToast").toast("show");

        $("table").load(window.location.href + " table>");
      } else {
        $("#liveToast").find(".toast-body").text("Failed");
        $("#liveToast").toast("show");
      }
    },
  });
});

$("#commentModal").on("click", "select", function () {
  $("#commentModal").find("#alert").fadeOut("fast");
});

$("#commentModal").on("click", "textarea", function () {
  $("#commentModal").find("#alert").fadeOut("fast");
});

$("#addCommentBtn").on("click", function (e) {
  let _id = $("#_idApp").text().trim();

  //let id = $(this).closest('tr').find('td:eq(0)').text().trim();

  $("#commentModal").find("#_id").val(_id);
  $("#commentModal").modal("show");
});

function addComment() {
  let _id = $("#_idApp").text().trim();
  let rating = $("#commentModal").find("#rating").val();
  let content = $("#commentModal").find("#content").val();

  console.log(content);
  console.log(_id);
  console.log(rating);

  if (!content || rating == "") {
    $("#commentModal").find("#alert").text("Please fill all the fields!");
    $("#commentModal").find("#alert").fadeIn("fast");
  } else {
    $.ajax({
      url: "/app/comments/" + _id + "?comment=" + content + "&rating=" + rating,
      type: "GET",
      success: function (r) {
        if (r.message == "Cảm ơn bạn đã đánh giá") {
          $("#liveToast").addClass("bg-success text-white");
          $("#liveToast").find(".toast-body").text("Success");
          $("#liveToast").toast("show");

          $("#commentModal .btn-close").click();
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
