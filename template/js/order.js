document.getElementById('groupButton1').addEventListener('click', function() {
    // Get the image URL and dish name
    const dishImage = document.getElementById('dishImage').src;
    const dishName = document.getElementById('dishName').textContent;
  
    // Store the image URL and dish name in localStorage
    localStorage.setItem('dishImage', dishImage);
    localStorage.setItem('dishName', dishName);
  
    // Redirect to the new page
    window.location.href = '/order';
  });
  