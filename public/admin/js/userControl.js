$("table").on("click", '.edit',function(e){
    let name = $(this).closest('tr').find('td:eq(0)').text().trim();
    let email = $(this).closest('tr').find('td:eq(1)').text().trim();
    $('#editModal').find("#originalName").val(name);
    $('#editModal').find("#name").val(name);
    $('#editModal').find("#email").val(email);
    $('#editModal').modal('show');
})

function saveChanges(){
    let oldName = $('#editModal').find("#originalName").val();
    let newName = $('#editModal').find("#name").val().trim();
    let newEmail = $('#editModal').find("#email").val().trim();
    if(newEmail == '' || newName == ''){
        $("#alert").text('Please fill all the field!')
        $("#alert").fadeIn("fast");
    }else{
        $.ajax({
            url : "userControl/edit",
            type: "POST",
            data: { 
                username: oldName,
                newUsername : newName,
                email : newEmail
            },
            dataType: "json",
            success: function (r) {
                if(r.message == "success"){
                    
                    $("#liveToast").addClass("bg-success text-white")
                    $("#liveToast").find(".toast-body").text("Success")
                    $("#liveToast").toast("show")
                    
                    $('#editModal .btn-close').click();
                    $("table").load(window.location.href + " table>");
                }else{
                    $("#alert").text(r.message)
                    $("#alert").fadeIn("fast");
                }
                
            },
        })
    }
     
}

$("input").on("click", function(){
    $("#alert").fadeOut("fast");
})




$("table").on("click", ".block",function(){
    let name = $(this).closest('tr').find('td:eq(0)').text().trim();
    console.log(name)
    $.ajax({
        url : "userControl/block",
        type: "POST",
        data: { 
            username: name,
        },
        dataType: "json",
        success: function (r) {
            if(r.message == "success"){
                
                $("#liveToast").addClass("bg-success text-white")
                $("#liveToast").find(".toast-body").text("Success")
                $("#liveToast").toast("show")
                
                $("table").load(window.location.href + " table>");

            }else{
                $("#liveToast").addClass("bg-danger text-white")
                $("#liveToast").find(".toast-body").text("Edit failed")
                $("#liveToast").toast("show")
            }
            
        },
    })
})
    
