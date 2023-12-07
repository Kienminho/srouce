const containerProgress = document.querySelector(".container-progress");
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

function refuseUpload(id) {
  $.ajax({
    url: "/admin/rejectUpload",
    type: "POST",
    data: { id: id },
    dataType: "json",
    success: function (d) {
      $("table").load(window.location.href + " table>");
      console.log(d);
    },
  });
}
