document.querySelectorAll(".delete-pet").forEach((button) => {
  button.addEventListener("click", function () {
    const petId = this.getAttribute("data-pet-id");

    if (
      confirm(
        "Are you sure you want to delete this pet? This action cannot be undone."
      )
    ) {
      fetch(`/pets/${petId}/delete`, { method: "DELETE" })
        .then((response) => response.json())
        .then((data) => {
          if (data.message) {
            alert(data.message);
            location.reload(); // Reload the page to update the pet list
          } else {
            alert("Failed to delete the pet.");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("An error occurred. Please try again.");
        });
    }
  });
});
