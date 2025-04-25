const express = require("express");
const fs = require("fs").promises;
const cors = require("cors");
const path = require("path");

const app = express();
const port = 5000;

// Middleware
app.use(cors());
// Increase payload size limit to 100MB to handle image data
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// File paths
const categoriesFile = path.join(__dirname, "categories.json");
const recipesFile = path.join(__dirname, "recipes.json");
const commentsFile = path.join(__dirname, "comments.json");
const likesFile = path.join(__dirname, "likes.json");
const followsFile = path.join(__dirname, "follows.json");
const usersFile = path.join(__dirname, "users.json");

// Helper functions to read/write JSON files
const readFile = async (filePath) => {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    // If file doesn't exist, return empty array
    if (err.code === 'ENOENT') {
      return [];
    }
    throw err;
  }
};

const writeFile = async (filePath, data) => {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
};

// Categories Endpoints
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await readFile(categoriesFile);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: "Failed to read categories" });
  }
});

app.post("/api/categories", async (req, res) => {
  try {
    const categories = await readFile(categoriesFile);
    const newCategory = {
      id: categories.length ? categories[categories.length - 1].id + 1 : 1,
      category: req.body.category,
    };
    categories.push(newCategory);
    await writeFile(categoriesFile, categories);
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(500).json({ error: "Failed to create category" });
  }
});

app.put("/api/categories/:id", async (req, res) => {
  try {
    const categories = await readFile(categoriesFile);
    const id = parseInt(req.params.id);
    const index = categories.findIndex((cat) => cat.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Category not found" });
    }
    categories[index] = { id, category: req.body.category };
    await writeFile(categoriesFile, categories);
    res.json(categories[index]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update category" });
  }
});

app.delete("/api/categories/:id", async (req, res) => {
  try {
    const categories = await readFile(categoriesFile);
    const id = parseInt(req.params.id);
    const updatedCategories = categories.filter((cat) => cat.id !== id);
    await writeFile(categoriesFile, updatedCategories);
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete category" });
  }
});

// Recipes Endpoints
app.get("/api/recipes", async (req, res) => {
  try {
    const recipes = await readFile(recipesFile);
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: "Failed to read recipes" });
  }
});

app.post("/api/recipes", async (req, res) => {
  try {
    const recipes = await readFile(recipesFile);
    const newRecipe = {
      id: recipes.length ? recipes[recipes.length - 1].id + 1 : 1,
      author: req.body.author,
      category: req.body.category,
      image: req.body.image,
      ingredients: req.body.ingredients,
      instruction: req.body.instruction,
      name: req.body.name,
    };
    recipes.push(newRecipe);
    await writeFile(recipesFile, recipes);
    res.status(201).json(newRecipe);
  } catch (err) {
    res.status(500).json({ error: "Failed to create recipe" });
  }
});

app.put("/api/recipes/:id", async (req, res) => {
  try {
    const recipes = await readFile(recipesFile);
    const id = parseInt(req.params.id);
    const index = recipes.findIndex((recipe) => recipe.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    recipes[index] = { id, ...req.body };
    await writeFile(recipesFile, recipes);
    res.json(recipes[index]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update recipe" });
  }
});

app.delete("/api/recipes/:id", async (req, res) => {
  try {
    const recipes = await readFile(recipesFile);
    const id = parseInt(req.params.id);
    const updatedRecipes = recipes.filter((recipe) => recipe.id !== id);
    await writeFile(recipesFile, updatedRecipes);
    res.json({ message: "Recipe deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete recipe" });
  }
});

// Comments Endpoints
app.get("/api/comments/:recipeId", async (req, res) => {
  try {
    const comments = await readFile(commentsFile);
    const recipeComments = comments.filter(
      (comment) => comment.recipeId === req.params.recipeId
    );
    res.json(recipeComments);
  } catch (err) {
    res.status(500).json({ error: "Failed to read comments" });
  }
});

app.post("/api/comments", async (req, res) => {
  try {
    const comments = await readFile(commentsFile);
    const newComment = {
      id: `comment_${Date.now()}`,
      recipeId: req.body.recipeId,
      authorId: req.body.authorId,
      content: req.body.content,
      createdAt: new Date().toISOString(),
    };
    comments.push(newComment);
    await writeFile(commentsFile, comments);
    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ error: "Failed to create comment" });
  }
});

app.delete("/api/comments/:id", async (req, res) => {
  try {
    const comments = await readFile(commentsFile);
    const updatedComments = comments.filter(
      (comment) => comment.id !== req.params.id
    );
    await writeFile(commentsFile, updatedComments);
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

// Likes Endpoints
app.get("/api/likes/:recipeId", async (req, res) => {
  try {
    const likes = await readFile(likesFile);
    const recipeLikes = likes.filter(
      (like) => like.recipeId === req.params.recipeId
    );
    res.json(recipeLikes);
  } catch (err) {
    res.status(500).json({ error: "Failed to read likes" });
  }
});

app.post("/api/likes", async (req, res) => {
  try {
    const likes = await readFile(likesFile);
    // Check if user already liked the recipe
    const existingLike = likes.find(
      (like) => like.recipeId === req.body.recipeId && like.userId === req.body.userId
    );
    if (existingLike) {
      return res.status(400).json({ error: "User already liked this recipe" });
    }
    const newLike = {
      id: `like_${Date.now()}`,
      recipeId: req.body.recipeId,
      userId: req.body.userId,
      createdAt: new Date().toISOString(),
    };
    likes.push(newLike);
    await writeFile(likesFile, likes);
    res.status(201).json(newLike);
  } catch (err) {
    res.status(500).json({ error: "Failed to create like" });
  }
});

app.delete("/api/likes/:recipeId/:userId", async (req, res) => {
  try {
    const likes = await readFile(likesFile);
    const updatedLikes = likes.filter(
      (like) => !(like.recipeId === req.params.recipeId && like.userId === req.params.userId)
    );
    await writeFile(likesFile, updatedLikes);
    res.json({ message: "Like removed" });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove like" });
  }
});

// Follows Endpoints
app.get("/api/follows/:userId", async (req, res) => {
  try {
    const follows = await readFile(followsFile);
    const userFollows = {
      following: follows.filter((follow) => follow.followerId === req.params.userId),
      followers: follows.filter((follow) => follow.followingId === req.params.userId),
    };
    res.json(userFollows);
  } catch (err) {
    res.status(500).json({ error: "Failed to read follows" });
  }
});

app.post("/api/follows", async (req, res) => {
  try {
    const follows = await readFile(followsFile);
    // Check if already following
    const existingFollow = follows.find(
      (follow) => 
        follow.followerId === req.body.followerId && 
        follow.followingId === req.body.followingId
    );
    if (existingFollow) {
      return res.status(400).json({ error: "Already following this user" });
    }
    const newFollow = {
      id: `follow_${Date.now()}`,
      followerId: req.body.followerId,
      followingId: req.body.followingId,
      createdAt: new Date().toISOString(),
    };
    follows.push(newFollow);
    await writeFile(followsFile, follows);
    res.status(201).json(newFollow);
  } catch (err) {
    res.status(500).json({ error: "Failed to create follow" });
  }
});

app.delete("/api/follows/:followerId/:followingId", async (req, res) => {
  try {
    const follows = await readFile(followsFile);
    const updatedFollows = follows.filter(
      (follow) => 
        !(follow.followerId === req.params.followerId && 
          follow.followingId === req.params.followingId)
    );
    await writeFile(followsFile, updatedFollows);
    res.json({ message: "Unfollowed successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to unfollow" });
  }
});

// Users Endpoints
app.get("/api/users/:uid", async (req, res) => {
  try {
    const users = await readFile(usersFile);
    const user = users.find((u) => u.uid === req.params.uid);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to read user" });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const users = await readFile(usersFile);
    const existingUser = users.find((u) => u.uid === req.body.uid);
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }
    const newUser = {
      uid: req.body.uid,
      displayName: req.body.displayName,
      email: req.body.email,
      photoURL: req.body.photoURL,
      bio: req.body.bio || "",
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    await writeFile(usersFile, users);
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: "Failed to create user" });
  }
});

app.put("/api/users/:uid", async (req, res) => {
  try {
    const users = await readFile(usersFile);
    const index = users.findIndex((u) => u.uid === req.params.uid);
    if (index === -1) {
      return res.status(404).json({ error: "User not found" });
    }
    users[index] = {
      ...users[index],
      ...req.body,
      uid: users[index].uid, // Prevent uid from being changed
    };
    await writeFile(usersFile, users);
    res.json(users[index]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Search Endpoint
app.get("/api/search", async (req, res) => {
  try {
    const { query } = req.query;
    console.log('Received search query:', query);

    if (!query) {
      return res.json([]);
    }

    const recipes = await readFile(recipesFile);
    console.log('Total recipes loaded:', recipes.length);

    // Normalize search terms: trim, remove extra spaces, lowercase
    const searchTerms = query.toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(term => term.length > 0);

    console.log('Search terms:', searchTerms);
    
    const results = recipes.filter(recipe => {
      // Create searchable text with all recipe fields
      const searchableText = [
        recipe.name,
        recipe.author,
        recipe.category,
        ...(recipe.ingredients || []),
        recipe.instruction
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      
      // For exact matches (e.g., full recipe name)
      if (searchableText.includes(query.toLowerCase())) {
        return true;
      }

      // For partial matches (individual terms)
      return searchTerms.every(term => searchableText.includes(term));
    });

    console.log(`Found ${results.length} matches for "${query}"`);
    res.json(results);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: "Failed to search recipes" });
  }
});

// Suggestions endpoint
app.get("/api/suggestions", async (req, res) => {
  try {
    const { query } = req.query;
    console.log('Received suggestion query:', query);

    const recipes = await readFile(recipesFile);

    if (!query) {
      const suggestions = recipes.slice(0, 4).map(r => ({
        id: r.id,
        name: r.name,
        category: r.category
      }));
      return res.json(suggestions);
    }

    const normalizedQuery = query.toLowerCase().trim();
    
    const suggestions = recipes
      .filter(recipe => {
        // Check for matches in name (prioritize)
        if (recipe.name.toLowerCase().includes(normalizedQuery)) {
          return true;
        }
        
        // Check category
        if (recipe.category.toLowerCase().includes(normalizedQuery)) {
          return true;
        }
        
        // Check ingredients
        if (recipe.ingredients.some(ing => 
          ing.toLowerCase().includes(normalizedQuery)
        )) {
          return true;
        }

        // Check instruction
        if (recipe.instruction.toLowerCase().includes(normalizedQuery)) {
          return true;
        }

        return false;
      })
      .slice(0, 4)
      .map(r => ({
        id: r.id,
        name: r.name,
        category: r.category
      }));

    console.log(`Found ${suggestions.length} suggestions for "${query}"`);
    res.json(suggestions);
  } catch (err) {
    console.error('Suggestions error:', err);
    res.status(500).json({ error: "Failed to get suggestions" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});