document.getElementById('group1').addEventListener('click', function() {
    // Get the image URL and dish name
    const dishImage = document.getElementById('dishImage').src;
    const dishName = document.getElementById('dishName').textContent;
  
    // Create an object for the current dish
    const dish = {
        image: dishImage,
        name: dishName
    };

    // Retrieve the existing cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Add the new dish to the cart array
    cart.push(dish);
    console.log(dish)

    // Store the updated cart back in localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    showAlert()
    console.log("ok")
});
