const myImage = document.querySelector("img");

myImage.onclick = () => {
  const mySrc = myImage.getAttribute("src");
  console.log("click recieved");
  if (mySrc === "images/logo.webp") {
    myImage.setAttribute("src", "images/derpyWoody.jpeg");
    console.log("derpy woody");
  } else {
    myImage.setAttribute("src", "images/logo.webp");
    console.log("logo");
  }
};