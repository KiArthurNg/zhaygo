
document.addEventListener('DOMContentLoaded', function() {
const token = localStorage.getItem('token');

if (!token) {
 console.error('No token found');
 return;
}

fetch('http://localhost:3000/api/profile/image', {
 method: 'GET',
 headers: {
     'Authorization': `Bearer ${token}`,
     'Content-Type': 'application/json'
 }
})
.then(response => {
 console.log('Response status:', response.status);
 if (!response.ok) {
     throw new Error('Network response was not ok');
 }
 return response.json();
})
.then(responseData => {
 console.log('Response data:', responseData);
 const imageUrl = `http://localhost:3000${responseData.imageUrl}`;
 document.getElementById("profile-image").src = imageUrl;
})
.catch(error => {
 console.error('Error:', error);
});
});
