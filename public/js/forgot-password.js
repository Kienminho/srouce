//nhảy số khi người dùng nhập
$(".otp-form *:input[type!=hidden]:first").focus();
let otp_fields = $(".otp-form .otp-field"),
  otp_value_field = $(".otp-form .otp-value");
otp_fields
  .on("input", function (e) {
    $(this).val(
      $(this)
        .val()
        .replace(/[^0-9]/g, "")
    );
    let opt_value = "";
    otp_fields.each(function () {
      let field_value = $(this).val();
      if (field_value != "") opt_value += field_value;
    });
    otp_value_field.val(opt_value);
  })
  .on("keyup", function (e) {
    let key = e.keyCode || e.charCode;
    if (key == 8 || key == 46 || key == 37 || key == 40) {
      // Backspace or Delete or Left Arrow or Down Arrow
      $(this).prev().focus();
    } else if (key == 38 || key == 39 || $(this).val() != "") {
      // Right Arrow or Top Arrow or Value not empty
      $(this).next().focus();
    }
  })
  .on("paste", function (e) {
    let paste_data = e.originalEvent.clipboardData.getData("text");
    let paste_data_splitted = paste_data.split("");
    $.each(paste_data_splitted, function (index, value) {
      otp_fields.eq(index).val(value);
    });
  });

//array lưu data
const arrayData = [];

//lấy các thẻ nhập password mới
const divNewPassword = document.querySelector(".new-password");
const inputEmail = document.querySelector(".email-mb-3");
const inputPassword = document.querySelector("#password");
// Lấy modal
const otpModal = document.getElementById("otpModal");

const btnSubmitEmail = document.querySelector(".btn-submit-email");
//lấy giá trị của input email
const email = document.getElementById("email");
const errorMessage = document.querySelector(".text-error");
btnSubmitEmail.addEventListener("click", (e) => {
  e.preventDefault();
  const value = email.value.trim();
  arrayData.push(value);
  //email
  if (!validateEmail(value)) {
    errorMessage.innerHTML = "Vui lòng nhập email đúng định dạng";
    setTimeDisplayMessage(errorMessage);
    email.focus();
    return;
  }
  sendRequest(value);
});

//gửi request lên server
function sendRequest(email) {
  fetch("/auth/receive-request", {
    method: "POST",
    body: JSON.stringify({ email }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === 200) {
        errorMessage.style.color = "green";
        errorMessage.innerHTML = "Gửi email thành công";
        setTimeDisplayMessage(errorMessage);
        arrayData.push(data.code);
        otpModal.style.display = "block";
      } else {
        errorMessage.innerHTML = data.message;
        setTimeDisplayMessage(errorMessage);
      }
    })
    .catch((error) => {
      // Xử lý lỗi nếu có
    });
}

//hàm validate email
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

//xét thời gian hiển của message
function setTimeDisplayMessage(message) {
  setTimeout(() => {
    message.style.display = "none";
  }, 3000);
  message.style.display = "block";
}

// Lấy nút đóng modal
const closeButton = document.querySelector(".close");
const btnForgotPassword = document.querySelector(".btn-forgot-password");
//btn thay đổi mật khẩu
const btnChangePassword = document.querySelector(".btn-change-password");

//lấy value các trường input
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirm-password");
const errorOtp = document.querySelector(".error-otp");
// Xử lý sự kiện khi người dùng bấm nút đóng modal
closeButton.onclick = function () {
  otpModal.style.display = "none";
};

//nhấn nút xác nhận sau khi điền haonf thành otp
btnForgotPassword.addEventListener("click", (event) => {
  event.preventDefault();
  const otpValue = $(".otp-form .otp-value").val();
  const newPassword = inputPassword.value;
  verifyOTP(otpValue);
});

//xác nhận otp
function verifyOTP(otpValue) {
  console.log(arrayData);
  console.log(otpValue);
  if (otpValue === arrayData[1]) {
    //ẩn modal
    otpModal.style.display = "none";
    inputEmail.style.display = "none";
    divNewPassword.style.display = "block";
    btnSubmitEmail.style.display = "none";
    btnChangePassword.style.display = "block";
  } else {
    setTimeDisplayMessage(errorOtp);
  }
}

btnChangePassword.addEventListener("click", (event) => {
  event.preventDefault();
  changePassword(arrayData[0]);
});
//thay đổi mật khẩu
function changePassword(email) {
  const password = passwordInput.value.trim();
  const confirmPassword = confirmPasswordInput.value.trim();
  //pasowrd
  const passwordError = validatePassword(password);
  if (passwordError !== "") {
    errorMessage.innerHTML = passwordError;
    setTimeDisplayMessage(errorMessage);
    passwordInput.focus();
    return;
  }

  if (password !== confirmPassword) {
    errorMessage.innerHTML = "Mật khẩu nhập lại không trùng khớp";
    setTimeDisplayMessage(errorMessage);
    confirmPasswordInput.focus();
    return;
  }

  fetch("/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === 200) {
        errorMessage.innerHTML = data.message;
        errorMessage.style.color = "green";
        errorMessage.classList.remove("text-danger");
        setTimeDisplayMessage(errorMessage);
      }
    })
    .catch((error) => {
      // Xử lý lỗi nếu có
    });
}

function validatePassword(password) {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

  if (password === "") {
    return "Vui lòng nhập mật khẩu";
  }

  if (password.length < 8) {
    return "Mật khẩu phải lớn hơn 8 kí tự";
  }

  if (!passwordRegex.test(password)) {
    return "Mật khẩu phải chứa ít nhất một chữ thường, một chữ in hoa và một số";
  }

  return "";
}
