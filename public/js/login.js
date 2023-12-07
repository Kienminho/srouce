//lấy giá trị của thẻ input
console.log(1111111);
const form = document.querySelector("form");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const messageError = document.querySelector(".message-error");
console.log(messageError);

form.addEventListener("submit", handleSubmit);

function handleSubmit(event) {
  // Ngăn chặn gửi yêu cầu đăng ký mặc định của trình duyệt
  event.preventDefault();

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  // Kiểm tra tính hợp lệ của các trường nhập liệu
  if (username === "") {
    messageError.textContent = "Vui lòng nhập tên người dùng";
    setTimeDisplayMessage(messageError);
    usernameInput.focus();

    return;
  }

  if (password === "") {
    messageError.innerHTML = "Vui lòng nhập mật khẩu";
    setTimeDisplayMessage(messageError);
    passwordInput.focus();
    return;
  }
  handleLoginUser(username, password);
}

function handleLoginUser(username, password) {
  fetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      // Xử lý kết quả trả về từ server
      if (data.status === 200) {
        window.location.href = data.urlRedirect;
      } else {
        messageError.innerHTML = data.message;
        setTimeDisplayMessage(messageError);
      }
    })
    .catch((error) => {
      // Xử lý lỗi nếu có
    });
}

function setTimeDisplayMessage(message) {
  setTimeout(() => {
    message.style.display = "none";
  }, 2000);
  message.style.display = "block";
}
