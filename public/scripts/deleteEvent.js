document.addEventListener("DOMContentLoaded", () => {
  const deleteButtons = document.querySelectorAll(".delete-event-button");

  deleteButtons.forEach((button) => {
    button.addEventListener("click", async (event) => {
      event.preventDefault(); // Prevent the default form submission

      const eventId = event.target.dataset.eventId;

      const confirmed = confirm("Are you sure you want to delete this event?");

      if (confirmed) {
        try {
          const response = await fetch(`/events/${eventId}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            alert("Event deleted successfully!");
            window.location.reload(); // Reload the page to reflect changes
          } else {
            alert("Failed to delete the event. Please try again.");
          }
        } catch (error) {
          console.error("Error:", error);
          alert("An error occurred while trying to delete the event.");
        }
      }
    });
  });
});
