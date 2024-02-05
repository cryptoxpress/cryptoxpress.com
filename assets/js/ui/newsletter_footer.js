const mobileScreen = "@media screen and (max-width: 730px)";

function submitEmail() {
  const email = document.getElementById("subscribe_email").value;
  console.log(email);
}

const inputChild = document.querySelector(".group-child");
const inputSubmission = document.querySelector(".input-submission");
if (window.matchMedia(mobileScreen).matches) {
  inputChild.classList.add("mobile");
  inputSubmission.classList.add("mobile");
  document.querySelector(".input-container").classList.add("mobile");
  document.querySelector(".styled-title").classList.add("mobile");
}
