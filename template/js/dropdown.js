document.addEventListener('DOMContentLoaded', function() {
    const profileImage = document.getElementById('profile-image');
    const dropdownMenu = document.getElementById('dropdown-menu');
    
    // Toggle dropdown menu on click
    profileImage.addEventListener('click', function() {
        dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
    });

    // Hide dropdown menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!profileImage.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.style.display = 'none';
        }
    });

    // Logout functionality
    document.getElementById('logout').addEventListener('click', function(event) {
        event.preventDefault();
        // Clear the token from localStorage
        localStorage.removeItem('token');
        // Redirect to the homepage
        window.location.href = '/';
    });
});
