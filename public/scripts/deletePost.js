document.querySelectorAll(".delete-post").forEach((button) => {
  button.addEventListener("click", function () {
    const postId = this.getAttribute("data-post-id");

    if (
      confirm(
        "Are you sure you want to delete this post? This action cannot be undone."
      )
    ) {
      fetch(`/posts/${postId}`, { method: "DELETE" })
        .then((response) => response.json())
        .then((data) => {
          if (data.message) {
            alert(data.message);
            location.reload(); // Reload the page to update the post list
          } else {
            alert("Failed to delete the post.");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("An error occurred. Please try again.");
        });
    }
  });
});
