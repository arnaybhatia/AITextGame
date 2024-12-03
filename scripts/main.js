const myImage = document.querySelector("img");

myImage.onclick = () => {
  const mySrc = myImage.getAttribute("src");
  if (mySrc === "images/firefox-icon.png") {
    myImage.setAttribute("src", "images/derpyWoody.jpeg");
  } else {
    myImage.setAttribute("src", "images/logo.webp");
  }
};