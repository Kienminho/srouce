// Lấy form và các trường nhập liệu
const form = document.querySelector("form");
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirm-password");
const messageError = document.querySelector(".text-error");
const errorOtp = document.querySelector(".error-otp");
const message = document.getElementById("message"); // modal thông báo

const array = []; //mảng lưu giá trị
//giá trị mà người dùng nhập vào
// Lấy giá trị của các trường nhập liệu

// Lấy modal
const otpModal = document.getElementById("otpModal");
// Đăng ký một hàm xử lý cho sự kiện submit của form
form.addEventListener("submit", handleSubmit);

function handleSubmit(event) {
  // Ngăn chặn gửi yêu cầu đăng ký mặc định của trình duyệt
  event.preventDefault();
  const username = getInputValue(usernameInput).trim();
  const email = getInputValue(emailInput).trim();
  const password = getInputValue(passwordInput).trim();
  const confirmPassword = getInputValue(confirmPasswordInput).trim();

  // Kiểm tra tính hợp lệ của các trường nhập liệu
  if (!validateUsername(username)) {
    messageError.innerHTML = "Vui lòng nhập tên người dùng";
    setTimeDisplayMessage(messageError);
    focusInput(usernameInput);
    return;
  }
  //email
  if (!validateEmail(email)) {
    messageError.innerHTML = "Vui lòng nhập email đúng định dạng";
    setTimeDisplayMessage(messageError);
    focusInput(emailInput);
    return;
  }

  //pasowrd
  const passwordError = validatePassword(password);
  if (passwordError !== "") {
    messageError.innerHTML = passwordError;
    setTimeDisplayMessage(messageError);
    passwordInput.focus();
    return;
  }

  if (password !== confirmPassword) {
    messageError.innerHTML = "Mật khẩu nhập lại không trùng khớp";
    setTimeDisplayMessage(messageError);
    focusInput(confirmPasswordInput);
    return;
  }

  // Nếu tất cả các trường nhập liệu hợp lệ, gửi yêu cầu đăng ký bằng phương thức POST
  // Xử lý sự kiện khi người dùng bấm nút mở modal

  registerUser(username, email, password);
  array.push(arrayInput(username, email, password));
}

function getInputValue(inputElement) {
  return inputElement.value.trim();
}

function focusInput(inputElement) {
  inputElement.focus();
}

function validateUsername(username) {
  return username !== "";
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
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

function registerUser(username, email, password) {
  fetch("/auth/verify-OTP", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      // Xử lý kết quả trả về từ server
      //showSuccessModal(data);
      otpModal.style.display = "block";
      array.push(data.code);
    })
    .catch((error) => {
      // Xử lý lỗi nếu có
    });
}

//xét thời gian hiển của message
function setTimeDisplayMessage(message) {
  setTimeout(() => {
    message.style.display = "none";
  }, 3000);
  message.style.display = "block";
}

const modal = document.getElementById("success-modal");
let seconds = 4; // số giây để đếm ngược

function showSuccessModal(data) {
  if (data.status === 200) {
    // Hiển thị modal
    message.innerHTML = `Bạn đã đăng ký thành công. Bạn sẽ được chuyển về 
    trang đăng nhập sau <span id="countdown">5</span> giây.`;
    const countdown = document.getElementById("countdown");
    modal.style.display = "block";

    // Đếm ngược và cập nhật giá trị trong modal
    const intervalId = setInterval(() => {
      countdown.textContent = seconds;
      seconds--;
      if (seconds < 0) {
        clearInterval(intervalId);
        // Chuyển hướng trang web sau khi đếm ngược kết thúc
        modal.style.display = "none";
        window.location.href = data.urlRedirect;
      }
    }, 1000);
  } else {
    message.innerHTML = data.message;
    modal.style.display = "block";
    setTimeout(() => {
      modal.style.display = "none"; //hiển thị thông báo lỗi
    }, 5000);
  }
}

// Lấy nút đóng modal
const closeButton = document.querySelector(".close");

const arrayInput = (username, email, password) => {
  return { username, email, password };
};

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

//lấy nút submit của form otp
const btnVerify = document.querySelector(".btn-verify");
function btnVerifySubmit() {
  btnVerify.addEventListener("click", (event) => {
    const name = array[0].username;
    const passWord = array[0].password;
    const emails = array[0].email;
    const code = array[1];
    const otpValue = $(".otp-form .otp-value").val();
    event.preventDefault();
    verifySuccess(name, emails, passWord, code, otpValue);
  });
}
//gửi dữ liệu lên server khi OTP thành công
function verifySuccess(username, email, password, code, otpValue) {
  if (code === otpValue) {
    otpModal.style.display = "none";
    //gửi fetch lên server
    fetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        // Xử lý kết quả trả về từ server
        if (data.status === 200) {
          showSuccessModal(data);
        }
      })
      .catch((error) => {
        // Xử lý lỗi nếu có
      });
  } else {
    setTimeDisplayMessage(errorOtp);
  }
}

btnVerifySubmit();
