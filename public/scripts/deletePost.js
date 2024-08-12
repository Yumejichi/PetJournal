// public/scripts/deletePost.js
document.addEventListener("DOMContentLoaded", () => {
  const deleteButtons = document.querySelectorAll(".delete-post");

  deleteButtons.forEach((button) => {
    button.addEventListener("click", async (event) => {
      const postId = event.target.dataset.postId;

      const confirmed = confirm("Are you sure you want to delete this post?");

      if (confirmed) {
        try {
          const response = await fetch(`/posts/${postId}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            alert("Post deleted successfully!");
            window.location.reload();
          } else {
            alert("Failed to delete the post. Please try again.");
          }
        } catch (error) {
          console.error("Error:", error);
          alert("An error occurred while trying to delete the post.");
        }
      }
    });
  });
});
