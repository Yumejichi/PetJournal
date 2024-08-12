const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Ensure this path is correct and the User model exists
const multer = require("multer");
const Post = require("../models/Post"); // Assuming you have a Post model
const Pet = require("../models/Pet"); // Ensure this path is correct
const Event = require("../models/Event"); // Adjust the path as needed

const bcrypt = require("bcrypt"); // Make sure bcrypt is installed

// Middleware to ensure the user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    res.locals.user = req.session.user; // Attach user to res.locals
    return next();
  } else {
    res.render("login_first", {
      title: "Please Log In",
      message: "Please log in first to access this page.",
    });
  }
}

// Configure Multer for handling file uploads in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Route to display all posts on the homepage (both / and /home)
router.get(["/", "/home"], async (req, res) => {
  try {
    const category = req.query.category || "all";
    const search = req.query.search || ""; // Ensure search is initialized even if not provided

    // console.log("Received category:", category);
    // console.log("Received search term:", search);

    // Create a query object
    const query = {};
    let petIds = [];

    if (category !== "all") {
      const pets = await Pet.find({
        category: { $regex: new RegExp(category, "i") },
      }).lean();
      petIds = pets.map((pet) => pet._id);

      if (petIds.length > 0) {
        query.petId = { $in: petIds };
      } else {
        // If no pets match the category, return an empty result
        return res.render("home", {
          title: "Home",
          user: req.session.user,
          posts: [],
          selectedCategory: category,
          searchQuery: search,
        });
      }
    }

    // Add search filter to query
    // Add search filter to query
    if (search) {
      const lowerCaseSearch = search.toLowerCase();
      query.$or = [
        { title: { $regex: new RegExp(lowerCaseSearch, "i") } },
        { message: { $regex: new RegExp(lowerCaseSearch, "i") } },
      ];
    }

    // Fetch posts based on the query and sort by date in descending order
    const posts = await Post.find(query).sort({ date: -1 }).lean();

    // console.log("Posts retrieved:", posts); // Log the posts retrieved

    // Convert images stored as Buffers to base64 strings
    posts.forEach((post) => {
      if (post.image && post.image.length) {
        post.imageUrl = post.image.map(
          (imgBuffer) =>
            `data:image/jpeg;base64,${imgBuffer.toString("base64")}`
        );
      }
    });

    res.render("home", {
      title: "Home",
      user: req.session.user,
      posts: posts,
      selectedCategory: category,
      searchQuery: search,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).render("error_page", {
      title: "Error",
      message: "There was an issue fetching the posts. Please try again later.",
    });
  }
});

// Route to render the registration page
router.get("/register", (req, res) => {
  res.render("register", { layout: "register_layout", title: "Register" });
});
// POST route to handle registration
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if the email or username already exists
    const existingEmail = await User.findOne({ email });
    const existingUsername = await User.findOne({ username });

    if (existingEmail || existingUsername) {
      let errorMessage = "User already exists";
      if (existingEmail) {
        errorMessage = `An account with the email "${email}" already exists.`;
      }
      if (existingUsername) {
        errorMessage = `The username "${username}" is already taken.`;
      }
      return res.render("register", {
        layout: "register_layout",
        title: "Register",
        errorMessage: errorMessage,
        username: username,
        email: email,
      });
    }

    // Create a new user
    const newUser = new User({ username, email, password });
    await newUser.save();

    // Render the success page with a message and without the main layout
    return res.render("register_success", {
      title: "Registration Successful",
      successMessage: "User registered successfully. Please log in.",
      layout: "register_layout", // Ensuring the register layout is used here
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).render("register", {
      layout: "register_layout",
      title: "Register",
      errorMessage: "Server error. Please try again later.",
      username: username,
      email: email,
    });
  }
});

// Route to render the login page
router.get("/login", (req, res) => {
  res.render("login", { layout: "register_layout", title: "Login" });
});

// POST route to handle login
// POST route to handle login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.render("login", {
        title: "Login",
        errorMessage: "Invalid email or password.",
      });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.render("login", {
        title: "Login",
        errorMessage: "Invalid email or password.",
      });
    }

    // Store user session
    req.session.user = {
      username: user.username,
      email: user.email,
      _id: user._id,
    };

    // Fetch all posts to display on the homepage
    const posts = await Post.find({}).sort({ date: -1 }).lean();

    // Convert image buffer(s) to base64 string(s)
    posts.forEach((post) => {
      if (post.image && post.image.length) {
        post.imageUrl = post.image.map(
          (imgBuffer) =>
            `data:image/jpeg;base64,${imgBuffer.toString("base64")}`
        );
      }
    });

    // Redirect to the home page with the posts data
    return res.render("home", {
      title: "Home",
      user: req.session.user,
      posts: posts,
      successMessage: "Login successful!",
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).render("login", {
      title: "Login",
      errorMessage: "Server error. Please try again later.",
    });
  }
});

router.get("/profile", ensureAuthenticated, async (req, res) => {
  try {
    const pets = await Pet.find({ owner: req.session.user._id });

    // Convert the profilePhoto to a Base64 string
    const petsWithBase64 = pets.map((pet) => ({
      ...pet.toObject(),
      profilePhoto: pet.profilePhoto
        ? `data:image/jpeg;base64,${pet.profilePhoto.toString("base64")}`
        : null,
    }));

    res.render("profile", {
      title: "My Profile",
      user: req.session.user,
      pets: petsWithBase64,
    });
  } catch (error) {
    console.error("Error fetching pets:", error);
    res.status(500).render("error_page", {
      title: "Error",
      message: "There was an issue fetching your pets. Please try again later.",
    });
  }
});

// Route to serve the profile photo
router.get("/pets/:petId/edit", ensureAuthenticated, async (req, res) => {
  console.log(`Attempting to edit pet with ID: ${req.params.petId}`);
  try {
    const pet = await Pet.findById(req.params.petId).lean(); // Use .lean() here
    if (!pet) {
      return res.status(404).render("error_page", {
        title: "Pet Not Found",
        message: "Pet not found. Please try again later.",
      });
    }
    // console.log(`Pet found: ${pet.name}`);

    res.render("edit_pet", {
      title: "Edit Pet",
      user: req.session.user,
      pet, // Pass the plain object to the template
    });
  } catch (error) {
    console.error("Error fetching pet for edit:", error);
    res.status(500).render("error_page", {
      title: "Error",
      message: "There was an issue fetching the pet. Please try again later.",
    });
  }
});

router.post(
  "/pet/:petId/edit",
  ensureAuthenticated,
  upload.single("profilePhoto"),
  async (req, res) => {
    try {
      const { name, category } = req.body;
      const petId = req.params.petId;

      const pet = await Pet.findById(petId);
      if (!pet) {
        return res.status(404).render("error_page", {
          title: "Pet Not Found",
          message: "Pet not found. Please try again later.",
        });
      }

      pet.name = name;
      pet.category = category;

      if (req.file) {
        pet.profilePhoto = req.file.buffer;
      }

      await pet.save();

      res.redirect("/profile");
    } catch (error) {
      console.error("Error updating pet:", error);
      res.status(500).render("error_page", {
        title: "Error",
        message: "There was an issue updating the pet. Please try again later.",
      });
    }
  }
);

// Route to display posts for a specific pet
router.get("/pets/:petId/posts", ensureAuthenticated, async (req, res) => {
  try {
    const petId = req.params.petId;
    // console.log("Fetching posts for petId:", petId);

    const pet = await Pet.findById(petId).lean(); // Convert Mongoose document to plain JS object
    const posts = await Post.find({ petId }).lean();

    // Convert image buffer to base64 in each post
    posts.forEach((post) => {
      if (post.image && post.image.length) {
        post.image = post.image.map((imgBuffer) =>
          imgBuffer.toString("base64")
        );
      }
    });

    // console.log("Pet found:", pet);
    // console.log("Posts found:", posts);

    res.render("petPosts", {
      title: `${pet.name}'s Posts`,
      pet: pet,
      posts: posts,
    });
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).render("error_page", {
      title: "Error",
      message: "There was an issue fetching the posts.",
    });
  }
});

router.delete("/pets/:petId/delete", ensureAuthenticated, async (req, res) => {
  try {
    const petId = req.params.petId;

    // Find and delete the pet by ID
    const deletedPet = await Pet.findByIdAndDelete(petId);

    if (!deletedPet) {
      return res.status(404).json({ error: "Pet not found" });
    }

    // Optionally, you can also delete related posts and other data associated with the pet
    await Post.deleteMany({ petId: petId });

    res.status(200).json({ message: "Pet deleted successfully" });
  } catch (error) {
    console.error("Error deleting pet:", error);
    res
      .status(500)
      .json({ error: "An error occurred while trying to delete the pet" });
  }
});

router.post(
  "/addPet",
  ensureAuthenticated,
  upload.single("profilePhoto"),
  async function (req, res) {
    try {
      // Ensure category is included in the destructuring
      const { name, category } = req.body; // This line should correctly extract category
      const owner = req.session.user._id;

      // Check if a pet with the same name already exists for this user
      const existingPet = await Pet.findOne({ name, owner });
      if (existingPet) {
        return res.status(400).render("profile", {
          title: "My Profile",
          user: req.session.user,
          errorMessage: "A pet with this name already exists.",
        });
      }

      // Create a new pet
      const newPet = new Pet({
        name,
        owner,
        category,
        profilePhoto: req.file ? req.file.buffer : null, // Store the file as binary data
      });

      await newPet.save();

      res.redirect("/profile"); // Redirect to the profile page after successful pet creation
    } catch (error) {
      console.error("Error adding pet:", error);
      res.status(500).render("profile", {
        title: "My Profile",
        user: req.session.user,
        errorMessage:
          "An error occurred while adding the pet. Please try again later.",
      });
    }
  }
);

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error logging out:", err);
      return res.status(500).send("Failed to log out. Please try again.");
    }
    res.redirect("/"); // Redirect to the home page after logging out
  });
});

router.get("/newPost", ensureAuthenticated, async (req, res) => {
  try {
    const pets = await Pet.find({ owner: req.session.user._id }).lean();
    if (pets.length === 0) {
      return res.redirect("/profile"); // Redirect to profile if no pets are found
    }
    res.render("newPost", { title: "New Post", user: req.session.user, pets });
  } catch (error) {
    console.error("Error fetching pets:", error);
    res.status(500).render("error_page", {
      title: "Error",
      message: "There was an issue fetching your pets. Please try again later.",
    });
  }
});

router.post(
  "/newPost",
  ensureAuthenticated,
  upload.single("image"),
  async (req, res) => {
    try {
      const { title, message, petId } = req.body;
      const userId = req.session.user._id;

      // Create a new post with the provided data
      const newPost = new Post({
        title,
        message,
        petId,
        userId,
        image: req.file ? req.file.buffer : null, // Store the file as binary data
        date: new Date(),
      });

      await newPost.save();

      // Redirect to the home or posts page after successfully creating the post
      res.redirect("/home");
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).render("error_page", {
        title: "Error",
        message:
          "There was an issue creating your post. Please try again later.",
      });
    }
  }
);

// Route to display the events page
router.get("/events", ensureAuthenticated, async (req, res) => {
  try {
    // Fetch all pets owned by the user
    const pets = await Pet.find({ owner: req.session.user._id }).lean();

    // Fetch all events for the user's pets and sort them by eventDate in ascending order
    const events = await Event.find({ ownerId: req.session.user._id })
      .sort({ eventDate: 1 }) // Sort by eventDate in ascending order
      .lean();

    // Group events by petId
    const eventsByPet = pets.map((pet) => {
      const petEvents = events.filter(
        (event) => event.petId.toString() === pet._id.toString()
      );
      return {
        petName: pet.name,
        events: petEvents,
      };
    });

    // Render the events page, passing both the grouped events and the pets
    res.render("events", {
      title: "My Pet's Events",
      eventsByPet: eventsByPet, // Pass the grouped events to the view
      pets: pets, // Pass the pets array to populate the dropdown
      user: req.session.user,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).render("error_page", {
      title: "Error",
      message:
        "There was an issue fetching your events. Please try again later.",
    });
  }
});

// Route to handle adding a new event
router.post("/events", ensureAuthenticated, async (req, res) => {
  try {
    const { petId, title, description, eventDate } = req.body;
    const userId = req.session.user._id;

    // Create a new event with the provided data
    const newEvent = new Event({
      petId,
      title,
      description,
      eventDate,
      ownerId: userId,
    });

    await newEvent.save();

    // Redirect back to the events page after successfully creating the event
    res.redirect("/events");
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).render("error_page", {
      title: "Error",
      message:
        "There was an issue creating your event. Please try again later.",
    });
  }
});

// Route to handle deleting an event
router.delete("/events/:eventId", ensureAuthenticated, async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const deletedEvent = await Event.findByIdAndDelete(eventId);

    if (!deletedEvent) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res
      .status(500)
      .json({ error: "An error occurred while trying to delete the event" });
  }
});

// Route to render the form for adding a growth log
router.get(
  "/pets/:petId/growthLog/new",
  ensureAuthenticated,
  async (req, res) => {
    const petId = req.params.petId;
    try {
      const pet = await Pet.findById(petId).lean();
      if (!pet || pet.owner.toString() !== req.session.user._id) {
        return res.status(404).send("Pet not found or unauthorized");
      }
      res.render("add_growth_log", {
        title: `Add Growth Log for ${pet.name}`,
        pet,
      });
    } catch (error) {
      console.error("Error rendering growth log form:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

// Route to handle the submission of a new growth log
// Route to display the growth log and handle adding new entries
router.get("/pets/:petId/growthLog", ensureAuthenticated, async (req, res) => {
  try {
    const pet = await Pet.findOne({
      _id: req.params.petId,
      owner: req.session.user._id,
    }).lean();

    if (!pet) {
      return res.status(404).render("error_page", {
        title: "Error",
        message: "Pet not found.",
      });
    }

    // Convert growth log photos stored as Buffers to base64 strings
    pet.growthLog.forEach((log) => {
      if (log.photos && log.photos.length) {
        log.photoUrls = log.photos.map(
          (photoBuffer) =>
            `data:image/jpeg;base64,${photoBuffer.toString("base64")}`
        );
      }
    });

    res.render("growthLog", {
      title: `${pet.name}'s Growth Log`,
      pet: pet,
    });
  } catch (error) {
    console.error("Error fetching growth log:", error);
    res.status(500).render("error_page", {
      title: "Error",
      message:
        "There was an issue fetching the growth log. Please try again later.",
    });
  }
});

router.post(
  "/pets/:petId/growthLog/add",
  ensureAuthenticated,
  async (req, res) => {
    try {
      const petId = req.params.petId;
      const { weight, height, note, measureDate } = req.body;

      // Find the pet by ID and update its growth log
      const pet = await Pet.findById(petId);
      if (!pet) {
        return res
          .status(404)
          .render("error_page", { title: "Error", message: "Pet not found" });
      }

      // Add the new growth log entry
      pet.growthLog.push({
        weight: parseFloat(weight),
        height: parseFloat(height),
        note: note,
        measureDate: measureDate,
      });

      await pet.save();

      // Redirect back to the growth log page
      res.redirect(`/pets/${petId}/growthLog`);
    } catch (error) {
      console.error("Error adding growth log:", error);
      res.status(500).render("error_page", {
        title: "Error",
        message:
          "There was an issue adding the growth log. Please try again later.",
      });
    }
  }
);

router.post(
  "/pets/:petId/growthLog/:logId/delete",
  ensureAuthenticated,
  async (req, res) => {
    try {
      const petId = req.params.petId;
      const logId = req.params.logId;

      // Find the pet by ID and remove the specific growth log entry
      const pet = await Pet.findByIdAndUpdate(
        petId,
        { $pull: { growthLog: { _id: logId } } },
        { new: true }
      );

      if (!pet) {
        return res
          .status(404)
          .render("error_page", { title: "Error", message: "Pet not found" });
      }

      // Redirect back to the growth log page
      res.redirect(`/pets/${petId}/growthLog`);
    } catch (error) {
      console.error("Error deleting growth log:", error);
      res.status(500).render("error_page", {
        title: "Error",
        message:
          "There was an issue deleting the growth log. Please try again later.",
      });
    }
  }
);

module.exports = router;
