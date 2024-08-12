document.addEventListener("DOMContentLoaded", function () {
  // Category selection - apply immediately after changing the option
  const categoryElement = document.getElementById("category");
  if (categoryElement) {
    categoryElement.addEventListener("change", function () {
      const category = categoryElement.value;
      const searchQuery = document.getElementById("search").value;
      // Redirect with the selected category and the current search query (if any)
      window.location.href = `/home?category=${category}&search=${searchQuery}`;
    });
  }

  // Search button click - apply the search query only when the button is clicked
  const searchButtonElement = document.getElementById("searchButton");
  if (searchButtonElement) {
    searchButtonElement.addEventListener("click", function () {
      const category = document.getElementById("category").value;
      const searchQuery = document.getElementById("search").value;
      // Redirect with both category and search query
      window.location.href = `/home?category=${category}&search=${searchQuery}`;
    });
  }

  // Keep the search word in the input field after clicking the search button
  const urlParams = new URLSearchParams(window.location.search);
  const searchQueryParam = urlParams.get("search");
  if (searchQueryParam) {
    document.getElementById("search").value = searchQueryParam;
  }
});
