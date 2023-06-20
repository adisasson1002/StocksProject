const form = document.getElementById("form");
const email = document.getElementById("email");
const password = document.getElementById("password");
const confirm = document.getElementById("conf");
const msg1 = document.getElementById("eError");
const msg2 = document.getElementById("pError");

email.addEventListener("keyup", validEmail());

function loginFunc(userName, password) {
  let validMail =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  if (!userName.value.match(validMail))
    window.alert("Invalid mail, please try again.");
  else {
    let validPass =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+\\|[\]{};:/?.,><])[A-Za-z\d!@#$%^&*()\-_=+\\|[\]{};:/?.,><]{6,}$/;
    if (!password.value.match(validPass))
      window.alert(
        "Password must include:\n Minimum 6 Characters\n ",
        "Uppercase Character\n Lowercase Character\n a Number\n a Special Character",
        "\n Supported special characters are: ! @ # $ % ^ & * ( ) - _ = +  | [ ] { } ; : / ? . > <"
      );
    else
      window.alert(
        "Email: " + userName.value + "\nPassword: " + password.value
      );
  }
}

function validEmail(email) {
  if (
    !email.value.match(
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
    )
  ) {
    // msg1.innerHTML = "Invalid email address";
    msg1.textContent = "Invalid email address";
    //return false;
  }

  msg1.innerHTML = "";
  //return true;
}

function validPassword() {
  if (!/[A-Z]/.test(password.value)) {
    msg2.innerHTML = "Password must include an uppercase character";
    return false;
  } else {
    if (!/[a-z]/.test(password.value)) {
      msg2.innerHTML = "Password must include an lowercase character";
      return false;
    } else if (!/[0-9]/.test(password.value)) {
      msg2.innerHTML = "Password must include a number";
      return false;
    } else if (!/[!@#$%^&*()\[\]\-_=+\\|{};:/?.,><]/.test(password.value)) {
      msg2.innerHTML = "Password must include: !@#$%^&*()-_=+|[]{};:/?.><";
      return false;
    } else {
      if (!/.{6,}/.test(password.value)) {
        msg2.innerHTML = "Password must have minimum 6 characters";
        return false;
      } else {
        msg2.innerHTML = "";
        return true;
      }
    }
  }
}
