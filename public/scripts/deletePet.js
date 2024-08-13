document.addEventListener("DOMContentLoaded", () => {
  const deleteButtons = document.querySelectorAll(".delete-pet");

  deleteButtons.forEach((button) => {
    button.addEventListener("click", async function () {
      const petId = this.getAttribute("data-pet-id");
      console.log(`Delete button clicked for pet with ID: ${petId}`); // Debugging

      if (
        confirm(
          "Are you sure you want to delete this pet? This action cannot be undone."
        )
      ) {
        try {
          const response = await fetch(`/pets/${petId}/delete`, {
            method: "DELETE",
          });

          if (response.ok) {
            alert("Pet and all related data deleted successfully!");
            location.reload(); // Reload the page to update the pet list
          } else {
            alert("Failed to delete the pet.");
          }
        } catch (error) {
          console.error("Error:", error);
          alert("An error occurred. Please try again.");
        }
      }
    });
  });
});
