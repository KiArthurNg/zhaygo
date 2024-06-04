function showAlert() {
    Swal.fire({
        title: 'Added to Cart!',
        text: '',
        icon: 'success',
        confirmButtonText: 'OK',
        customClass: {
            container: 'custom-swal-container',
            title: 'custom-swal-title',
            content: 'custom-swal-content',
            confirmButton: 'custom-swal-confirm-button',
        }
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = '/menu';
        }
    });
}