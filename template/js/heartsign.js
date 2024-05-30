document.addEventListener("DOMContentLoaded", function() {
    const svgImages = document.querySelectorAll(".svg-toggle");
    const originalSvgSrc = "./images/vector-15.svg";
    const newSvgSrc = "./images/heart_red.svg";

    svgImages.forEach(function(svgImage) {
      svgImage.addEventListener("click", function() {
        const currentSrc = svgImage.getAttribute('src');
        if (currentSrc === originalSvgSrc) {
          svgImage.setAttribute('src', newSvgSrc);
        } else {
          svgImage.setAttribute('src', originalSvgSrc);
        }
      });
    });
  });
